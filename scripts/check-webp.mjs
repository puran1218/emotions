#!/usr/bin/env node
// Zero-dependency production-art gate. Does NOT pretend to judge illustration quality.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('art/manifest.json');
const pilots=read('data/concepts/pilot.json');
const expanded=read('data/concepts/legacy-expanded.json');
const runtime=read('static/emotions/data/emotions.json');
const all=[...pilots,...expanded];
const byId=new Map(all.map(e=>[e.id,e]));
const pathRoot=path.join(root,'static/emotions/images');
const MAX_BYTES=180*1024, IDEAL_BYTES=120*1024, MAX_TOTAL=30*1024*1024;
const imageFiles=fs.readdirSync(pathRoot).filter(x=>x.endsWith('.webp'));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
export function parseWebP(buffer) {
  assert(buffer.length>=30,'Incomplete WebP file');
  assert(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP','Invalid WebP RIFF signature');
  const expectedSize=buffer.readUInt32LE(4)+8;
  assert(expectedSize===buffer.length,'WebP RIFF byte count mismatch');
  const fourcc=buffer.toString('ascii',12,16);
  let width,height;
  if(fourcc==='VP8 '){
    assert(buffer.length>=30 && buffer[23]===0x9d && buffer[24]===0x01 && buffer[25]===0x2a,'Invalid VP8 keyframe marker');
    width=buffer.readUInt16LE(26)&0x3fff;
    height=buffer.readUInt16LE(28)&0x3fff;
  } else if(fourcc==='VP8L'){
    assert(buffer.length>=25 && buffer[20]===0x2f,'Invalid VP8L signature');
    const bits=buffer.readUInt32LE(21);
    width=1+(bits&0x3fff);
    height=1+((bits>>>14)&0x3fff);
  } else if(fourcc==='VP8X'){
    assert(buffer.length>=30,'Invalid extended WebP');
    width=1+buffer.readUIntLE(24,3);
    height=1+buffer.readUIntLE(27,3);
  } else throw new Error('Unsupported WebP image chunk '+fourcc);
  assert(width>0&&height>0&&width<=16384&&height<=16384,'Implausible image dimensions');
  return {width,height,fourcc};
}
export function checkArt(){
  let total=0;
  const artifacts=new Map();
  for(const file of imageFiles){
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*-v\d\d\.webp$/.test(file),'Invalid WebP filename '+file);
    const data=fs.readFileSync(path.join(pathRoot,file));
    const dims=parseWebP(data); const bytes=data.length;
    assert(bytes<=MAX_BYTES, file+' exceeds 180KiB budget');
    assert([960,1200].includes(dims.width)&&dims.height*3===dims.width*2,file+' must be 960×640 or 1200×800, 3:2');
    total+=bytes;
    artifacts.set('static/emotions/images/'+file,{...dims,bytes});
    console.log(file+': '+bytes+' bytes ('+(bytes>IDEAL_BYTES?'above preferred':'preferred')+' budget)');
  }
  assert(total<=MAX_TOTAL,'Illustration assets exceed 30MiB site budget');
  const knownAssets=new Map();
  for(const a of manifest.assets){
    assert(!knownAssets.has(a.concept_id),'Duplicate art asset '+a.concept_id);
    knownAssets.set(a.concept_id,a);
    if(a.file){
      assert(a.format==='webp','Concept illustrations must use WebP');
      assert(artifacts.has(a.file),'Manifest references missing artwork '+a.file);
    }
  }
  for(const [file] of artifacts){
    assert(manifest.assets.some(a=>a.file===file),'Orphan WebP file not registered in art/manifest.json: '+file);
  }
  for(const item of all){
    const src=item.illustration.src;
    if(!src.endsWith('.webp'))continue;
    assert(item.illustration.stage==='approved' && item.review.illustration==='approved','Unapproved canonical illustration '+item.id);
    const file='static/emotions/'+src.slice(2);
    assert(artifacts.has(file),'Canonical illustration missing '+file);
    const asset=knownAssets.get(item.id);
    assert(asset?.file===file && asset.stage==='approved' && asset.approved===true,'Manifest and canonical approval do not agree '+item.id);
    assert(item.illustration.alt.en?.length>8 && item.illustration.alt.zh?.length>3,'Missing bilingual actual-image alt '+item.id);
  }
  for(const item of runtime.entries){
    const itemSrc=item.illustration.src;
    if(!itemSrc.endsWith('.webp'))continue;
    assert(artifacts.has('static/emotions/'+itemSrc.slice(2)),'Runtime missing WebP '+item.id);
    assert(byId.get(item.id)?.illustration.src===itemSrc,'Runtime not projected from canonical art '+item.id);
  }
  console.log('OK: '+imageFiles.length+' published-candidate WebP files, '+total+' bytes; all references and approval boundaries consistent.');
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))checkArt();
