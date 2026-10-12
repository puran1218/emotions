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

export const makeRuntime = (entries) => ({
  version:1,
  disclaimer:"Editorial pilot. Entries require final content and illustration sign-off before production release.",
  entries:entries.map(projectConcept)
});
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const canonical=JSON.parse(fs.readFileSync(path.join(root,'data/concepts/pilot.json'),'utf8'));
  const out=path.join(root,'static/emotions/data/emotions.json');
  fs.writeFileSync(out,JSON.stringify(makeRuntime(canonical),null,2)+'\n','utf8');
  console.log('Built '+canonical.length+' pilot entries → '+path.relative(root,out));
}
