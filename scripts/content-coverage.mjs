#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const canonical=read('data/concepts/pilot.json');
const ledger=fs.readFileSync(path.join(root,'data/review-ledger.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const approvedContent=e=>e.review?.translation==='approved'&&e.review?.meaning==='approved'&&e.review?.child_suitability==='approved';
const resolvedStatus=new Set(['published','excluded']);
const stats={
  sourceOccurrences:ledger.length,
  sourceResolved:ledger.filter(e=>resolvedStatus.has(e.status)).length,
  sourceUnresolved:ledger.filter(e=>!resolvedStatus.has(e.status)).length,
  sourceLinkedToConcept:ledger.filter(e=>typeof e.proposed_concept_id==='string'&&e.proposed_concept_id.trim()).length,
  conceptsVisible:canonical.filter(e=>['pilot','published'].includes(e.status)).length,
  conceptsPublished:canonical.filter(e=>e.status==='published').length,
  conceptsContentApproved:canonical.filter(approvedContent).length,
  conceptsWithPlaceholder:canonical.filter(e=>e.illustration?.src==='./images/feeling-placeholder.svg').length,
  conceptsWithApprovedIllustration:canonical.filter(e=>e.illustration?.stage==='approved'&&e.review?.illustration==='approved').length
};
console.log('EmoLex editorial coverage');
for(const [key,value] of Object.entries(stats))console.log('  '+key+': '+value);
if(process.argv.includes('--release')){
  const issues=[];
  if(stats.sourceUnresolved)issues.push(stats.sourceUnresolved+' source occurrences still need explicit review/merge/split/exclusion');
  if(stats.conceptsVisible===0)issues.push('no visible concepts');
  if(stats.conceptsContentApproved!==stats.conceptsVisible)issues.push((stats.conceptsVisible-stats.conceptsContentApproved)+' visible concepts need bilingual content review');
  if(stats.conceptsPublished!==stats.conceptsVisible)issues.push((stats.conceptsVisible-stats.conceptsPublished)+' visible concepts still have non-published editorial status');
  if(issues.length){
    console.error('FULL-CONTENT RELEASE GATE BLOCKED:');
    issues.forEach(issue=>console.error('  - '+issue));
    console.error('A small private pilot can be tested separately; do not call it the complete EmoLex dictionary.');
    process.exitCode=1;
  }else{
    console.log('Full-content release gate passed (still requires manual micro.blog/device acceptance).');
  }
}
