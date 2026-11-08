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
  assert.match(word,/^[A-Za-z]+$/,'One-word practice focus must be one English word');
  const regex=new RegExp('\\b'+word+'\\b','g');
  assert.equal((sentence.match(regex)||[]).length,1,'Replace exactly one occurrence of '+word+' in '+sentence);
  assert.equal(new Set(replacements).size,replacements.length,'Alternatives must be distinct');
  return replacements.map(replacement=>{
    assert.match(replacement,/^[A-Za-z]+$/,'A one-word replacement must be one English word');
    assert.notEqual(replacement.toLowerCase(),word.toLowerCase(),'Alternative must change the word');
    const result=sentence.replace(regex,replacement);
    const a=words(sentence),b=words(result);
    assert.equal(a.length,b.length,'One-word variation must preserve word count');
    assert.equal(a.filter((x,i)=>x!==b[i]).length,1,'One-word variation must change exactly one token');
    return result;
  });
}
assert.equal(source.version,2,'Daily 5 requires explicit richer-exercise schema version');
assert.equal(source.status,'curated-practice-proposals-not-human-approved');
assert.equal(source.items.length,14,'Keep this a limited curated two-week trial');
const used=new Set();
const items=source.items.map(row=>{
  assert.ok(!used.has(row.id),'Duplicate lesson '+row.id);
  used.add(row.id);
  const entry=byId.get(row.id);
  assert.ok(entry&&entry.status==='pilot','Unpublished or unknown source '+row.id);
  const sentence=entry.say[row.sayIndex];
  assert.ok(sentence?.en&&sentence?.zh,'Missing bilingual source for '+row.id);
  assert.equal(row.reviewer,null,'Content does not imply human sign-off');
  assert.ok(bilingual(row.imagine)&&bilingual(row.writePrompt),'Original imagine and write prompts must be bilingual: '+row.id);
  assert.ok(bilingual(row.change.label),'One-word category label must be bilingual: '+row.id);
  assert.ok(Array.isArray(row.change.replacements)&&row.change.replacements.length>=2&&row.change.replacements.length<=4);
  const original=singleWordVariants(sentence.en,row.change.word,row.change.replacements);
  const groups=[{id:'word',label:row.change.label,examples:original}];
  assert.equal(row.change.extraGroups?.length,2,'Require two meaningfully different transformation categories for '+row.id);
  for(const group of row.change.extraGroups){
    assert.ok(/^[a-z]+$/.test(group.id)&&!groups.some(g=>g.id===group.id),'Group ID must be a unique word');
    assert.ok(bilingual(group.label),'Group label requires EN/ZH: '+row.id);
    assert.equal(group.examples?.length,2,'Each additional group must have two curated sentences');
    for(const example of group.examples){
      assert.ok(typeof example==='string'&&example.trim()===example&&example.length>=12&&/[.!?]$/.test(example),'Practice example should be a complete English sentence');
      assert.notEqual(example,sentence.en,'Changed example cannot simply repeat the original');
    }
    groups.push({id:group.id,label:group.label,examples:group.examples});
  }
  const all=groups.flatMap(g=>g.examples);
  assert.equal(new Set(all).size,all.length,'All changes for a lesson must be distinct: '+row.id);
  assert.equal(row.imagineIdeas?.length,3,'Every lesson needs three different real-life prompts');
  for(const idea of row.imagineIdeas){
    assert.ok(bilingual(idea.label)&&bilingual(idea.prompt),'Daily life ideas must be bilingual');
    assert.ok(typeof idea.example==='string'&&idea.example.length>=12&&/[.!?]$/.test(idea.example),'Daily life ideas require a complete speakable English sentence');
  }
  return {
    id:row.id,
    word:entry.word,
    sentence,
    sayIndex:row.sayIndex,
    change:{word:row.change.word,alternatives:original,groups},
    imagine:row.imagine,
    imagineIdeas:row.imagineIdeas,
    writePrompt:row.writePrompt
  };
});
const data={version:2,status:source.status,cycleDays:items.length,items};
const output=path.join(root,'static/emotions/data/daily5.json'),content=JSON.stringify(data,null,2)+'\n';
if(process.argv.includes('--check')){
  assert.ok(fs.existsSync(output),'Daily 5 runtime JSON missing, run npm run build:daily5');
  assert.equal(fs.readFileSync(output,'utf8'),content,'Daily 5 runtime drift; run npm run build:daily5');
  console.log('OK: 14 authentic source sentences, 42 guided change categories and 42 everyday context ideas.');
}else{
  fs.writeFileSync(output,content,'utf8');
  console.log('Built 14 enriched Daily 5 lessons, still marked as editorial drafts.');
}
