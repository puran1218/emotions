#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const pilotSource=read('data/editorial/closer-pilots.json');
const curatedSources=[
  read('data/editorial/closer-corpus-positive.json'),
  read('data/editorial/closer-corpus-negative.json')
];
const pilots=read('data/concepts/pilot.json');
const legacy=read('data/concepts/legacy-expanded.json');
const visible=[...pilots,...legacy.filter(e=>e.status==='pilot'||e.status==='published')];
const canonical=new Map(visible.map(e=>[e.id,e]));
const allowedIds=new Set(visible.map(e=>e.id));
const bilingual=(v,min=4)=>v&&['en','zh'].every(lang=>typeof v[lang]==='string'&&v[lang].trim().length>=min);
assert.equal(visible.length,225,'Current full preview has 225 visible entries');
assert.equal(new Set(visible.map(e=>e.id)).size,visible.length,'Canonical senses must remain distinct');
assert.equal(pilotSource.status,'experimental-not-human-approved');
assert.equal(pilotSource.comparisons.length,3,'Keep three original handwritten comparisons');

const byId=new Map();
for(const item of pilotSource.comparisons){
  assert.ok(allowedIds.has(item.id),'Unknown pilot comparison '+item.id);
  assert.equal(item.reviewer,null,'No pilot comparison is automatically reviewed');
  assert.ok(bilingual(item.question)&&bilingual(item.takeaway),'Pilot question and insight must be bilingual');
  assert.ok(bilingual(item.first.description)&&bilingual(item.second.description),'Pilot cards need bilingual copy');
  byId.set(item.id,{
    id:item.id,
    kind:item.kind,
    compareWith:item.compareWith,
    question:item.question,
    first:item.first,
    second:item.second,
    takeaway:item.takeaway,
    reviewStatus:'draft-proposal'
  });
}

for(const source of curatedSources){
  assert.equal(source.reviewStatus,'draft-proposal-not-human-approved');
  for(const item of source.records){
    assert.ok(allowedIds.has(item.id),'Withheld or unknown sense must not be shown: '+item.id);
    assert.ok(allowedIds.has(item.compareWith),'Unknown comparison target: '+item.compareWith+' for '+item.id);
    assert.notEqual(item.id,item.compareWith,'Comparison cannot point to itself: '+item.id);
    assert.ok(!byId.has(item.id),'Duplicate contrast: '+item.id);
    assert.equal(item.reviewer,null,'Generated content must not impersonate a human review: '+item.id);
    assert.ok(bilingual(item.takeaway,8),'A unique English/Chinese takeaway is required: '+item.id);
    const entry=canonical.get(item.id);
    const target=canonical.get(item.compareWith);
    const nonFeeling=['physical_state','attitude_trait','descriptive_other'];
    const kind=nonFeeling.includes(entry.taxonomy.kind)||nonFeeling.includes(target.taxonomy.kind)?'sense-or-state-contrast':'emotion-vs-emotion';
    byId.set(item.id,{
      id:item.id,
      kind,
      compareWith:item.compareWith,
      takeaway:item.takeaway,
      reviewStatus:'draft-proposal'
    });
  }
}
assert.equal(byId.size,visible.length,'Full-corpus coverage should be exactly 225 (including 3 pilots)');
for(const entry of visible)assert.ok(byId.has(entry.id),'Missing edited comparison for '+entry.id);
for(const entry of legacy.filter(e=>e.status==='draft'))assert.ok(!byId.has(entry.id),'Withheld word leaked '+entry.id);
const result={
  version:2,
  status:'full-corpus-editorial-proposals-not-human-approved',
  coverage:{visible:visible.length,pilotHandcrafted:pilotSource.comparisons.length,curatedAdditional:visible.length-pilotSource.comparisons.length},
  comparisons:visible.map(e=>byId.get(e.id))
};
const content=JSON.stringify(result,null,2)+'\n';
const output=path.join(root,'static/emotions/data/closer-experiment.json');
if(process.argv.includes('--check')){
  assert.ok(fs.existsSync(output),'Missing generated contrast overlay. Run npm run build:closer');
  assert.equal(fs.readFileSync(output,'utf8'),content,'The generated contrast overlay is out of date');
  console.log('OK: 225 carefully mapped bilingual contrast proposals, no withheld senses, canonical definitions remain authoritative.');
}else{
  fs.writeFileSync(output,content,'utf8');
  console.log('Built '+result.coverage.visible+' A Little Closer proposals, preserving the original canonical definitions and expressions.');
}
