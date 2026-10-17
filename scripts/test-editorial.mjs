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
const ambiguous=JSON.parse(JSON.stringify(pilots[0]));
ambiguous.id='mad';ambiguous.terms.en.feeling='Mad';
assert.ok(analyzeConcept(ambiguous).some(x=>x.rule==='manual-sense-triage'&&x.severity==='advisory'),'sensitive sense must trigger an explicit human-review suggestion, not a rejection');


// Full legacy review packets are source-derived proposals, not independent approvals.
const legacy=read('data/concepts/legacy-expanded.json');
const clarity=read('data/editorial/legacy-calibration.json');
const reviewPackets=read('data/editorial/legacy-review-packets.json');
const visualCandidates=read('data/illustration-briefs/legacy-candidates.json');
const runtime=read('static/emotions/data/emotions.json').entries;
assert.equal(legacy.length,230);
assert.equal(Object.keys(clarity.entries).length,230,'every migrated concept has a per-word calibrated bilingual definition and scene');
assert.equal(reviewPackets.entries.length,230,'source-linked editorial packets must cover all legacy concepts');
assert.equal(visualCandidates.briefs.length,230,'all legacy concepts have an explicit static visual candidate, including withheld senses');
const packets=new Map(reviewPackets.entries.map(x=>[x.id,x]));
const candidateMap=new Map(visualCandidates.briefs.map(x=>[x.id,x]));
assert.equal(packets.size,230);
assert.equal(candidateMap.size,230);
let expressionChanges=0,withheld=0;
for(const entry of legacy){
  const proposal=clarity.entries[entry.id],packet=packets.get(entry.id),visual=candidateMap.get(entry.id);
  assert.ok(proposal&&packet&&visual,'missing full-corpus review record for '+entry.id);
  assert.equal(proposal.reviewStatus,'proposed');
  assert.equal(packet.humanEditorialApproval,null,'automatic revision cannot claim human editorial approval');
  assert.equal(packet.calibration,'editorial-proposal-not-independent-approval');
  assert.equal(packet.legacyIndex,entry.sources.find(x=>x.source_list==='emotions-card.zip').source_index);
  assert.deepEqual(packet.proposed.definition,entry.definition);
  assert.deepEqual(packet.proposed.scenario,entry.scenario);
  assert.deepEqual(packet.proposed.expression,entry.expression);
  assert.deepEqual(visual.coreMeaning,entry.definition);
  assert.deepEqual(visual.storyMoment,entry.scenario);
  assert.equal(visual.artStatus,'conceptual-brief-needs-individual-storyboard-review');
  assert.equal(visual.stage,'planning-only-not-art-approved');
  assert.equal(entry.illustration.src,'./images/feeling-placeholder.svg','new illustration must remain deferred');
  assert.notEqual(entry.review.meaning,'approved');
  assert.notEqual(entry.review.translation,'approved');
  if(entry.status==='draft')withheld++;
  expressionChanges+=Object.keys(proposal.expressionPatch||{}).length;
  const live=runtime.find(x=>x.id===entry.id);
  if(entry.status==='pilot'){
    assert.ok(live,'preview entry missing from runtime '+entry.id);
    assert.deepEqual(live.definition,entry.definition);
    assert.deepEqual(live.scene,entry.scenario);
    assert.deepEqual(live.say,entry.expression);
  }else assert.ok(!live,'withheld sense must remain out of runtime '+entry.id);
}
assert.equal(expressionChanges,70,'individual speaking example changes must be traceable');
assert.equal(withheld,10,'high-risk meanings remain withheld');
assert.equal(reviewCatalog(legacy).issues.filter(x=>x.severity==='structural').length,0,'bilingual review drafts must remain structurally valid');
console.log('OK: all 230 migrated concepts have traceable bilingual definition/scenario proposals, 70 expression edits, original sources, and 230 future visual-planning candidates.');

console.log('OK: 5 bilingual pilot before/after records, semantic illustration briefs, placeholder boundary, and advisory checker tests.');
