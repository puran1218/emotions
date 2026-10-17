#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const normalized=s=>String(s??'').normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const words=s=>String(s??'').match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[];
const sentences=s=>String(s??'').split(/(?<=[.!?。！？])\s+/u).filter(Boolean);
const tokens=s=>new Set(normalized(s).split(' ').filter(x=>x&&x.length>2));
const similarity=(a,b)=>{
  const x=tokens(a),y=tokens(b);
  if(!x.size||!y.size)return 0;
  let both=0;for(const token of x)if(y.has(token))both++;
  return both/(x.size+y.size-both);
};

export function analyzeConcept(concept){
  const id=concept.id,issues=[];
  const flag=(field,lang,rule,note,severity='advisory')=>issues.push({id,field,lang,rule,severity,note});
  for(const field of ['definition','scenario']){
    for(const lang of ['en','zh']){
      const value=concept[field]?.[lang];
      if(typeof value!=='string'||!value.trim()){flag(field,lang,'missing-text','The bilingual text is empty.','structural');continue;}
      if(lang==='en'){
        for(const sentence of sentences(value))if(words(sentence).length>25)flag(field,lang,'long-sentence',`One sentence contains ${words(sentence).length} English words (guidance: around 25 maximum, with exceptions).`);
      }else if([...value].length>90){
        flag(field,lang,'long-chinese-copy','The Chinese passage exceeds 90 characters; check readability on a phone.');
      }
    }
  }
  const expr=concept.expression;
  if(!Array.isArray(expr)||expr.length<3||expr.length>4){flag('expression','both','example-count','Expected 3–4 expression pairs.','structural');}
  if(Array.isArray(expr)){
    for(const lang of ['en','zh']){
      const seen=new Set();
      for(let i=0;i<expr.length;i++){
        const value=expr[i]?.[lang];
        const field=`expression[${i}]`;
        if(typeof value!=='string'||!value.trim()){flag(field,lang,'missing-expression','Missing expression text.','structural');continue;}
        const key=normalized(value);
        if(seen.has(key))flag(field,lang,'duplicate-expression','Repeated expression in this language.','structural');
        seen.add(key);
        if(lang==='en'&&words(value).length>24)flag(field,lang,'long-spoken-example',`Spoken example has ${words(value).length} words; listen for a natural child-length phrase.`);
        if(lang==='zh'&&[...value].length>50)flag(field,lang,'long-spoken-example','Chinese spoken example has more than 50 characters.');
        if(lang==='en'&&/\b(?:everyone|everybody)\s+(?:always|will|must)\s+feel\b/i.test(value))flag(field,lang,'universal-emotion-claim','A feeling may not be universal.');
      }
      for(let i=0;i<expr.length;i++)for(let j=i+1;j<expr.length;j++){
        if(typeof expr[i]?.[lang]!=='string'||typeof expr[j]?.[lang]!=='string')continue;
        if(normalized(expr[i][lang])!==normalized(expr[j][lang])&&similarity(expr[i][lang],expr[j][lang])>.85){
          flag('expression',lang,'near-duplicate',`Examples ${i+1} and ${j+1} use nearly the same words; review their different speaking purposes.`);
        }
      }
    }
  }
  const en=concept.definition?.en||'';
  if(/\b(?:feeling bad|good feeling|just feel bad)\b/i.test(en))flag('definition','en','vague-definition','The definition relies on an overly broad feeling word.');
  if(/\b(?:everyone|everybody)\s+(?:always|will|must)\s+feel\b/i.test(en))flag('definition','en','universal-emotion-claim','A scenario can be possible without being universal.');
  return issues;
}
export function reviewCatalog(concepts){
  const issues=concepts.flatMap(analyzeConcept);
  const byRule={};
  for(const issue of issues)byRule[issue.rule]=(byRule[issue.rule]||0)+1;
  return {conceptCount:concepts.length,flaggedConceptCount:new Set(issues.map(x=>x.id)).size,issueCount:issues.length,byRule,issues};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),pilotOnly=args.includes('--pilot'),json=args.includes('--json');
  const entries=[...read('data/concepts/pilot.json'),...(pilotOnly?[]:read('data/concepts/legacy-expanded.json'))];
  const report=reviewCatalog(entries);
  if(json){
    console.log(JSON.stringify({method:'heuristic-advisory-not-an-editorial-approval',...report},null,2));
  }else{
    console.log(`EmoLex plain-language advisory scan: ${report.conceptCount} entries, ${report.flaggedConceptCount} flagged, ${report.issueCount} suggestions`);
    for(const [rule,count] of Object.entries(report.byRule).sort((a,b)=>b[1]-a[1]))console.log(`  ${rule}: ${count}`);
    for(const x of report.issues.slice(0,12))console.log(`  ${x.id} · ${x.field} · ${x.lang}: ${x.note}`);
    console.log('Advisory only. Sense, nuance, bilingual naturalness, child-suitability and illustration coherence require human judgment.');
  }
}
