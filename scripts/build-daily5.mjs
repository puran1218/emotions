#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const source=read('data/editorial/daily5-starters.json');
const entries=read('static/emotions/data/emotions.json').entries;
const byId=new Map(entries.map(e=>[e.id,e]));
const words=text=>text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[];
const bilingual=(obj)=>obj&&typeof obj.en==='string'&&obj.en.length>=6&&typeof obj.zh==='string'&&obj.zh.length>=2;

function singleWordVariants(sentence,word,replacements){
  assert.match(word,/^[A-Za-z]+$/);
  const regex=new RegExp('\\b'+word+'\\b','g');
  assert.equal((sentence.match(regex)||[]).length,1,'Exactly one occurrence of '+word+' expected');
  assert.equal(new Set(replacements).size,replacements.length);
  return replacements.map(replacement=>{
    assert.match(replacement,/^[A-Za-z]+$/);
    assert.notEqual(replacement.toLowerCase(),word.toLowerCase());
    const result=sentence.replace(regex,replacement);
    const a=words(sentence),b=words(result);
    assert.equal(a.length,b.length);
    assert.equal(a.filter((x,i)=>x!==b[i]).length,1);
    return result;
  });
}

function curated(row,entry){
  const sentence=entry.say[row.sayIndex];
  assert.ok(sentence?.en&&sentence?.zh);
  assert.equal(row.reviewer,null,'No content auto-approved');
  assert.ok(bilingual(row.imagine)&&bilingual(row.writePrompt)&&bilingual(row.change.label));
  const alternatives=singleWordVariants(sentence.en,row.change.word,row.change.replacements);
  const groups=[{id:'word',label:row.change.label,examples:alternatives}];
  assert.equal(row.change.extraGroups?.length,2);
  for(const group of row.change.extraGroups){
    assert.ok(/^[a-z]+$/.test(group.id)&&!groups.some(g=>g.id===group.id));
    assert.ok(bilingual(group.label)&&group.examples?.length===2);
    groups.push({id:group.id,label:group.label,examples:group.examples});
  }
  assert.equal(new Set(groups.flatMap(g=>g.examples)).size,groups.flatMap(g=>g.examples).length,'Curated alternatives must be unique: '+row.id);
  assert.equal(row.imagineIdeas?.length,3);
  for(const idea of row.imagineIdeas){
    assert.ok(bilingual(idea.label)&&bilingual(idea.prompt)&&typeof idea.example==='string');
  }
  return {
    id:entry.id,word:entry.word,sentence,sayIndex:row.sayIndex,mode:'curated',
    change:{word:row.change.word,alternatives,groups},
    imagine:row.imagine,imagineIdeas:row.imagineIdeas,writePrompt:row.writePrompt
  };
}

const guidance={
  groups:[
    {id:'event',label:{en:'Change what happened',zh:'换一件发生的事'},
      prompt:{en:'Use the story as a model. Replace the event with something that really happened to you.',zh:'参考词条里的经历，换成自己真正遇到的事。'},sayIndex:1},
    {id:'speaker',label:{en:'Change who it is about',zh:'换一个人物'},
      prompt:{en:'Could a friend or family member say this? Change the speaker and any matching pronouns.',zh:'朋友或家人会怎么说？试着换说话的人，并留意代词。'},sayIndex:0},
    {id:'response',label:{en:'Change what you say next',zh:'换一句对别人说的话'},
      prompt:{en:'Try asking, sharing, or saying what you need. Make the words fit your real situation.',zh:'试着提出请求、分享想法，或者说出需要；换成适合自己的话。'},sayIndex:2}
  ],
  ideas:[
    {label:{en:'Picture the scene',zh:'想象词条画面'},source:'scene'},
    {label:{en:'Talk with someone',zh:'和身边的人交流'},source:'conversation',
      prompt:{en:'Imagine saying something to a friend or someone you trust. What would you say in your own words?',zh:'想想你会对朋友或信任的人说什么，可以换成自己的话。'}},
    {label:{en:'Your real day',zh:'联系自己的今天'},source:'today',
      prompt:{en:'Think of something you felt, noticed, did, or saw today. Can you describe it with a sentence of your own?',zh:'回想今天感受到、注意到或经历的事情，用一句自己的英语说出来。'}}
  ],
  writePrompt:{
    en:'What did you feel, notice, or do today? Try using one sentence from this word entry as a starting point.',
    zh:'今天你有什么感受、发现或经历？可以从这个词条的一句话开始改写。'
  }
};

function guided(entry){
  const sayIndex=words(entry.say[2].en).length>=5?2:1;
  const groups=guidance.groups.map(g=>({
    id:g.id,label:g.label,prompt:g.prompt,examples:[entry.say[g.sayIndex].en]
  }));
  const imagineIdeas=guidance.ideas.map(g=>({
    label:g.label,
    prompt:g.source==='scene'?entry.scene:g.prompt,
    example:entry.say[g.source==='scene'?1:g.source==='conversation'?2:0].en
  }));
  return {
    id:entry.id,word:entry.word,sentence:entry.say[sayIndex],sayIndex,
    mode:'guided-source',
    change:{word:null,alternatives:[],groups},
    imagine:{
      en:'Think about the moment in the story, then try a different moment from your life.',
      zh:'先想象词条里的故事，再试着换成自己生活里的一个时刻。'
    },
    imagineIdeas,writePrompt:guidance.writePrompt
  };
}

assert.equal(source.version,2,'Keep manually curated editorial starters unchanged');
assert.equal(source.status,'curated-practice-proposals-not-human-approved');
assert.equal(entries.length,225,'Current public dictionary must have exactly 225 entries');
assert.equal(new Set(entries.map(e=>e.id)).size,225);
const edited=new Map();
for(const row of source.items){
  assert.ok(!edited.has(row.id),'Duplicate curated ID: '+row.id);
  const entry=byId.get(row.id);
  assert.ok(entry&&entry.status==='pilot','Curated ID must be a visible source sense: '+row.id);
  edited.set(row.id,curated(row,entry));
}
assert.equal(edited.size,14,'Preserve original 14 handcrafted lessons');
const items=entries.map(e=>{
  assert.equal(e.status,'pilot','Withheld/draft senses must never enter daily practice: '+e.id);
  assert.equal(e.say.length,3,'All practice sentences must refer to canonical original examples');
  assert.ok(bilingual(e.scene),'Each word needs a real bilingual scene');
  const lesson=edited.get(e.id)||guided(e);
  assert.ok(lesson.change.groups.length===3,'All 225 words need 3 ways to practice changing speech');
  assert.ok(lesson.imagineIdeas.length===3,'All 225 words need 3 life prompts');
  assert.ok(lesson.change.groups.every(g=>g.examples.length>=1&&g.examples.every(x=>typeof x==='string'&&x.length>4)));
  assert.ok(lesson.imagineIdeas.every(x=>typeof x.example==='string'&&bilingual(x.label)&&bilingual(x.prompt)));
  return lesson;
});
assert.equal(items.filter(x=>x.mode==='curated').length,14);
assert.equal(items.filter(x=>x.mode==='guided-source').length,211);
const runtime={
  version:3,
  status:'full-corpus-practice-proposals-not-human-approved',
  cycleDays:items.length,
  coverage:{visible:225,curated:14,guidedFromCanonical:211},
  items
};
const output=path.join(root,'static/emotions/data/daily5.json');
const content=JSON.stringify(runtime,null,2)+'\n';
if(process.argv.includes('--check')){
  assert.ok(fs.existsSync(output),'Missing generated Daily 5 data: run npm run build:daily5');
  assert.equal(fs.readFileSync(output,'utf8'),content,'Daily 5 full corpus drift: run npm run build:daily5');
  console.log('OK: all 225 visible concepts practice-ready; 14 curated + 211 canonical-guided, no withheld words.');
}else{
  fs.writeFileSync(output,content,'utf8');
  console.log('Built 225 Daily 5 lessons; 14 curated and 211 canonical source-guided.');
}
