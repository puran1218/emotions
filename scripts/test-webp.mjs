#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseWebP,checkArt} from './check-webp.mjs';

function riffVP8(width,height){
  const b=Buffer.alloc(30);
  b.write('RIFF',0,'ascii');b.writeUInt32LE(22,4);
  b.write('WEBP',8,'ascii');b.write('VP8 ',12,'ascii');b.writeUInt32LE(10,16);
  b[23]=0x9d;b[24]=0x01;b[25]=0x2a;
  b.writeUInt16LE(width,26);b.writeUInt16LE(height,28);
  return b;
}
function riffVP8X(width,height){
  const b=Buffer.alloc(30);b.write('RIFF',0,'ascii');b.writeUInt32LE(22,4);
  b.write('WEBP',8,'ascii');b.write('VP8X',12,'ascii');b.writeUInt32LE(10,16);
  b.writeUIntLE(width-1,24,3);b.writeUIntLE(height-1,27,3);
  return b;
}
for(const [w,h] of [[960,640],[1200,800]]){
  assert.deepEqual(parseWebP(riffVP8(w,h)),{width:w,height:h,fourcc:'VP8 '});
  assert.deepEqual(parseWebP(riffVP8X(w,h)),{width:w,height:h,fourcc:'VP8X'});
}
assert.throws(()=>parseWebP(Buffer.alloc(30)),/RIFF/);
const invalidSize=riffVP8(960,640);invalidSize.writeUInt32LE(199,4);
assert.throws(()=>parseWebP(invalidSize),/byte count/);
const badFrame=riffVP8(960,640);badFrame[23]=0;
assert.throws(()=>parseWebP(badFrame),/keyframe/);
const roadmap=JSON.parse(fs.readFileSync('art/review-batches/roadmap.json','utf8'));
const dictionary=JSON.parse(fs.readFileSync('static/emotions/data/emotions.json','utf8')).entries;
const allIds=roadmap.batches.flatMap(batch=>{
  assert.equal(batch.conceptIds.length,5,'Every art review batch must contain five exact word-sense IDs');
  return batch.conceptIds;
});
assert.equal(roadmap.batchSize,5);
assert.equal(roadmap.totalBatches,45);
assert.equal(roadmap.batches.length,45);
assert.deepEqual(allIds,dictionary.map(item=>item.id),'Illustration rollout roadmap must match all 225 visible dictionary senses');
assert.equal(new Set(allIds).size,225);
const batch01=JSON.parse(fs.readFileSync('art/review-batches/pilot-01.json','utf8'));
assert.deepEqual(batch01.entries.map(x=>x.id),roadmap.batches[0].conceptIds);
assert.ok(batch01.entries.every(x=>x.review.finalApproval===false&&x.review.semantic==='pending'));
checkArt();
console.log('OK: binary header validation and WebP release boundary tests.');
