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
assert.ok(!appJs.includes('data-action="export-library"'),'No bulk JSON export action should remain in the UI');
assert.ok(appJs.includes('Daily 5 · 每日五分钟'));
assert.ok(practiceHtml.includes('./practice.js')&&practiceHtml.includes('./practice.css'));
assert.ok(css.includes('.daily-progress-step')&&css.includes('.daily-change-tab')&&css.includes('.daily-idea')&&css.includes('@media(max-width:600px)'));
assert.equal(lessons.items.length,225);
assert.equal(lessons.status,'full-corpus-practice-proposals-not-human-approved');
assert.equal(lessons.version,3);
assert.equal(lessons.cycleDays,225,'Each visible entry belongs to a 225-day rotating cycle');
assert.deepEqual(lessons.coverage,{visible:225,curated:14,guidedFromCanonical:211});
assert.deepEqual(new Set(lessons.items.map(x=>x.id)),new Set(entries.map(x=>x.id)));
assert.equal(new Set(lessons.items.map(x=>x.id)).size,225,'All individual senses must be distinct');
assert.ok(appJs.includes('practice.html?word='),'Every dictionary word must deep-link to its exact practice sense');
for(const lesson of lessons.items){
  const entry=entries.find(x=>x.id===lesson.id);
  assert.ok(entry&&entry.status==='pilot','Withheld content must not enter practice');
  assert.equal(lesson.sentence.en,entry.say[lesson.sayIndex].en);
  assert.equal(lesson.sentence.zh,entry.say[lesson.sayIndex].zh);
  assert.equal(lesson.change.groups.length,3,'Every lesson has three distinct ways to practise speech');
  assert.equal(lesson.imagineIdeas.length,3,'Each lesson has three bilingual situations');
  assert.ok(lesson.imagineIdeas.every(x=>x.prompt.en&&x.prompt.zh&&x.example));
  if(lesson.mode==='curated'){
    assert.ok(lesson.change.groups.every(g=>g.examples.length>=2),'Curated categories retain multiple examples');
  }else{
    assert.equal(lesson.mode,'guided-source');
    assert.deepEqual(lesson.change.groups.map(g=>g.examples[0]),[entry.say[1].en,entry.say[0].en,entry.say[2].en],'Do not fabricate unreviewed English variations');
    assert.equal(lesson.imagineIdeas[0].prompt.en,entry.scene.en);
    assert.equal(lesson.imagineIdeas[0].prompt.zh,entry.scene.zh);
    assert.ok(lesson.change.groups.every(g=>g.prompt?.en&&g.prompt?.zh),'Guided categories must explain the learner change');
  }
}

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
assert.equal(e.libraryJSON,undefined,'Remove unused public bulk JSON export while preserving Markdown');
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
assert.equal((rendered.innerHTML.match(/data-daily-action="go"/g)||[]).length,5,'Five numbered step controls are interactive native buttons');
assert.ok(rendered.innerHTML.includes('aria-current="step"'),'Current step must be announced accessibly');
await click('listen');
assert.ok(speech.includes('I wish someone could play with me.'));
await click('go',{step:'1'});
assert.ok(rendered.innerHTML.includes('MINUTE 2 / 5'),'Direct navigation reaches minute two');
assert.ok(!rendered.innerHTML.includes('我希望有人能陪我玩'),'Chinese remains hidden when using step buttons to navigate early stages');
await click('repeat');await click('repeat');await click('repeat');
assert.ok(rendered.innerHTML.includes('Spoken aloud: 3 / 3'));
await click('go',{step:'2'});
assert.ok(rendered.innerHTML.includes('MINUTE 3 / 5'));
assert.ok(rendered.innerHTML.includes('I wish someone could run with me.'));
assert.ok(rendered.innerHTML.includes('data-group-index="0"')&&rendered.innerHTML.includes('data-group-index="1"')&&rendered.innerHTML.includes('data-group-index="2"'));
assert.ok(!rendered.innerHTML.includes('我希望有人能陪我玩'),'Chinese is optional when first arriving at Change');
await click('change-group',{groupIndex:'1'});
assert.ok(rendered.innerHTML.includes('I wish my brother could play with me.'),'Change can swap a person');
await click('variant',{variantIndex:'0'});
assert.ok(speech.includes('I wish my brother could play with me.'));
await click('change-group',{groupIndex:'2'});
assert.ok(rendered.innerHTML.includes('I wish someone could play with me this weekend.'),'Change can add a time');
await click('translate');
assert.ok(rendered.innerHTML.includes('我希望有人能陪我玩'));
await click('use-variant',{variantIndex:'0'});
assert.ok(rendered.innerHTML.includes('I wish someone could play with me this weekend.'),'Curated example seeds editable Change draft');
handlers.input({target:{id:'daily-change-draft',value:'I wish my friend could walk with me after school.'}});
await click('go',{step:'3'});
assert.ok(rendered.innerHTML.includes('MINUTE 4 / 5'));
assert.equal((rendered.innerHTML.match(/data-daily-action="idea"/g)||[]).length,3,'Imagine presents three real-life situations');
assert.ok(rendered.innerHTML.includes('这个周末'),'Imagine contains Chinese prompts');
await click('idea-speak',{ideaIndex:'2'});
assert.ok(speech.includes('I wish someone could run with me this weekend.'));
await click('idea',{ideaIndex:'2'});
assert.ok(rendered.innerHTML.includes('I wish someone could run with me this weekend.'),'Example can seed personal writing');
handlers.input({target:{id:'daily-situation',value:'I wish someone could walk with me after school.'}});
await click('go',{step:'4'});
assert.ok(rendered.innerHTML.includes('MINUTE 5 / 5'));
handlers.input({target:{id:'daily-reflection',value:'Today I walked to the park by myself.'}});
await click('go',{step:'3'});
assert.ok(rendered.innerHTML.includes('I wish someone could walk with me after school.'),'Jumping back preserves Imagine writing');
await click('idea',{ideaIndex:'0'});
assert.ok(status.textContent.includes('already wrote'),'Choosing an example must not silently overwrite writing');
assert.ok(rendered.innerHTML.includes('I wish someone could walk with me after school.'));
await click('go',{step:'0'});
assert.ok(!rendered.innerHTML.includes('我希望有人能陪我玩'),'Early steps still hide translations after returning from later stages');
await click('go',{step:'1'});
assert.ok(rendered.innerHTML.includes('Spoken aloud: 3 / 3'),'Direct navigation does not reset repetition count');
await click('go',{step:'4'});
assert.ok(rendered.innerHTML.includes('Today I walked to the park by myself.'),'Jumping preserves journal writing');
await click('go',{step:'2'});
assert.ok(rendered.innerHTML.includes('I wish my friend could walk with me after school.'),'Change writing survives direct navigation');
await click('go',{step:'4'});
await click('save');
assert.equal(store.size,1,'Personal notes saved only after explicit click');
await click('download');
assert.ok(downloads.some(x=>x.startsWith('emolex-daily5-')&&x.endsWith('-loneliness.md')));
await click('another');
assert.ok(rendered.innerHTML.includes('I care about you.'),'Affection remains one of the original curated lessons');
await click('another');
assert.ok(rendered.innerHTML.includes("I'm so glad my book isn't lost."),'Relief remains curated');
await click('another');
assert.ok(rendered.innerHTML.includes('Can I finish this part first?'),'The next dictionary entry uses an authentic canonical phrase');
assert.ok(rendered.innerHTML.includes('Guided from dictionary examples'),'Non-curated lessons are explicitly labeled');
assert.equal(lessons.items[0].id,'joy');
assert.equal(lessons.items[1].id,'frustration');
assert.equal(lessons.items[2].id,'loneliness');
assert.equal(lessons.items[3].id,'affection');
assert.equal(lessons.items[4].id,'relief');
assert.equal(lessons.items[5].id,'absorbed');
await click('go',{step:'2'});
assert.ok(rendered.innerHTML.includes('Use the story as a model'),'Guided Change offers a meaningful editing task');
assert.ok(rendered.innerHTML.includes('I was so focused that I forgot the time.'),'Guided examples must be original dictionary English');
await click('use-variant',{variantIndex:'0'});
assert.ok(rendered.innerHTML.includes('I was so focused that I forgot the time.'),'Guided sentence can start learner writing');
handlers.input({target:{id:'daily-change-draft',value:'I was so focused on my painting that I forgot the time.'}});
await click('change-group',{groupIndex:'1'});
assert.ok(rendered.innerHTML.includes("I'm completely absorbed in my drawing."),'Guided second category uses another real example');
await click('speak-draft');
assert.ok(speech.includes('I was so focused on my painting that I forgot the time.'),'Learners can listen to their own edited English');
await click('go',{step:'3'});
assert.ok(rendered.innerHTML.includes('I was so focused that I forgot the time.'),'Imagine starts with the canonical story example');
await click('idea',{ideaIndex:'0'});
assert.ok(rendered.innerHTML.includes('I was so focused that I forgot the time.'));
await click('go',{step:'4'});
await click('save');
assert.equal(store.size,2,'Saving a second lesson does not overwrite a different word');
assert.ok(appJs.includes('class="practice-entry-link"'),'All dictionary entries expose Daily 5 link');
console.log('OK: all 225 visible words, safe canonical-guided mode, 14 curated lessons, direct five-step navigation, edits, TTS and private persistence.');
