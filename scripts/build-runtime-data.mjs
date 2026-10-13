#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const projectConcept=function project(item){
  return {
    id:item.id,
    needs:item.taxonomy.needs,
    word:{en:item.terms.en.noun||item.terms.en.feeling,zh:item.terms.zh.noun||item.terms.zh.feeling,feelingEn:item.terms.en.feeling,feelingZh:item.terms.zh.feeling},
    emoji:item.emoji,
    pronunciation:item.pronunciation,
    definition:item.definition,
    scene:item.scenario,
    say:item.expression.map(({en,zh})=>({en,zh})),
    related:item.related_ids,
    visual:item.illustration.asset_id.replace(/-storyboard$/,""),
    alt:item.illustration.alt,
    status:item.status,
    illustration:{src:item.illustration.src,stage:item.illustration.stage}
  };
};

export const visibleConcepts = (pilot,legacy) => [...pilot,...legacy.filter(e=>e.status==='pilot'||e.status==='published')];
export const makeRuntime = (entries) => ({
  version:1,
  disclaimer:"Editorial preview: entries and examples may still need individual bilingual and child-suitability review. Not every original source term is shown.",
  entries:entries.map(projectConcept)
});
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const pilot=JSON.parse(fs.readFileSync(path.join(root,'data/concepts/pilot.json'),'utf8'));
  const legacy=JSON.parse(fs.readFileSync(path.join(root,'data/concepts/legacy-expanded.json'),'utf8'));
  const canonical=visibleConcepts(pilot,legacy);
  const out=path.join(root,'static/emotions/data/emotions.json');
  fs.writeFileSync(out,JSON.stringify(makeRuntime(canonical),null,2)+'\n','utf8');
  console.log('Built '+canonical.length+' pilot/preview entries ('+legacy.filter(x=>x.status==='draft').length+' sensitive legacy records withheld) → '+path.relative(root,out));
}
