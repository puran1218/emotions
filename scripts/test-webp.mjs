#!/usr/bin/env node
import assert from 'node:assert/strict';
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
checkArt();
console.log('OK: binary header validation and WebP release boundary tests.');
