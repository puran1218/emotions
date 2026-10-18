#!/usr/bin/env node
// Stage a local WebP as an unapproved EmoLex art candidate, never auto-publish.
// Usage: npm run art:stage -- --id curious --file /tmp/curious.webp --version 01
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseWebP} from './check-webp.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
export function argsOf(argv){
  const o={};
  for(let i=0;i<argv.length;i++){
    const v=argv[i];
    if(v==='--help'||v==='-h')return {help:true};
    if(!['--id','--file','--version'].includes(v)||!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Unknown or missing option: '+v);
    o[v.slice(2)]=argv[++i];
  }
  if(!o.id||!o.file)throw Error('Required: --id <concept-id> --file <local.webp> [--version 01]');
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.id))throw Error('Invalid concept id');
  if(!/^[0-9]{2}$/.test(o.version??'01'))throw Error('--version must have two digits, e.g. 01');
  return {...o,version:o.version||'01'};
}
export function plannedStage(args){
  const pilots=read('data/concepts/pilot.json'),legacy=read('data/concepts/legacy-expanded.json');
  const concept=[...pilots,...legacy].find(x=>x.id===args.id);
  if(!concept)throw Error('Unknown canonical concept: '+args.id);
  if(concept.status==='draft')throw Error('Concept withheld for meaning review: '+args.id);
  if(concept.illustration.stage==='approved')throw Error('Already approved art; do not replace it through a staging command');
  const filePath=path.resolve(args.file);
  if(!fs.existsSync(filePath)||path.extname(filePath).toLowerCase()!=='.webp')throw Error('Source must be an existing .webp');
  const buffer=fs.readFileSync(filePath),dimensions=parseWebP(buffer);
  if(dimensions.height*3!==dimensions.width*2 || ![960,1200].includes(dimensions.width))throw Error('Expected 960x640 or 1200x800 WebP, 3:2');
  if(buffer.length>180*1024)throw Error('WebP exceeds the 180KiB production budget');
  const name=args.id+'-v'+args.version+'.webp';
  const target=path.join(root,'static/emotions/images',name);
  if(fs.existsSync(target))throw Error('Target already exists: '+target+'; use a new version instead');
  const manifest=read('art/manifest.json');
  const registered=manifest.assets.find(a=>a.concept_id===args.id);
  if(registered?.approved||registered?.stage==='approved')throw Error('Approved art cannot be replaced through staging');
  return {concept,buffer,target,name,dimensions,manifest,registered,releasePath:'static/emotions/images/'+name};
}
export function stageCandidate(args){
  const {concept,buffer,target,name,dimensions,manifest,registered,releasePath}=plannedStage(args);
  const asset=registered||{concept_id:concept.id};
  if(!registered)manifest.assets.push(asset);
  asset.file=releasePath;
  asset.format='webp';
  asset.stage='draft';
  asset.approved=false;
  asset.status='visual-review-pending';
  asset.dimensions={width:dimensions.width,height:dimensions.height};
  asset.bytes=buffer.length;
  asset.scene={...concept.scenario};
  asset.review={semantic:'pending',visual:'pending',character_consistency:'pending',thumbnail:'pending',share_png:'pending',microblog:'pending'};
  asset.note='Review candidate only. Check the actual picture matches this canonical scene before publishing; stage does not change illustration.src or approve artwork.';
  // Validate serializable state in memory before any write.
  const result=JSON.stringify(manifest,null,2)+'\n';
  fs.writeFileSync(target,buffer,{flag:'wx'});
  try{fs.writeFileSync(path.join(root,'art/manifest.json'),result,'utf8');}
  catch(err){fs.unlinkSync(target);throw err;}
  console.log('Staged '+name+' ('+buffer.length+' bytes, '+dimensions.width+'x'+dimensions.height+').');
  console.log('Canonical scene EN: '+concept.scenario.en);
  console.log('Canonical scene ZH: '+concept.scenario.zh);
  console.log('Status: visual-review-pending; no dictionary illustration reference changed.');
  console.log('Next: npm run art:check && npm test; inspect art in Safari before publication.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=argsOf(process.argv.slice(2));
    if(args.help)console.log('npm run art:stage -- --id <concept-id> --file /path/to/reviewed.webp [--version 01]');
    else stageCandidate(args);
  }catch(e){console.error(e.message);process.exitCode=1;}
}
