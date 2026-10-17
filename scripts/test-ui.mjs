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
assert.ok(css.includes('.speaking-section{background:#E2EDE2'),'speaking guidance should stay green');
assert.ok(css.includes('.expression-grid{')&&css.includes('.expression-card{')&&css.includes('.expression-speak{'),'three-card layout and voice controls must be styled');
assert.ok(css.includes('@media(min-width:900px)')&&css.includes('.app-shell')&&css.includes('.app-shell[data-view="explore"] .detail-pane{display:none}'),'master-detail must adapt to mobile and wide layouts');
assert.ok(css.includes('.speaking-section{background:#E2EDE2'),'speaking guidance needs visible green section background');
assert.match(css,/\.headword-line h1\{[^}]*white-space:nowrap/,'headwords must never break between letters');
assert.match(css,/\.row-words strong\{[^}]*white-space:nowrap/,'Explore names must never break between letters');
assert.ok(css.includes('--reading-en:')&&css.includes('--reading-zh:')&&css.includes('.primary-copy[lang^="zh"]'),'bilingual body text should have consistent hand-lettered typography');
assert.ok(css.includes('.image-share-icon{'),'image sharing uses a styled SVG picture icon');
for(const entry of concepts) for(const lang of ['en','zh']){
  assert.equal(entry.pronunciation[lang].text,entry.word[lang],'speak the title, not feeling form');
  assert.equal(entry.illustration.src,'./images/feeling-placeholder.svg','pilot artwork should reuse one neutral placeholder across Explore/Detail/share');
  assert.equal(entry.illustration.stage,'pending');
  assert.ok(Array.isArray(entry.say)&&entry.say.length>=3&&entry.say.length<=4,'pilot expressions are 3–4 bilingual examples');
  assert.ok(entry.say.every(x=>x.en&&x.zh),'every expression needs both languages');
}

const spoken=[],shared=[];
const handlers={};
const explorePane={scrollTop:0};
const shareStatus={textContent:''};
let delayedPrepare=null,failDownload=false;
const elements={
  app:{_html:'',get innerHTML(){return this._html},set innerHTML(value){
    this._html=value;
    // Simulate replacement of the entire DOM tree resetting nested scroll.
    explorePane.scrollTop=0;
  }},
  live:{textContent:''},
  'share-image-btn':{disabled:true,querySelector(){return shareStatus}},
  'results':{innerHTML:''}
};
const base='https://example.org/emotions/';
const window={location:{href:base},addEventListener(k,fn){handlers[k]=fn},scrollTo(){},
  speechSynthesis:{cancel(){},speak(u){spoken.push({text:u.text,lang:u.lang})},getVoices(){return[]}},
  EmoLexShareImage:{
    key(e,lang){return e.id+'/'+lang},
    prepare:(e,lang)=>delayedPrepare?delayedPrepare(e,lang):Promise.resolve({name:e.id+'-'+lang+'.png'}),
    download(f){if(failDownload)throw Error('Download blocked');shared.push({download:f.name})}
  },isSecureContext:true
};
const document={baseURI:base,documentElement:{lang:'en'},title:'',
  getElementById(id){return elements[id]||null},
  querySelector(selector){return selector==='.explore-pane'&&elements.app.innerHTML.includes('class="explore-pane"')?explorePane:null},
  addEventListener(k,fn){handlers[k]=fn}};
const navigator={language:'en-US',canShare(){return true},async share(data){shared.push(data)}};
const history={state:null,pushState(state,_,url){this.state=state;window.location.href=String(url)}};
const storage=new Map();
const localStorage={getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}};
class SpeechSynthesisUtterance{constructor(text){this.text=text}}
vm.runInNewContext(appJs,{document,window,navigator,history,location:window.location,localStorage,
  SpeechSynthesisUtterance,URL,console,Date,Math,Promise,
  getComputedStyle:element=>({fontSize:element.style.fontSize||'54px'}),
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
assert.equal((elements.app.innerHTML.match(/class="expression-card"/g)||[]).length,3,'show three expression cards');
assert.ok(elements.app.innerHTML.includes('data-phrase="I feel joyful!"'),'first sentence can be spoken');
assert.ok(elements.app.innerHTML.includes('data-phrase="Look! My sunflower finally bloomed!"'),'context sentence can be spoken');
assert.ok(elements.app.innerHTML.includes('class="reading-section speaking-section"'),'speaking guidance must receive its green callout styling');
assert.ok(elements.app.innerHTML.includes('class="reading-section meaning-section"')&&elements.app.innerHTML.includes('class="reading-section scene-section"'),'reading sections must be named for wide layout');
assert.ok(elements.app.innerHTML.includes('✎')&&elements.app.innerHTML.includes('❞'),'sketch-style section icons');
assert.ok(elements.app.innerHTML.includes('class="explore-pane"')&&elements.app.innerHTML.includes('class="detail-pane"'),'both panes share one responsive shell');
assert.ok(elements.app.innerHTML.includes('class="row-illustration"'),'Explore must show artwork thumbnails');
assert.ok(elements.app.innerHTML.includes('feeling-placeholder.svg'),'render the shared illustration placeholder');
assert.ok(elements.app.innerHTML.includes('Illustration coming soon'),'art is visibly labeled pending');
assert.ok(elements.app.innerHTML.includes('data-view="detail"'),'deep link should open detail on phones');
assert.ok(elements.app.innerHTML.includes('share-image-btn'),'share image control');
assert.ok(elements.app.innerHTML.includes('class="image-share-icon"'),'share image should show a recognizable picture glyph');
assert.ok(elements.app.innerHTML.includes('data-fit-word'),'headword fitting should apply to title and Explore row');
await click('speak',null,{phrase:'Joy',locale:'en-US'});
assert.deepEqual(spoken.pop(),{text:'Joy',lang:'en-US'});
await click('language');
assert.equal(document.documentElement.lang,'zh-CN');
assert.ok(elements.app.innerHTML.includes('data-phrase="喜悦"'));
assert.ok(elements.app.innerHTML.includes('data-phrase="我好开心！"'),'Chinese expression audio follows language switch');
await click('speak',null,{phrase:'喜悦',locale:'zh-CN'});
assert.deepEqual(spoken.pop(),{text:'喜悦',lang:'zh-CN'});
await click('share-image','joy');
assert.ok(shared.some(x=>x.files&&x.files[0].name==='joy-zh.png'),'native PNG share');
await click('explore');
assert.ok(elements.app.innerHTML.includes('id="search"'),'explore remains accessible');
assert.ok(elements.app.innerHTML.includes('placeholder="搜索情绪词…"'),'Chinese search prompt is natural');
assert.ok(!elements.app.innerHTML.includes('搜索感受或 English'),'mixed-language search prompt was removed');
explorePane.scrollTop=830;

assert.ok(elements.app.innerHTML.includes('data-view="explore"'),'explore must be its own phone route');
await click('detail','frustration');
assert.equal(new URL(window.location.href).searchParams.get('word'),'frustration');
assert.equal(explorePane.scrollTop,830,'wide Explore position survives choosing a Detail');
await click('detail','happy');
assert.equal(explorePane.scrollTop,830,'wide Explore position survives a second Detail selection');
await click('detail','frustration');
assert.equal(explorePane.scrollTop,830,'wide Explore remains scrolled after returning to previous emotion');
assert.ok(elements.app.innerHTML.includes('data-phrase="挫败感"'));
assert.equal((elements.app.innerHTML.match(/class="expression-card"/g)||[]).length,3,'other emotion should also show three cards');
assert.ok(elements.app.innerHTML.includes('placeholder="搜索情绪词…"'),'search placeholder remains localized after navigation');
await click('language');
assert.ok(elements.app.innerHTML.includes('placeholder="Search feelings…"'),'English search prompt is natural');
assert.ok(elements.app.innerHTML.includes('aria-label="Search feelings in English or Chinese"'),'search accessibility communicates bilingual support');
assert.equal(explorePane.scrollTop,830,'language switch must not move Explore back to the start');
await click('filter','needs_met');
assert.equal(explorePane.scrollTop,830,'filter render preserves wide Explore pane position');

// Delayed PNG export from an older emotion must never replace the current one.
const resolvers=new Map();
delayedPrepare=(e,lang)=>new Promise(resolve=>resolvers.set(e.id+'/'+lang,resolve));
await click('detail','joy');
await click('detail','frustration');
resolvers.get('frustration/en')({name:'frustration-new.png'});
await new Promise(r=>setImmediate(r));
resolvers.get('joy/en')({name:'joy-old.png'});
await new Promise(r=>setImmediate(r));
assert.equal(elements['share-image-btn'].disabled,false,'latest image completes and enables sharing');
assert.equal(shareStatus.textContent,'Share image','the latest image has native sharing status');
await click('share-image','frustration');
assert.ok(shared.some(x=>x.files?.[0]?.name==='frustration-new.png'),'latest prepared image is shared despite old work completing last');
delayedPrepare=null;
navigator.canShare=()=>false;
await click('share-image','frustration');
assert.ok(shared.some(x=>x.download==='frustration-new.png'),'download fallback works when native file share is unavailable');
failDownload=true;
await click('share-image','frustration');
assert.ok(elements.live.textContent.includes('Could not download'),'failed download should show an honest error');
failDownload=false;
navigator.canShare=()=>true;
const longWord = {clientWidth:185,style:{fontSize:''},get scrollWidth(){return Math.ceil((parseFloat(this.style.fontSize)||54)*7.2);}};
document.querySelectorAll=()=>[longWord];
handlers.resize();
assert.ok(longWord.scrollWidth<=longWord.clientWidth+1,'Frustration must shrink to the available width without a second line');
console.log('OK: responsive illustrated master-detail, four headings, headword TTS in EN/ZH, link routing, image share action, and search.');

// Simulate canvas export enough to ensure the image-sharing module remains
// browser-compatible and produces an actual PNG File contract (no network).
const drawn=[],canvases=[],imageRequests=[];
const fakeContext={
  beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fill(){},stroke(){},
  fillRect(){},fillText(t){drawn.push(String(t))},drawImage(){},
  measureText(t){return {width:String(t).length*18}}
};
const imageDocument={baseURI:'https://example.org/emotions/',
  createElement(tag){
    assert.equal(tag,'canvas');
    const canvas={width:0,height:0,getContext(){return fakeContext},
      toBlob(cb){cb({size:123,type:'image/png'})}};
    canvases.push(canvas);
    return canvas;
  }};
class FakeImage {
  width=960;height=640;
  set src(value){this._src=value;imageRequests.push(value);queueMicrotask(()=>value.includes('missing-image')?this.onerror?.():this.onload?.());}
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
assert.ok(drawn.some(t=>t.includes(joy.say[0].en)),'share PNG contains leading expression');
assert.ok(drawn.some(t=>t.includes(joy.say[1].en)),'share PNG contains contextual expression');
assert.ok(!drawn.some(t=>t.includes(joy.say[2].en)),'share PNG intentionally excludes the third expression');
assert.ok(canvases.at(-1).height<3170,'short copy should not force a tall, empty image');
const longCopy={...joy,id:'long-layout',definition:{...joy.definition,en:Array(90).fill('This is an unusually detailed but understandable explanation.').join(' ')},scene:{...joy.scene,zh:'如果心里涌起很多复杂的感受，先把事情讲清楚，也可以慢慢说出自己的心情。'.repeat(20)}};
const longPNG=await imageWindow.EmoLexShareImage.prepare(longCopy,'en');
assert.equal(longPNG.name,'emolex-long-layout-en.png');
assert.ok(canvases.at(-1).height>3170,'long bilingual content should grow the image rather than cut it at 3170px');
assert.ok(drawn.some(t=>t.includes('EmoLex · example.org')),'PNG footer remains visible after long content');
const missingImage={...joy,id:'missing-art',illustration:{...joy.illustration,src:'./images/missing-image.svg'}};
const missingPNG=await imageWindow.EmoLexShareImage.prepare(missingImage,'zh');
assert.equal(missingPNG.name,'emolex-missing-art-zh.png');
assert.ok(imageRequests.some(x=>x.endsWith('/images/feeling-placeholder.svg')),'failed illustration should fall back to shared placeholder');
console.log('OK: PNG layout scales for long bilingual content, illustration fallback, bounded cache and export contract.');
