import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {selectEntries,printImage,renderBook,escapeHtml} from '../static/emotions/print-core.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=filename => fs.readFileSync(path.join(root,filename),'utf8');
const entries=JSON.parse(read('static/emotions/data/emotions.json')).entries;
const closer=JSON.parse(read('static/emotions/data/closer-experiment.json')).comparisons;
assert.equal(entries.length,225);
assert.equal(closer.length,225);
assert.equal(new Set(entries.map(e=>e.id)).size,225);
assert.equal(selectEntries(entries,{range:'all'}).entries.length,225);
assert.equal(selectEntries(entries,{range:'month',start:31,count:30}).entries.length,30);
assert.equal(selectEntries(entries,{range:'month',start:225,count:30}).entries.length,1);
assert.deepEqual(selectEntries(entries,{range:'selected',ids:'relief, joy\njoy'}).entries.map(e=>e.id),['joy','relief']);
assert.deepEqual(selectEntries(entries,{range:'selected',ids:'not-in-dictionary'}).missing,['not-in-dictionary']);
const book=renderBook(entries,entries,closer,{layout:'full',language:'en'});
assert.equal((book.match(/class="sheet full"/g)||[]).length,225);
assert.equal((book.match(/class="closer-section"/g)||[]).length,225);
for (const entry of entries) {
  assert.ok(book.includes(escapeHtml(entry.definition.en)));
  assert.ok(book.includes(escapeHtml(entry.definition.zh)));
  assert.ok(book.includes(escapeHtml(entry.scene.en)));
  assert.ok(book.includes(escapeHtml(entry.scene.zh)));
  for (const sample of entry.say) {
    assert.ok(book.includes(escapeHtml(sample.en)));
    assert.ok(book.includes(escapeHtml(sample.zh)));
  }
}
for (const comparison of closer) {
  assert.ok(book.includes(escapeHtml(comparison.takeaway.en)));
  assert.ok(book.includes(escapeHtml(comparison.takeaway.zh)));
  assert.ok(book.includes(escapeHtml(comparison.first.description.en)));
  assert.ok(book.includes(escapeHtml(comparison.second.description.zh)));
}
assert.ok(!book.includes('feeling-placeholder.svg'));
const compact=renderBook(entries,entries,closer,{layout:'compact',language:'zh'});
assert.equal((compact.match(/class="sheet compact"/g)||[]).length,113);
assert.equal((compact.match(/class="compact-entry"/g)||[]).length,225);
assert.equal((compact.match(/class="closer-section"/g)||[]).length,0);
assert.equal((renderBook(entries,entries.slice(0,30),closer,{layout:'compact'}).match(/class="sheet compact"/g)||[]).length,15);
assert.equal(printImage(entries[0]),null);
const approved={illustration:{stage:'approved',src:'./images/joy-v01.webp'}};
assert.equal(printImage(approved),'./images/joy-v01.webp');
assert.equal(printImage({illustration:{stage:'pending',src:'./images/joy-v01.webp'}}),null);
assert.equal(printImage({illustration:{stage:'approved',src:'https://other.site/unsafe.webp'}}),null);
assert.ok(escapeHtml('<script>').includes('&lt;script&gt;'));
assert.match(read('static/emotions/print.css'),/@page\s*\{\s*size:A4 portrait/);
assert.match(read('static/emotions/print.html'),/\.\/print\.js/);
assert.match(read('static/emotions/app.js'),/\.\/print\.html/);
console.log('OK: printable full/compact coverage, 225 bilingual concepts and comparisons, range handling and safe artwork.');
