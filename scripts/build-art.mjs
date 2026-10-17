#!/usr/bin/env node
// The published illustration is derived from this source, never hand-edited.
// Future scenes can be added to this registry after scene-specific review.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderJoy } from '../art/scenes/joy.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const scenes=[{id:'joy',name:'joy-v01.svg',render:renderJoy}];
const check=process.argv.includes('--check');
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))for(const scene of scenes){
  const filename=path.join(root,'static/emotions/images',scene.name);
  const content=scene.render();
  if(check){
    if(!fs.existsSync(filename)||fs.readFileSync(filename,'utf8')!==content)
      throw Error(scene.id+': generated SVG differs from source; run npm run art:build');
  }else{
    fs.writeFileSync(filename,content,'utf8');
  }
  console.log((check?'Verified ':'Built ')+scene.name+' ('+Buffer.byteLength(content)+' bytes)');
}
