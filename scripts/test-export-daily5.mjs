#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const entries=JSON.parse(read('static/emotions/data/emotions.json')).entries;
const overlay=JSON.parse(read('static/emotions/data/closer-experiment.json'));
const lessons=JSON.parse(read('static/emotions/data/daily5.json'));
const exportJs=read('static/emotions/export-entry.js');
const practiceJs=read('static/emotions/practice.js');
const appJs=read('static/emotions/app.js');
const index=read('static/emotions/index.html');
const practiceHtml=read('static/emotions/practice.html');
const css=read('static/emotions/practice.css');
new vm.Script(exportJs);new vm.Script(practiceJs);new vm.Script(appJs);
assert.ok(index.includes('./export-entry.js'));
assert.ok(appJs.includes('data-action="export-entry"'));
assert.ok(appJs.includes('data-action="export-library"'));
assert.ok(appJs.includes('Daily 5 · 每日五分钟'));
assert.ok(practiceHtml.includes('./practice.js')&&practiceHtml.includes('./practice.css'));
assert.ok(css.includes('.daily-progress')&&css.includes('@media(max-width:600px)'));
assert.equal(lessons.items.length,14);
assert.equal(lessons.status,'curated-practice-proposals-not-human-approved');

const downloads=[];
class MockURL extends URL{
  static createObjectURL(){return 'blob:temporary-practice';}
  static revokeObjectURL(){}
}
const madeWindow={};
const doc={
  baseURI:'https://example.org/emotions/',
  body:{appendChild(){}},
  createElement(tag){
    assert.equal(tag,'a');
    return {click(){downloads.push(this.download)},remove(){}};
  }
};
vm.runInNewContext(exportJs,{window:madeWindow,document:doc,URL:MockURL,Blob,console,setTimeout});
const joy=entries.find(e=>e.id==='joy');
const insight=overlay.comparisons.find(x=>x.id==='joy');
const e=madeWindow.EmoLexExportEntry;
const full=e.markdown(joy,'zh',insight,entries,doc.baseURI);
for(const sentence of joy.say)assert.ok(full.includes(sentence.en)&&full.includes(sentence.zh),'Every bilingual spoken example must be exported');
assert.ok(full.includes(joy.definition.zh)&&full.includes(joy.scene.en));
assert.ok(full.includes(joy.word.feelingEn)&&full.includes(joy.word.feelingZh),'Entry export keeps feeling forms');
assert.ok(full.includes('**Emoji / 情绪符号:**'),'Entry export retains a canonical symbol');
assert.ok(full.includes(insight.takeaway.en)&&full.includes(insight.takeaway.zh));
assert.ok(full.includes('## A Little Closer')&&full.includes('## Related feelings'));
assert.ok(full.includes('images/feeling-placeholder.svg'),'Image link to same-origin current asset');
const saved=JSON.parse(e.libraryJSON(entries,new Map(overlay.comparisons.map(c=>[c.id,c]))));
assert.equal(saved.count,225);
assert.equal(saved.entries.length,225);
assert.ok(saved.entries.every(x=>x.say.length===3&&x.closer));
assert.equal(saved.status,'editorial-preview-not-human-approved');
e.download(full,'joy-full.md','text/markdown');
assert.ok(downloads.includes('joy-full.md'));
const noImage={...joy,illustration:{src:'https://not-trusted.example/image.png'}};
assert.ok(!e.markdown(noImage,'en',null,entries,doc.baseURI).includes('not-trusted.example'),'Do not export unsafe illustration URLs');

const handlers={};
const rendered={innerHTML:''},status={textContent:''};
const store=new Map();
const location={href:'https://example.org/emotions/practice.html?word=loneliness'};
const speech=[];
const practiceDocument={
  body:{appendChild(){}},
  title:'',
  getElementById(id){return id==='practice-root'?rendered:id==='practice-status'?status:null;},
  createElement(){return{click(){downloads.push(this.download)},remove(){}}},
  addEventListener(type,cb){handlers[type]=cb;}
};
const window={
  speechSynthesis:{cancel(){},speak(u){speech.push(u.text);}}
};
const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}};
class SpeechSynthesisUtterance{constructor(text){this.text=text;}}
const history={replaceState(_,__,url){location.href='https://example.org/emotions/practice.html'+url;}};
vm.runInNewContext(practiceJs,{document:practiceDocument,window,localStorage,location,history,URL:MockURL,
  Blob,SpeechSynthesisUtterance,Promise,Date,console,setTimeout,
  fetch:async()=>({ok:true,json:async()=>lessons})});
await new Promise(resolve=>setImmediate(resolve));
assert.ok(rendered.innerHTML.includes('I wish someone could play with me.'));
assert.ok(!rendered.innerHTML.includes('我希望有人能陪我玩'),'Chinese hidden before step three');
const click=async(action,extra={})=>{
  handlers.click({target:{closest(){return{dataset:{dailyAction:action,...extra}};}}});
  await new Promise(resolve=>setImmediate(resolve));
};
await click('listen');
assert.ok(speech.includes('I wish someone could play with me.'));
await click('next');
await click('repeat');await click('repeat');await click('repeat');
assert.ok(rendered.innerHTML.includes('Spoken aloud: 3 / 3'));
await click('next');
assert.ok(rendered.innerHTML.includes('I wish someone could run with me.'));
assert.ok(!rendered.innerHTML.includes('我希望有人能陪我玩'),'Chinese still optional on change step');
await click('translate');
assert.ok(rendered.innerHTML.includes('我希望有人能陪我玩'));
await click('variant',{variantIndex:'1'});
assert.ok(speech.includes('I wish someone could run with me.'));
await click('next');
handlers.input({target:{id:'daily-situation',value:'I wish someone could run with me this weekend.'}});
await click('next');
handlers.input({target:{id:'daily-reflection',value:'Today I went running on my own.'}});
await click('save');
assert.equal(store.size,1,'Personal notes saved only after explicit click');
await click('download');
assert.ok(downloads.some(x=>x.startsWith('emolex-daily5-')&&x.endsWith('-loneliness.md')));
await click('another');
assert.ok(rendered.innerHTML.includes('Can you help me try again?'),'Next curated practice card is available');
assert.equal(lessons.items[1].id,'loneliness');
assert.equal(lessons.items[2].id,'frustration');
console.log('OK: complete bilingual Markdown/full library JSON, safe illustration references, 14 curated lessons, no-translation first minutes, private writing and export.');
