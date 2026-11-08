#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {argsOf,planStage,stage} from './stage-webp.mjs';

assert.deepEqual(argsOf(['--id','joy','--file','/tmp/joy.webp']),{dryRun:false,id:'joy',file:'/tmp/joy.webp'});
assert.deepEqual(argsOf(['--batch','/tmp/batch','--map','/tmp/batch/batch.json','--dry-run']),{
  dryRun:true,batch:'/tmp/batch',map:'/tmp/batch/batch.json'
});
assert.deepEqual(argsOf(['--help']),{help:true});
assert.throws(()=>argsOf(['--id','joy']),/Single mode/);
assert.throws(()=>argsOf(['--batch','/tmp/art','--id','joy','--file','/tmp/a.webp']),/Choose either|mix/);
assert.throws(()=>argsOf(['--batch','/tmp/art','--version','01']),/mix/);
assert.throws(()=>argsOf(['--id','bad\/word','--file','/tmp/a.webp']),/Invalid concept id/);
assert.throws(()=>argsOf(['--id','joy','--file','/tmp/a.webp','--version','2']),/two digits/);
assert.throws(()=>planStage(argsOf(['--id','unknown-utterance','--file','/tmp/a.webp'])),/Unknown canonical concept/);
assert.throws(()=>planStage(argsOf(['--id','aroused','--file','/tmp/a.webp'])),/Withheld concept/);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'emolex-batch-stage-test-'));
try{
  fs.mkdirSync(path.join(temp,'images'));
  function mockWebP(){
    const b=Buffer.alloc(30);
    b.write('RIFF',0,'ascii');b.writeUInt32LE(22,4);
    b.write('WEBP',8,'ascii');b.write('VP8 ',12,'ascii');b.writeUInt32LE(10,16);
    b[23]=0x9d;b[24]=0x01;b[25]=0x2a;
    b.writeUInt16LE(960,26);b.writeUInt16LE(640,28);
    return b;
  }
  for(const id of ['joy','frustration'])fs.writeFileSync(path.join(temp,'images',id+'-v01.webp'),mockWebP());
  const map={version:1,entries:[
    {id:'joy',file:'images/joy-v01.webp',version:'01'},
    {id:'frustration',file:'images/frustration-v01.webp',version:'01'}
  ]};
  fs.writeFileSync(path.join(temp,'batch.json'),JSON.stringify(map));
  const o=argsOf(['--batch',temp,'--map',path.join(temp,'batch.json'),'--dry-run']);
  const before=fs.readFileSync('art/manifest.json','utf8');
  const plan=planStage(o);
  assert.equal(plan.candidates.length,2);
  const report=stage(o);
  assert.equal(report.count,2);
  assert.equal(report.mode,'dry-run');
  assert.deepEqual(fs.readFileSync('art/manifest.json','utf8'),before,'dry-run may not change the manifest');
  const strange=path.join(temp,'images','unmapped-v01.webp');
  fs.writeFileSync(strange,mockWebP());
  assert.throws(()=>planStage(o),/Unmapped WebP/);
  fs.rmSync(strange);
  map.entries[1].id='aroused';
  fs.writeFileSync(path.join(temp,'batch.json'),JSON.stringify(map));
  assert.throws(()=>planStage(o),/Withheld concept/);
  map.entries[1].id='joy';
  fs.writeFileSync(path.join(temp,'batch.json'),JSON.stringify(map));
  assert.throws(()=>planStage(o),/Duplicate concept/);
  map.entries[1].id='frustration';
  map.entries[1].file='../escaped.webp';
  fs.writeFileSync(path.join(temp,'batch.json'),JSON.stringify(map));
  assert.throws(()=>planStage(o),/escapes the selected folder/);
  console.log('OK: single and batch CLI validation, true dry-run, duplicate/withheld safety and path traversal checks.');
}finally{
  fs.rmSync(temp,{force:true,recursive:true});
}
