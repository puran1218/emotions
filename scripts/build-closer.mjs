#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const source=read('data/editorial/closer-pilots.json');
const pilot=read('data/concepts/pilot.json');
const legacy=read('data/concepts/legacy-expanded.json');
const known=new Map([...pilot,...legacy].map(e=>[e.id,e]));
const pilotIds=new Set(pilot.map(e=>e.id));
const bilingual=(value,min=5)=>value&&['en','zh'].every(lang=>typeof value[lang]==='string'&&value[lang].trim().length>=min);
assert.equal(source.status,'experimental-not-human-approved');
assert.equal(source.enabledBy,'?closer=1');
assert.equal(source.pilotIds.length,5);
assert.deepEqual(new Set(source.pilotIds),pilotIds);
assert.equal(source.comparisons.length,3);
const ids=new Set();
for(const item of source.comparisons){
  assert.ok(pilotIds.has(item.id),'Comparison must belong to the original five pilots: '+item.id);
  assert.ok(!ids.has(item.id),'Duplicate comparison for '+item.id);
  ids.add(item.id);
  assert.ok(['emotion-vs-emotion','feeling-vs-situation'].includes(item.kind));
  if(item.kind==='emotion-vs-emotion'){
    assert.ok(known.has(item.compareWith),'Unknown comparison sense: '+item.compareWith);
    assert.notEqual(item.compareWith,item.id,'Cannot compare feeling to itself');
  }else assert.equal(item.compareWith,null,'A situation is not silently a dictionary feeling');
  assert.ok(bilingual(item.question),'Question must be bilingual: '+item.id);
  assert.ok(bilingual(item.first.label,1)&&bilingual(item.second.label,1),'Short word labels must still be bilingual: '+item.id);
  for(const value of [item.first.description,item.second.description,item.takeaway]){
    assert.ok(bilingual(value),'Comparison copy must contain meaningful EN/ZH text: '+item.id);
  }
  assert.equal(item.reviewer,null,'Do not imply independent human review');
}
const out=path.join(root,'static/emotions/data/closer-experiment.json');
const publicData={
  version:source.version,
  status:source.status,
  comparisons:source.comparisons.map(({id,kind,compareWith,question,first,second,takeaway})=>({
    id,kind,compareWith,question,first,second,takeaway
  }))
};
const content=JSON.stringify(publicData,null,2)+'\n';
if(process.argv.includes('--check')){
  assert.ok(fs.existsSync(out),'Generated experiment data is missing; run npm run build:closer');
  assert.equal(fs.readFileSync(out,'utf8'),content,'Experiment runtime differs from its editorial source');
  console.log('OK: bilingual contrast overlay is deterministic and remains experimental.');
}else{
  fs.writeFileSync(out,content,'utf8');
  console.log('Built '+source.comparisons.length+' optional contrast panels, isolated from canonical 225-entry runtime.');
}
