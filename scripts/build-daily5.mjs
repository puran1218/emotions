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
function variants(sentence,word,replacements){
  const regex=new RegExp('\\b'+word+'\\b','g');
  assert.equal((sentence.match(regex)||[]).length,1,'Replace exactly one occurrence of '+word+' in '+sentence);
  assert.equal(new Set(replacements).size,replacements.length,'Alternatives must be distinct');
  return replacements.map(replacement=>{
    assert.match(replacement,/^[A-Za-z]+$/,'A replacement must be a single English word');
    assert.notEqual(replacement.toLowerCase(),word.toLowerCase(),'Alternative must change the word');
    const result=sentence.replace(regex,replacement);
    const a=words(sentence),b=words(result);
    assert.equal(a.length,b.length,'Replacement must preserve token count');
    assert.equal(a.filter((x,i)=>x!==b[i]).length,1,'Only one word can change');
    return result;
  });
}
assert.equal(source.status,'curated-practice-proposals-not-human-approved');
assert.equal(source.items.length,14,'Start with a deliberately limited two-week curated lesson set');
const used=new Set();
const items=source.items.map(row=>{
  assert.ok(!used.has(row.id),'A starter is duplicated: '+row.id);
  used.add(row.id);
  const entry=byId.get(row.id);
  assert.ok(entry,'No visible dictionary sense '+row.id);
  assert.equal(entry.status,'pilot','Unreviewed or withheld senses cannot be auto-enrolled');
  const sentence=entry.say[row.sayIndex];
  assert.ok(sentence?.en&&sentence?.zh,'Invalid source sayIndex for '+row.id);
  assert.ok(row.change.replacements.length>=2 && row.change.replacements.length<=4);
  assert.ok(row.imagine?.en?.length>=12&&row.writePrompt?.en?.length>=12&&row.imagine?.zh?.length>=5&&row.writePrompt?.zh?.length>=5,'English and Chinese prompts require different natural text-length bounds');
  assert.equal(row.reviewer,null,'Starter sentences are not human-review approved');
  return {
    id:row.id,
    word:entry.word,
    sentence,
    sayIndex:row.sayIndex,
    change:{word:row.change.word,alternatives:variants(sentence.en,row.change.word,row.change.replacements)},
    imagine:row.imagine,
    writePrompt:row.writePrompt
  };
});
const data={version:1,status:source.status,cycleDays:items.length,items};
const output=path.join(root,'static/emotions/data/daily5.json'),content=JSON.stringify(data,null,2)+'\n';
if(process.argv.includes('--check')){
  assert.ok(fs.existsSync(output),'Daily 5 runtime JSON missing, run npm run build:daily5');
  assert.equal(fs.readFileSync(output,'utf8'),content,'Daily 5 runtime drift; run npm run build:daily5');
  console.log('OK: 14 practice sentences exactly match canonical bilingual YOU CAN SAY lines; variations each change one word.');
}else{
  fs.writeFileSync(output,content,'utf8');
  console.log('Built 14 daily English micro-lessons, still marked draft.');
}
