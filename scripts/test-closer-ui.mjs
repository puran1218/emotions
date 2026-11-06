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
assert.equal(overlay.status,'experimental-not-human-approved');
assert.deepEqual(overlay.comparisons.map(x=>x.id),['joy','frustration','loneliness']);
assert.ok(css.includes('.closer-section')&&css.includes('.closer-cards')&&css.includes('max-width:650px'));

async function boot(enabled){
  const handlers={};
  const container={innerHTML:''};
  const locale={lang:'en'};
  const href='https://example.test/emotions/?word=joy'+(enabled?'&closer=1':'');
  const location={href};
  let experimentFetches=0;
  const document={
    documentElement:locale,
    title:'',
    getElementById(id){return id==='app'?container:id==='live'?{textContent:''}:null},
    querySelector(){return null},
    querySelectorAll(){return[]},
    addEventListener(event,fn){handlers[event]=fn}
  };
  const window={
    location,
    addEventListener(event,fn){handlers[event]=fn},
    scrollTo(){}
  };
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
const demo=await boot(true);
assert.equal(demo.experimentFetches,1);
assert.ok(demo.container.innerHTML.includes('A LITTLE CLOSER'));
assert.ok(demo.container.innerHTML.includes('Joy or relief'));
assert.ok(demo.container.innerHTML.includes('Editorial experiment'));
assert.ok(demo.container.innerHTML.includes('<details class="closer-section" open>'));
await demo.click('language');
assert.equal(demo.locale.lang,'zh-CN');
assert.ok(demo.container.innerHTML.includes('再理解一点'));
assert.ok(demo.container.innerHTML.includes('喜悦和如释重负'));
await demo.click('detail','frustration');
assert.equal(new URL(demo.location.href).searchParams.get('closer'),'1','navigation must keep the opt-in flag');
assert.ok(demo.container.innerHTML.includes('挫败和失望'));
await demo.click('detail','loneliness');
assert.ok(demo.container.innerHTML.includes('孤单和一个人待着'));
await demo.click('detail','affection');
assert.ok(!demo.container.innerHTML.includes('class="closer-section"'),'Affection should not invent a comparison');
await demo.click('detail','relief');
assert.ok(!demo.container.innerHTML.includes('class="closer-section"'),'Relief should not duplicate the Joy comparison');
const normal=await boot(false);
assert.equal(normal.experimentFetches,0,'regular pages do not load experimental content');
assert.ok(!normal.container.innerHTML.includes('A LITTLE CLOSER'),'normal experience stays unchanged');
assert.ok(!normal.container.innerHTML.includes('closer-section'));
console.log('OK: opt-in pilot contrasts, bilingual switch, deep-link preservation, non-pilot isolation, and default UI unchanged.');
