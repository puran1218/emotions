#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseWebP} from './check-webp.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const manifestPath=path.join(root,'art/manifest.json');
const outputDir=path.join(root,'static/emotions/images');
const MAX_FILE=180*1024, MAX_TOTAL=30*1024*1024;

export function argsOf(argv){
  const o={dryRun:false};
  const switches=new Set(['--dry-run','--help','-h']);
  const values=new Set(['--id','--file','--version','--batch','--map','--report']);
  for(let i=0;i<argv.length;i++){
    const v=argv[i];
    if(switches.has(v)){o[v==='--dry-run'?'dryRun':'help']=true;continue;}
    if(!values.has(v)||!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Missing or unknown argument: '+v);
    o[v.slice(2)]=argv[++i];
  }
  if(o.help)return {help:true};
  if(Boolean(o.batch)===Boolean(o.id))throw Error('Choose either --batch <folder> or --id <concept-id> --file <webp>');
  if(o.batch){
    if(o.file||o.version||o.id)throw Error('Do not mix --batch with single-file options');
  }else if(!o.file||!o.id)throw Error('Single mode requires --id and --file');
  if(o.map&&!o.batch)throw Error('--map can only accompany --batch');
  if(o.id&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.id))throw Error('Invalid concept id');
  if(o.version&&!/^\d{2}$/.test(o.version))throw Error('Version must be two digits');
  return o;
}
const saneId=id=>typeof id==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
const saneVersion=v=>typeof v==='string'&&/^\d{2}$/.test(v);
const safeInside=(folder,name)=>{
  if(typeof name!=='string'||!name||path.isAbsolute(name))throw Error('Batch file path must be relative to batch folder');
  const file=path.resolve(folder,name);
  if(!file.startsWith(path.resolve(folder)+path.sep))throw Error('Batch source escapes the selected folder: '+name);
  if(!file.endsWith('.webp'))throw Error('Only .webp batch files are accepted: '+name);
  const real=fs.realpathSync(file);
  if(!real.startsWith(fs.realpathSync(folder)+path.sep))throw Error('Symlink source escapes batch folder: '+name);
  return real;
};
const findWebps=(dir,prefix='')=>{
  return fs.readdirSync(path.join(dir,prefix),{withFileTypes:true}).flatMap(ent=>{
    const next=path.join(prefix,ent.name);
    if(ent.isDirectory())return findWebps(dir,next);
    if(ent.isFile()&&ent.name.endsWith('.webp'))return [next];
    return [];
  }).sort();
};
function sourceRows(options){
  if(options.batch){
    const folder=path.resolve(options.batch);
    if(!fs.statSync(folder).isDirectory())throw Error('--batch must be an existing folder');
    const mapping=options.map?JSON.parse(fs.readFileSync(path.resolve(options.map),'utf8')):null;
    const entries=Array.isArray(mapping)?mapping:mapping?.entries;
    if(options.map&&!Array.isArray(entries))throw Error('batch.json must be an array or {entries:[...]}');
    const rows=options.map?entries:findWebps(folder).map(file=>{
      const name=path.basename(file,'.webp');
      const match=/^([a-z0-9]+(?:-[a-z0-9]+)*?)(?:-v(\d{2}))?$/.exec(name);
      if(!match)throw Error('Cannot infer canonical ID from '+file+'; use --map');
      return {id:match[1],file,version:match[2]||'01'};
    });
    if(!rows.length)throw Error('No artwork candidates found in batch');
    if(options.map){
      const found=findWebps(folder);
      const described=new Set(rows.map(x=>x.file));
      for(const file of found)if(!described.has(file))throw Error('Unmapped WebP candidate in batch: '+file);
    }
    return rows.map(r=>({...r,version:r.version||'01',source:safeInside(folder,r.file)}));
  }
  return [{id:options.id,version:options.version||'01',file:options.file,source:path.resolve(options.file)}];
}

export function planStage(options){
  const rows=sourceRows(options);
  const canonical=[...read('data/concepts/pilot.json'),...read('data/concepts/legacy-expanded.json')];
  const dictionary=new Map(canonical.map(x=>[x.id,x]));
  const manifest=read('art/manifest.json');
  assert.ok(Array.isArray(manifest.assets));
  const ids=new Set(),files=new Set(),candidates=[];
  let totalExisting=0;
  for(const file of fs.readdirSync(outputDir).filter(x=>x.endsWith('.webp'))){
    totalExisting+=fs.statSync(path.join(outputDir,file)).size;
  }
  for(const row of rows){
    if(!saneId(row.id))throw Error('Invalid canonical concept ID: '+row.id);
    if(!saneVersion(row.version))throw Error('Invalid two-digit revision for '+row.id);
    if(ids.has(row.id))throw Error('Duplicate concept in the same batch: '+row.id);
    ids.add(row.id);
    const concept=dictionary.get(row.id);
    if(!concept)throw Error('Unknown canonical concept: '+row.id);
    if(concept.status==='draft'||concept.status==='retired')throw Error('Withheld concept may not be staged: '+row.id);
    if(concept.illustration?.stage==='approved')throw Error('Already-approved artwork cannot be replaced by staging: '+row.id);
    const current=manifest.assets.find(x=>x.concept_id===row.id);
    if(current?.stage==='approved'||current?.approved===true)throw Error('Approved manifest entry cannot be overwritten: '+row.id);
    if(!fs.existsSync(row.source)||!row.source.endsWith('.webp'))throw Error('Missing source .webp for '+row.id);
    const buffer=fs.readFileSync(row.source),dims=parseWebP(buffer);
    if(buffer.length>MAX_FILE)throw Error(row.id+' exceeds 180KiB WebP hard limit');
    if(![960,1200].includes(dims.width)||dims.height*3!==dims.width*2)throw Error(row.id+' must be 960x640 or 1200x800');
    const filename=row.id+'-v'+row.version+'.webp';
    const dest=path.join(outputDir,filename);
    if(fs.existsSync(dest)||files.has(filename))throw Error('Image already exists: '+filename+'; use a new revision');
    files.add(filename);
    candidates.push({
      id:row.id,version:row.version,source:row.source,dest,filename,bytes:buffer.length,
      dims:{width:dims.width,height:dims.height},file:'static/emotions/images/'+filename,
      canonicalScene:concept.scenario
    });
    totalExisting+=buffer.length;
  }
  if(totalExisting>MAX_TOTAL)throw Error('Batch would exceed the total 30MiB art budget');
  return {candidates,manifest,bytesAfter:totalExisting};
}

function stagedManifest(plan){
  const result=structuredClone(plan.manifest);
  for(const c of plan.candidates){
    let entry=result.assets.find(x=>x.concept_id===c.id);
    if(!entry){entry={concept_id:c.id};result.assets.push(entry);}
    entry.file=c.file;
    entry.format='webp';
    entry.stage='draft';
    entry.approved=false;
    entry.status='visual-review-pending';
    entry.dimensions=c.dims;
    entry.bytes=c.bytes;
    entry.scene=c.canonicalScene;
    entry.review={semantic:'pending',visual:'pending',character_consistency:'pending',thumbnail:'pending',share_png:'pending',microblog:'pending'};
    entry.note='Candidate only. Confirm the visible moment matches the canonical bilingual scene before any publication.';
  }
  return result;
}
export function stage(options){
  const plan=planStage(options);
  const report={
    mode:options.dryRun?'dry-run':'staged',
    count:plan.candidates.length,
    bytesAfter:plan.bytesAfter,
    candidates:plan.candidates.map(({id,version,filename,bytes,dims,canonicalScene})=>({id,version,filename,bytes,dimensions:dims,canonicalScene})),
    publicationStatus:'review-pending; canonical illustration.src remains unchanged'
  };
  if(options.dryRun){console.log(JSON.stringify(report,null,2));return report;}
  const copied=[];
  const temp=manifestPath+'.art-stage-'+process.pid;
  try{
    for(const c of plan.candidates){
      fs.copyFileSync(c.source,c.dest,fs.constants.COPYFILE_EXCL);
      copied.push(c.dest);
    }
    fs.writeFileSync(temp,JSON.stringify(stagedManifest(plan),null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,manifestPath);
  }catch(error){
    for(const file of copied)fs.rmSync(file,{force:true});
    fs.rmSync(temp,{force:true});
    throw error;
  }
  console.log(JSON.stringify(report,null,2));
  if(options.report){
    const dest=path.resolve(options.report);
    fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  }
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const opts=argsOf(process.argv.slice(2));
    if(opts.help)console.log('Single: npm run art:stage -- --id joy --file /tmp/joy.webp [--version 01]\nBatch: npm run art:stage -- --batch ./artwork --map ./artwork/batch.json [--dry-run] [--report /tmp/stage-report.json]');
    else stage(opts);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
