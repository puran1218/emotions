#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtime=JSON.parse(read('static/emotions/data/emotions.json'));
const overlay=JSON.parse(read('static/emotions/data/closer-experiment.json'));
const appJs=read('static/emotions/app.js');
const css=read('static/emotions/styles.css');
new vm.Script(appJs);
assert.equal(runtime.entries.length,225);
assert.equal(overlay.status,'full-corpus-editorial-proposals-not-human-approved');
assert.equal(overlay.coverage.visible,225);
assert.equal(overlay.comparisons.length,225);
assert.equal(new Set(overlay.comparisons.map(x=>x.id)).size,225);
assert.deepEqual(new Set(overlay.comparisons.map(x=>x.id)),new Set(runtime.entries.map(x=>x.id)));
assert.ok(css.includes('.closer-section')&&css.includes('.closer-cards')&&css.includes('.closer-link'));
assert.ok(css.includes('@media(max-width:650px)'),'contrast cards need mobile stacking');

async function boot(query='word=joy'){
  const handlers={};
  const container={innerHTML:''};
  const locale={lang:'en'};
  const location={href:'https://example.test/emotions/?'+query};
  let experimentFetches=0;
  const document={
    documentElement:locale,
    title:'',
    getElementById(id){return id==='app'?container:id==='live'?{textContent:''}:null},
    querySelector(){return null},
    querySelectorAll(){return[]},
    addEventListener(event,fn){handlers[event]=fn}
  };
  const window={location,addEventListener(event,fn){handlers[event]=fn},scrollTo(){}};
  const navigator={language:'en-US'};
  const history={state:null,pushState(state,_,url){this.state=state;location.href=String(url)}};
  const localStorage={getItem(){return null},setItem(){}};
  const fetch=async p=>{
    if(p.includes('closer-experiment.json')){experimentFetches++;return{ok:true,json:async()=>overlay};}
    return{ok:true,json:async()=>runtime};
  };
  vm.runInNewContext(appJs,{document,window,location,navigator,history,localStorage,URL,console,Date,Math,Promise,fetch,
    getComputedStyle:()=>({fontSize:'20px'}),SpeechSynthesisUtterance:class{}});
  await new Promise(resolve=>setImmediate(resolve));
  const click=async(action,id)=>{
    await handlers.click({target:{closest(){return{dataset:{action,id}}}}});
    await new Promise(resolve=>setImmediate(resolve));
  };
  return{container,locale,location,click,get experimentFetches(){return experimentFetches}};
}

const demo=await boot();
assert.equal(demo.experimentFetches,1,'main experience loads its stable full-corpus overlay once');
assert.ok(demo.container.innerHTML.includes('A LITTLE CLOSER'));
assert.ok(demo.container.innerHTML.includes('Joy or relief'));
assert.ok(demo.container.innerHTML.includes('Editorial draft'));
assert.ok(demo.container.innerHTML.includes('<details class="closer-section" open>'));
await demo.click('language');
assert.equal(demo.locale.lang,'zh-CN');
assert.ok(demo.container.innerHTML.includes('再理解一点'));
assert.ok(demo.container.innerHTML.includes('喜悦和如释重负'));

await demo.click('detail','frustration');
assert.ok(demo.container.innerHTML.includes('挫败和失望'));
assert.ok(demo.container.innerHTML.includes('积木塔'));
await demo.click('detail','loneliness');
assert.ok(demo.container.innerHTML.includes('孤单和一个人待着'));
await demo.click('detail','affection');
assert.ok(demo.container.innerHTML.includes('再理解一点'),'previously uncovered pilot now gets a new comparison');
assert.ok(demo.container.innerHTML.includes('充满爱意'));
await demo.click('detail','relief');
assert.ok(demo.container.innerHTML.includes('再理解一点'),'previously uncovered relief also gets a comparison');

for(const id of ['curious','quiet','glorious','tired','warm','worried','surprised-met','surprised-unmet','concerned-met','concerned-unmet','sensitive-met','sensitive-unmet','intense-met','intense-unmet']){
  const record=runtime.entries.find(x=>x.id===id);
  assert.ok(record,'Missing sense '+id);
  await demo.click('detail',id);
  assert.ok(demo.container.innerHTML.includes('class="closer-section"'),'All content including nuanced senses must have the contrast: '+id);
  assert.ok(demo.container.innerHTML.includes('class="closer-link"'),'Comparison target should be explorable: '+id);
  assert.ok(demo.container.innerHTML.includes(record.definition.zh),'Original bilingual concept definition should be the first comparison: '+id);
}
await demo.click('detail','quiet');
assert.ok(demo.container.innerHTML.includes('安静是声音少'),'Not a feeling ≠ unhappy');
await demo.click('detail','joy');
assert.ok(!new URL(demo.location.href).searchParams.has('closer'),'default enabled does not need a URL feature flag');

const hidden=await boot('word=joy&closer=0');
assert.equal(hidden.experimentFetches,0,'Explicit compare-to-old mode should not load the overlay');
assert.ok(!hidden.container.innerHTML.includes('A LITTLE CLOSER'));
await hidden.click('detail','tired');
assert.ok(!hidden.container.innerHTML.includes('class="closer-section"'),'Every word hides extra section in legacy view');
assert.equal(new URL(hidden.location.href).searchParams.get('closer'),'0','Navigation must preserve comparison-off view');
console.log('OK: 225 comparisons, three custom pilots, canonical bilingual definitions, nuanced senses, navigable targets, and explicit old-view switch.');
