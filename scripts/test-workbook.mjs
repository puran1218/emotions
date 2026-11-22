import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderWorkbook} from '../static/emotions/workbook-core.js';
import {selectEntries,escapeHtml} from '../static/emotions/print-core.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const entries=JSON.parse(read('static/emotions/data/emotions.json')).entries;
const daily=JSON.parse(read('static/emotions/data/daily5.json'));
assert.equal(entries.length,225);
assert.equal(daily.items.length,225);
assert.deepEqual(daily.coverage,{visible:225,curated:14,guidedFromCanonical:211});
const byId=new Map(daily.items.map(lesson=>[lesson.id,lesson]));
assert.equal(byId.size,225);
assert.deepEqual(new Set(entries.map(entry=>entry.id)),new Set(byId.keys()));
const all=renderWorkbook(entries,daily.items,entries);
assert.equal((all.match(/class="sheet workbook"/g)||[]).length,225);
assert.equal((all.match(/class="wb-step /g)||[]).length,225*5);
assert.equal((all.match(/class="wb-change-option"/g)||[]).length,225*3);
assert.equal((all.match(/class="wb-idea"/g)||[]).length,225*3);
assert.equal((all.match(/class="wb-checkbox"/g)||[]).length,225*3);
for(const entry of entries){
  const lesson=byId.get(entry.id);
  assert.equal(lesson.change.groups.length,3);
  assert.equal(lesson.imagineIdeas.length,3);
  assert.ok(all.includes(escapeHtml(lesson.sentence.en)));
  assert.ok(all.includes(escapeHtml(lesson.sentence.zh)));
  assert.ok(all.includes(escapeHtml(lesson.writePrompt.en)));
  assert.ok(all.includes(escapeHtml(lesson.writePrompt.zh)));
  assert.ok(all.includes('data-word-id="'+escapeHtml(entry.id)+'"'));
  for(const group of lesson.change.groups){
    assert.ok(all.includes(escapeHtml(group.examples[0])));
  }
  for(const idea of lesson.imagineIdeas){
    assert.ok(all.includes(escapeHtml(idea.prompt.en)));
    assert.ok(all.includes(escapeHtml(idea.prompt.zh)));
  }
}
const seven=selectEntries(entries,{range:'month',start:1,count:7}).entries;
assert.equal((renderWorkbook(entries,daily.items,seven).match(/class="sheet workbook"/g)||[]).length,7);
const chosen=selectEntries(entries,{range:'selected',ids:'relief,joy'}).entries;
assert.equal((renderWorkbook(entries,daily.items,chosen).match(/class="sheet workbook"/g)||[]).length,2);
assert.match(all,/Curated draft/);
assert.match(all,/Guided from dictionary source/);
assert.ok(!all.includes('feeling-placeholder.svg'));
assert.throws(()=>renderWorkbook(entries,daily.items.filter(item=>item.id!=='joy'),[entries[0]]),/Missing Daily 5/);
assert.match(read('static/emotions/workbook.html'),/\.\/workbook\.js/);
assert.match(read('static/emotions/workbook.css'),/\.wb-writing-line/);
assert.match(read('static/emotions/practice.html'),/\.\/workbook\.html/);
console.log('OK: 225 printable Daily 5 pages; 14 curated draft and 211 source-guided lessons, five sections, prompts and handwriting lines.');
