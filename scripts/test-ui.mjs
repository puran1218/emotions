#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const concepts=JSON.parse(read('static/emotions/data/emotions.json')).entries;
const appJs=read('static/emotions/app.js'), shareJs=read('static/emotions/share-image.js');
new vm.Script(appJs); new vm.Script(shareJs);
const html=read('static/emotions/index.html');
const css=read('static/emotions/styles.css');
assert.ok(html.indexOf('share-image.js')<html.indexOf('app.js'),'image share must load before app');
assert.ok(!appJs.includes('bottomNav()'),'redundant bottom tabs should be removed');
assert.ok(css.includes('.emotion-card')&&css.includes('.section-label'));
assert.match(css,/\.speaking-section blockquote\{[^}]*background:#EAF1EA/,'speaking guidance should use the share-image green');
assert.ok(css.includes('@media(min-width:900px)')&&css.includes('.app-shell')&&css.includes('.app-shell[data-view="explore"] .detail-pane{display:none}'),'master-detail must adapt to mobile and wide layouts');
assert.ok(css.includes('.speaking-section{background:#E2EDE2'),'speaking guidance needs visible green section background');
for(const entry of concepts) for(const lang of ['en','zh']){
  assert.equal(entry.pronunciation[lang].text,entry.word[lang],'speak the title, not feeling form');
  assert.ok(entry.illustration.src.endsWith('-sketch-study.svg'),'pilot artwork should reuse the new sketch across Explore/Detail/share');
}

const spoken=[],shared=[];
const handlers={};
const elements={
  app:{innerHTML:''},live:{textContent:''},
  'share-image-btn':{disabled:true,querySelector(){return {textContent:''}}},
  'results':{innerHTML:''}
};
const base='https://example.org/emotions/';
const window={location:{href:base},addEventListener(k,fn){handlers[k]=fn},scrollTo(){},
  speechSynthesis:{cancel(){},speak(u){spoken.push({text:u.text,lang:u.lang})},getVoices(){return[]}},
  EmoLexShareImage:{
    key(e,lang){return e.id+'/'+lang},
    prepare:async (e,lang)=>({name:e.id+'-'+lang+'.png'}),
    download(f){shared.push({download:f.name})}
  },isSecureContext:true
};
const document={baseURI:base,documentElement:{lang:'en'},title:'',
  getElementById(id){return elements[id]||null},
  addEventListener(k,fn){handlers[k]=fn}};
const navigator={language:'en-US',canShare(){return true},async share(data){shared.push(data)}};
const history={state:null,pushState(state,_,url){this.state=state;window.location.href=String(url)}};
const storage=new Map();
const localStorage={getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}};
class SpeechSynthesisUtterance{constructor(text){this.text=text}}
vm.runInNewContext(appJs,{document,window,navigator,history,location:window.location,localStorage,
  SpeechSynthesisUtterance,URL,console,Date,Math,Promise,
  fetch:async()=>({ok:true,json:async()=>({entries:concepts})})});
await new Promise(r=>setImmediate(r));
const click=async (action,id,extras={})=>{
 const button={dataset:{action,id,...extras}};
 await handlers.click({target:{closest(){return button}}});
 await new Promise(r=>setImmediate(r));
};
const joy=concepts.find(x=>x.id==='joy');
history.pushState({},'',base+'?word=joy');
handlers.popstate();
assert.ok(elements.app.innerHTML.includes('data-phrase="Joy"'),'headword listen');
assert.ok(elements.app.innerHTML.includes('WHAT DOES IT MEAN?'),'full detail');
assert.ok(elements.app.innerHTML.includes('IMAGINE THIS...'),'scenario');
assert.ok(elements.app.innerHTML.includes('YOU CAN SAY...'),'expression');
assert.ok(elements.app.innerHTML.includes('class="reading-section speaking-section"'),'speaking guidance must receive its green callout styling');
assert.ok(elements.app.innerHTML.includes('class="reading-section meaning-section"')&&elements.app.innerHTML.includes('class="reading-section scene-section"'),'reading sections must be named for wide layout');
assert.ok(elements.app.innerHTML.includes('✎')&&elements.app.innerHTML.includes('❞'),'sketch-style section icons');
assert.ok(elements.app.innerHTML.includes('class="explore-pane"')&&elements.app.innerHTML.includes('class="detail-pane"'),'both panes share one responsive shell');
assert.ok(elements.app.innerHTML.includes('class="row-illustration"'),'Explore must show artwork thumbnails');
assert.ok(elements.app.innerHTML.includes('data-view="detail"'),'deep link should open detail on phones');
assert.ok(elements.app.innerHTML.includes('share-image-btn'),'share image control');
await click('speak',null,{phrase:'Joy',locale:'en-US'});
assert.deepEqual(spoken.pop(),{text:'Joy',lang:'en-US'});
await click('language');
assert.equal(document.documentElement.lang,'zh-CN');
assert.ok(elements.app.innerHTML.includes('data-phrase="喜悦"'));
await click('speak',null,{phrase:'喜悦',locale:'zh-CN'});
assert.deepEqual(spoken.pop(),{text:'喜悦',lang:'zh-CN'});
await click('share-image','joy');
assert.ok(shared.some(x=>x.files&&x.files[0].name==='joy-zh.png'),'native PNG share');
await click('explore');
assert.ok(elements.app.innerHTML.includes('id="search"'),'explore remains accessible');
assert.ok(elements.app.innerHTML.includes('data-view="explore"'),'explore must be its own phone route');
await click('detail','frustration');
assert.equal(new URL(window.location.href).searchParams.get('word'),'frustration');
assert.ok(elements.app.innerHTML.includes('data-phrase="挫败感"'));
console.log('OK: responsive illustrated master-detail, four headings, headword TTS in EN/ZH, link routing, image share action, and search.');

// Simulate canvas export enough to ensure the image-sharing module remains
// browser-compatible and produces an actual PNG File contract (no network).
const drawn=[];
const fakeContext={
  beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fill(){},stroke(){},
  fillRect(){},fillText(t){drawn.push(String(t))},drawImage(){},
  measureText(t){return {width:String(t).length*18}}
};
const imageDocument={baseURI:'https://example.org/emotions/',
  createElement(tag){
    assert.equal(tag,'canvas');
    return {width:0,height:0,getContext(){return fakeContext},
      toBlob(cb){cb({size:123,type:'image/png'})}};
  }};
class FakeImage {
  width=960;height=640;
  set src(value){this._src=value;queueMicrotask(()=>this.onload?.());}
  get src(){return this._src;}
}
class FakeFile {
  constructor(parts,name,options){this.name=name;this.type=options.type;this.parts=parts;}
}
const imageWindow={};
vm.runInNewContext(shareJs,{
  window:imageWindow,document:imageDocument,
  location:{href:'https://example.org/emotions/'},
  URL,Image:FakeImage,File:FakeFile,Math,Promise,setTimeout
});
const exported=await imageWindow.EmoLexShareImage.prepare(joy,'en');
assert.equal(exported.name,'emolex-joy-en.png');
assert.equal(exported.type,'image/png');
assert.ok(drawn.some(t=>t.includes(joy.word.en)));
console.log('OK: offline bilingual PNG render and export contract.');
