#!/usr/bin/env node
// Simulate the production SVG URL in the existing Canvas PNG pipeline without
// changing a canonical concept or publishing draft artwork.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'static/emotions/share-image.js'),'utf8');
new vm.Script(source);
const joy=JSON.parse(fs.readFileSync(path.join(root,'static/emotions/data/emotions.json'),'utf8')).entries.find(x=>x.id==='joy');
assert.ok(joy);
const candidate={...joy,illustration:{src:'./images/joy-v01.svg',stage:'draft'}};
const imageUrls=[],drawing=[],canvases=[];
const ctx={
  beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fill(){},stroke(){},fillRect(){},
  fillText(text){drawing.push({text})},
  drawImage(image){drawing.push({imageSrc:image.src})},
  measureText(text){return {width:String(text).length*17}},
  set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},set textBaseline(v){},set font(v){}
};
const document={
  baseURI:'https://blog.example/emotions/',
  createElement(type){
    assert.equal(type,'canvas');
    const canvas={width:0,height:0,getContext(){return ctx},toBlob(cb){cb({size:1234,type:'image/png'})}};
    canvases.push(canvas);return canvas;
  }
};
class FakeImage{
  width=960;height=640;
  set src(url){this._src=url;imageUrls.push(url);queueMicrotask(()=>this.onload?.());}
  get src(){return this._src;}
}
class FakeFile{constructor(parts,name,options){this.parts=parts;this.name=name;this.type=options.type;}}
const window={};
vm.runInNewContext(source,{window,document,Image:FakeImage,File:FakeFile,URL,location:{href:'https://blog.example/emotions/?word=joy'},Math,Promise,setTimeout});
const png=await window.EmoLexShareImage.prepare(candidate,'zh');
assert.equal(png.name,'emolex-joy-zh.png');
assert.equal(png.type,'image/png');
assert.ok(imageUrls.includes('https://blog.example/emotions/images/joy-v01.svg'),'SVG source must resolve relative to deployed /emotions/');
assert.ok(drawing.some(x=>x.imageSrc?.endsWith('/joy-v01.svg')),'SVG needs to be drawn into the PNG canvas');
assert.ok(drawing.some(x=>x.text===joy.definition.zh),'bilingual share card must still draw emotion definitions');
assert.ok(drawing.some(x=>x.text?.includes('喜悦')),'PNG must include chosen-language headword');
assert.ok(canvases[0].height>=1200);
assert.equal(joy.illustration.src,'./images/feeling-placeholder.svg','this test must not publish candidate art');
console.log('OK: Joy SVG candidate is compatible with mocked Canvas PNG sharing, language text and micro.blog relative URL.');
