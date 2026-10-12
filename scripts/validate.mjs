#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const source=read('data/source-words.json');
const pilot=read('static/emotions/data/emotions.json');
const art=read('art/manifest.json');
const ledger=fs.readFileSync(path.join(root,'data/review-ledger.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const expected={en:{needs_met:107,needs_unmet:135},zh:{needs_met:31,needs_unmet:49}};
const occurrences=[];
for(const [lang,sets] of [['en',source.english],['zh',source.chinese]]){
  for(const [category,count] of Object.entries(expected[lang])){
    assert.equal(sets[category].length,count,lang+'/'+category);
    sets[category].forEach((word,i)=>{
      assert.equal(typeof word,'string');
      assert.ok(word.trim().length>0);
      occurrences.push({occurrence_id:lang+'-'+category+'-'+String(i+1).padStart(3,'0'),source_word:word,source_language:lang,source_category:category,source_index:i});
    });
  }
}
assert.equal(new Set([...source.english.needs_met,...source.english.needs_unmet].map(v=>v.toLowerCase())).size,234,'distinct English terms');
assert.equal(occurrences.length,322,'source occurrences');
assert.equal(ledger.length,322,'review ledger rows');
assert.equal(new Set(ledger.map(r=>r.occurrence_id)).size,322,'unique ledger IDs');
for(let i=0;i<ledger.length;i++){
  for(const field of ['occurrence_id','source_word','source_language','source_category','source_index'])
    assert.equal(ledger[i][field],occurrences[i][field],field+' at occurrence '+i);
  assert.ok(['unreviewed','drafted','content-reviewed','illustration-reviewed','published','excluded'].includes(ledger[i].status));
}
const entries=pilot.entries;
assert.equal(pilot.version,1);
assert.ok(Array.isArray(entries)&&entries.length>=1);
assert.equal(new Set(entries.map(e=>e.id)).size,entries.length,'unique concept IDs');
const map=new Map(entries.map(e=>[e.id,e]));
for(const e of entries){
  assert.match(e.id,/^[a-z0-9-]+$/);
  assert.ok(Array.isArray(e.needs)&&e.needs.length);
  for(const n of e.needs)assert.ok(['needs_met','needs_unmet','mixed','neutral'].includes(n),e.id+': category');
  assert.match(e.visual,/^[a-z-]+$/);
  assert.ok(fs.existsSync(path.join(root,'static/emotions/images/'+e.visual+'-storyboard.svg')),e.id+' missing storyboard');
  for(const lang of ['en','zh']){
    for(const part of ['definition','scene','say','alt'])
      assert.ok(e[part][lang]&&e[part][lang].trim().length>4,e.id+'.'+part+'.'+lang);
    assert.ok(e.word[lang],e.id+'.word.'+lang);
  }
  for(const id of e.related){assert.ok(id!==e.id&&map.has(id),e.id+' related '+id);}
}
for(const a of art.assets){assert.ok(['draft','pending','approved','rejected'].includes(a.stage));}
console.log('OK: '+occurrences.length+' original source occurrences, '+new Set([...source.english.needs_met,...source.english.needs_unmet]).size+' English forms; '+ledger.length+' individually tracked review items; '+entries.length+' bilingual pilot concepts; image paths and relationships validated.');
