#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,obj,check)=>{
 const dest=path.join(root,p);
 const content=JSON.stringify(obj,null,2)+'\n';
 if(check){
   if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8')!==content)
     throw new Error('Editorial packet drift: regenerate '+p);
 }else fs.writeFileSync(dest,content,'utf8');
};
const original=read('data/legacy/emotions-card.json').entries;
const concepts=read('data/concepts/legacy-expanded.json');
const clarity=read('data/editorial/legacy-calibration.json');
const migration=read('data/legacy/migration-report.json');
const mapping=new Map(migration.links.filter(x=>x.disposition!=='linked_to_existing_pilot').map(x=>[x.concept_id,x]));
const confusion=new Map(Object.entries({
 'absorbed':'interested','amazed':'astonished','amused':'joyous','animated':'energetic',
 'appreciative':'grateful','ardent':'enthusiastic','astonished':'surprised-met','blissful':'contented',
 'buoyant':'cheerful','calm':'serene','carefree':'unconcerned','complacent':'proud',
 'composed':'calm','concerned-met':'concerned-unmet','confident':'complacent',
 'contented':'joyous','curious':'inquisitive','delighted':'pleased','eager':'expectant',
 'ebullient':'cheerful','ecstatic':'overjoyed','effervescent':'ebullient','elated':'proud',
 'enchanted':'fascinated','encouraged':'confident','engrossed':'absorbed',
 'enlivened':'energetic','enthusiastic':'ardent','excited':'anxious','exhilarated':'thrilled',
 'expansive':'friendly','expectant':'eager','fascinated':'curious','fulfilled':'satisfied',
 'glad':'happy','gleeful':'mirthful','grateful':'thankful','gratified':'proud',
 'hopeful':'optimistic','inquisitive':'curious','inspired':'excited','intrigued':'interested',
 'intense-met':'intense-unmet','jubilant':'elated','joyous':'happy','keyed-up':'nervous',
 'mellow':'relaxed','merry':'cheerful','mirthful':'amused','moved':'touched',
 'overjoyed':'ecstatic','overwhelmed-met':'overwhelmed-unmet','peaceful':'calm',
 'perky':'energetic','pleased':'satisfied','proud':'complacent','radiant':'cheerful',
 'rapturous':'thrilled','relaxed':'calm','satisfied':'contented','secure':'calm',
 'sensitive-met':'moved','serene':'peaceful','spellbound':'engrossed',
 'surprised-met':'surprised-unmet','tender':'loving','thankful':'grateful','thrilled':'excited',
 'touched':'moved','tranquil':'serene','trusting':'secure','upbeat':'cheerful',
 'agitated':'restless','alarmed':'startled','aloof':'lonely','angry':'furious',
 'anxious':'nervous','apathetic':'indifferent','apprehensive':'anxious',
 'ashamed':'guilty','bewildered':'confused','bitter':'resentful',
 'blue':'sad','bored':'apathetic','brokenhearted':'sad','chagrined':'embarrassed',
 'concerned-unmet':'concerned-met','cross':'irritated','dejected':'disappointed',
 'depressed':'sad','despairing':'discouraged','despondent':'downcast','detached':'withdrawn',
 'disappointed':'discouraged','discouraged':'frustration','disenchanted':'disappointed',
 'disgruntled':'resentful','disgusted':'repelled','disheartened':'discouraged',
 'dismayed':'shocked','displeased':'unhappy','disquieted':'uneasy','distressed':'upset',
 'disturbed':'irritated','downcast':'sad','downhearted':'dejected','edgy':'nervous',
 'embarrassed':'ashamed','embittered':'bitter','exasperated':'frustration',
 'fearful':'scared','fidgety':'restless','forlorn':'loneliness',
 'frightened':'scared','furious':'angry','gloomy':'sad','guilty':'ashamed',
 'helpless':'discouraged','hesitant':'reluctant','horrified':'terrified',
 'hostile':'angry','humdrum':'bored','hurt':'sad','impatient':'frustration',
 'indifferent':'apathetic','intense-unmet':'intense-met','irate':'furious',
 'irked':'irritated','irritated':'irked','jealous':'envious',
 'jittery':'nervous','leery':'suspicious','lethargic':'tired',
 'listless':'apathetic','mad':'angry','miserable':'wretched','mopey':'sad',
 'morose':'gloomy','mournful':'sorrowful','nervous':'anxious',
 'nettled':'irked','numb':'sad','overwhelmed-unmet':'anxious',
 'panicky':'terrified','perplexed':'puzzled','pessimistic':'worried',
 'puzzled':'confused','rancorous':'resentful','reluctant':'hesitant',
 'repelled':'disgusted','resentful':'bitter','restless':'fidgety',
 'sad':'loneliness','scared':'startled','sensitive-unmet':'hurt',
 'shocked':'startled','skeptical':'suspicious','sorrowful':'sad','sorry':'guilty',
 'startled':'scared','surprised-unmet':'surprised-met','suspicious':'skeptical',
 'terrified':'scared','troubled':'worried','uneasy':'anxious',
 'unglued':'overwhelmed-unmet','unhappy':'sad','unnerved':'startled',
 'upset':'angry','uptight':'anxious','vexed':'frustration',
 'weary':'tired','wistful':'mournful','withdrawn':'aloof',
 'woeful':'sorrowful','worried':'anxious','wretched':'miserable'
}));
const visualRisk=e=>e.taxonomy.kind==='physical_state'?'This is primarily a bodily state, not proof of an emotion; avoid medical claims.':
 e.taxonomy.kind==='attitude_trait'?'This may describe an attitude or repeated behavior; do not label a child as a bad person.':
 e.taxonomy.kind==='descriptive_other'?'This may describe a property of an experience rather than the child’s emotion.':
 'Visible faces are only clues; a picture cannot prove what a child feels.';
const allRecords=concepts.map(e=>{
 const source=e.sources.find(s=>s.source_list==='emotions-card.zip');
 const old=original[source.source_index];
 const proposal=clarity.entries[e.id];
 if(!old||!proposal||!mapping.has(e.id))throw new Error('Missing source/proposal for '+e.id);
 return {id:e.id,legacyIndex:source.source_index,sourceWord:old.english,sourceCategory:old.source_category,
   senseType:e.taxonomy.kind,previewDisposition:e.status==='draft'?'withheld-sense-review':'visible-editorial-preview',
   sourceExplanation:{en:old.explanation_en,zh:old.explanation_zh},
   proposed:{terms:e.terms,definition:e.definition,scenario:e.scenario,expression:e.expression},
   relatedSenseContrast:confusion.get(e.id)||null,
   expressionChanges:Object.keys(proposal.expressionPatch||{}).map(Number).sort(),
   calibration:"editorial-proposal-not-independent-approval",
   humanEditorialApproval:null,
   safetyReviewRequired:e.status==='draft'||e.taxonomy.kind!=='feeling_state'};
});
const briefs=concepts.map(e=>({
 id:e.id,
 word:{en:e.terms.en.feeling,zh:e.terms.zh.feeling},
 kind:e.taxonomy.kind,
 previewDisposition:e.status==='draft'?'withheld-sense-review':'visible-editorial-preview',
 coreMeaning:e.definition,
 storyMoment:e.scenario,
 focalQuestion:'What concrete event in this exact scene should a child notice first?',
 visibleClueCandidate:e.scenario.en,
 requiresObservableStoryboardEvidence:true,
 invisibleContextWarning:'Do not assume a child’s emotion from facial appearance; context and the accompanying scenario carry invisible history.',
 confusableWith:confusion.get(e.id)||null,
 mustAvoid:[visualRisk(e),'Do not add a new event, a text caption inside the image, or frightening / floating facial features.','Do not treat one facial expression as a reliable diagnosis of a feeling.'],
 withoutTextTest:'Can a child describe the event shown? Is the intended feeling plausible without mistaking it for the listed contrast?',
 composition:'One still scene, horizontal 3:2, readable main action inside a 12% safe edge and at Explore thumbnail size.',
 artStatus:'conceptual-brief-needs-individual-storyboard-review',
 stage:'planning-only-not-art-approved'
}));
const check=process.argv.includes('--check');
write('data/editorial/legacy-review-packets.json',{version:1,source:'emotions-card.zip + curated migration',status:'proposed-not-human-approved',entries:allRecords},check);
write('data/illustration-briefs/legacy-candidates.json',{version:1,source:'data/concepts/legacy-expanded.json',status:'conceptual-planning-not-art-approved',briefs},check);
console.log('OK: '+allRecords.length+' source-linked before/after editorial packets and '+briefs.length+' conceptual static-art planning records'+(check?' match their sources':' generated'));
