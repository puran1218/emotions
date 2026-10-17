#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {analyzeConcept,reviewCatalog} from './review-editorial.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const pilots=read('data/concepts/pilot.json');
const calibration=read('data/editorial/pilot-calibration.json');
const art=read('data/illustration-briefs/pilots.json');
const expected=new Set(['joy','frustration','loneliness','affection','relief']);
assert.equal(pilots.length,5);
assert.deepEqual(new Set(pilots.map(x=>x.id)),expected);
assert.equal(calibration.reviewStatus,'proposed-not-human-approved');
assert.equal(calibration.examples.length,5);
assert.equal(art.reviewStatus,'planning-not-approved');
assert.equal(art.briefs.length,5);
const report=reviewCatalog(pilots);
assert.equal(report.issues.filter(x=>x.severity==='structural').length,0,'five pilot bilingual structures must be complete');

for(const concept of pilots){
  const diff=calibration.examples.find(x=>x.id===concept.id);
  const brief=art.briefs.find(x=>x.id===concept.id);
  assert.ok(diff&&brief,'each pilot needs an editorial delta and visual brief');
  assert.equal(diff.status,'proposed-not-approved');
  assert.equal(diff.reviewer,null);
  assert.equal(brief.artStatus,'pending-human-visual-review');
  assert.ok(diff.before.definition.en&&diff.before.definition.zh);
  assert.ok(diff.before.scenario.en&&diff.before.scenario.zh);
  assert.deepEqual(diff.after.definition,concept.definition);
  assert.deepEqual(diff.after.scenario,concept.scenario);
  assert.deepEqual(diff.after.expression,concept.expression);
  assert.deepEqual(brief.definition,concept.definition,'illustration interpretation must follow the current definition');
  assert.deepEqual(brief.scenario,concept.scenario,'illustration plan must follow the current scene');
  assert.ok(brief.visibleEvidence.length>=3&&brief.mustAvoid.length>=3);
  assert.ok(brief.withoutTextTest.includes('?'));
  assert.ok(brief.confusableWith.length>=1&&brief.distinguishBy.length>=10);
  assert.equal(concept.illustration.src,'./images/feeling-placeholder.svg','no unapproved art should ship');
  for(const stage of ['translation','meaning','child_suitability','illustration'])assert.notEqual(concept.review[stage],'approved','this PR must not silently approve content or art');
}
const sample=JSON.parse(JSON.stringify(pilots[0]));
sample.definition.en=Array(31).fill('words').join(' ')+'.';
assert.ok(analyzeConcept(sample).some(x=>x.rule==='long-sentence'),'oversized definition gets a suggestion');
sample.expression[1].en=sample.expression[0].en;
assert.ok(analyzeConcept(sample).some(x=>x.rule==='duplicate-expression'&&x.severity==='structural'),'exact duplicate is a structural problem');
sample.expression[2].zh='';
assert.ok(analyzeConcept(sample).some(x=>x.rule==='missing-expression'),'missing translation must be flagged');
assert.ok(!analyzeConcept(pilots[0]).some(x=>x.rule==='example-count'),'valid pilots should not be given a false example-count flag');
console.log('OK: 5 bilingual pilot before/after records, semantic illustration briefs, placeholder boundary, and advisory checker tests.');
