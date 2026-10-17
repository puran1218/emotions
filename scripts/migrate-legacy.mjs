#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
function migrateLegacy(legacy,pilot){
  const merges={affectionate:"affection",frustrated:"frustration",lonely:"loneliness",relieved:"relief",joyful:"joy"};
  const dup=new Set(["concerned","intense","overwhelmed","sensitive","surprised"]);
  const withheld=new Set(["aroused","depressed","guilty","mad","suspicious","cool","hot","lazy","mean","numb"]);
  const physical=new Set(["hot","warm","cold","sleepy","tired","weary","exhausted","fatigued","beat","breathless","wide-awake","shaky","numb","uncomfortable","unsteady","refreshed","invigorated"]);
  const attitudes=new Set(["friendly","helpful","lazy","mean","optimistic","pessimistic","trusting","sensitive","aloof","hostile","passive","unconcerned","quiet","loving"]);
  const descriptive=new Set(["glorious","splendid","wonderful","pleasant","mellow","horrible","tepid","cool","alive","dull"]);
  const corrections={guilty:"内疚的",mad:"生气的",suspicious:"怀疑的",disturbed:"感到不安的",jealous:"嫉妒的",lazy:"不想动的",cool:"感觉酷的",aroused:"被激起的（需要核实具体含义）",numb:"麻木的",mean:"刻薄的",horrible:"糟糕的"};
  const manual={
    absorbed:[["I'm completely absorbed in my drawing.","我画画画得可入迷了。"],["I was so focused that I forgot the time.","我太专心了，都忘了时间。"],["Can I finish this part first?","我能先画完这一部分吗？"]],
    adventurous:[["I feel adventurous today!","今天我想去冒险！"],["I want to explore that new playground.","我想探索那个新游乐场。"],["Shall we try something new together?","我们一起试试新鲜事物好吗？"]],
    amazed:[["I'm amazed!","我太惊讶了！"],["I can't believe what I just saw!","我简直不敢相信刚才看见的！"],["Come and look at this!","快来看看！"]],
    calm:[["I feel calm now.","我现在很平静。"],["My breathing is slow and easy.","我慢慢呼吸，感觉舒服多了。"],["Let's sit quietly for a moment.","我们安静地坐一会儿吧。"]],
    cheerful:[["I feel cheerful today!","今天我的心情真好！"],["This song makes me want to smile.","这首歌让我忍不住笑。"],["Want to sing with me?","你想和我一起唱吗？"]],
    confident:[["I feel confident.","我很有信心。"],["I practiced, and now I'm ready.","我练习过了，现在准备好了。"],["I think I can do this!","我觉得我能做到！"]],
    contented:[["I feel contented.","我现在很满足。"],["I'm happy just sitting here.","光是坐在这里，我就很满足。"],["I don't need anything else right now.","我现在已经很满足啦。"]],
    curious:[["I'm curious.","我很好奇。"],["I wonder how that works.","我想知道那个东西是怎么运作的。"],["Can you tell me more?","你能多告诉我一些吗？"]],
    delighted:[["I'm delighted!","我真是太高兴了！"],["Your surprise made my day.","你的惊喜让我特别开心。"],["Thank you for thinking of me!","谢谢你想着我！"]],
    eager:[["I'm eager to start!","我迫不及待想开始了！"],["I've been waiting for this all day.","我等这个等了一整天。"],["Can we start now?","我们现在可以开始吗？"]],
    excited:[["I'm so excited!","我好兴奋啊！"],["I can hardly wait to open my gift.","我等不及想拆礼物了。"],["Come celebrate with me!","来和我一起庆祝吧！"]],
    fascinated:[["I'm fascinated by these bugs.","这些小虫子太让我着迷了。"],["I could watch them all afternoon.","我能看它们看一下午。"],["Would you like to look with me?","你想和我一起看看吗？"]],
    free:[["I feel free!","我感觉自由自在！"],["There's so much space to run.","这里有好大一片地方可以跑。"],["Come run with me!","快来和我一起跑吧！"]],
    grateful:[["I feel grateful.","我心里很感激。"],["Thank you for helping me today.","谢谢你今天帮了我。"],["Your kindness means a lot to me.","你的好意让我很感动。"]],
    happy:[["I feel happy!","我好开心！"],["Playing this game makes me smile.","玩这个游戏让我笑个不停。"],["Come play with me!","来和我一起玩吧！"]],
    hopeful:[["I feel hopeful.","我心里充满希望。"],["I think tomorrow can be better.","我觉得明天会更好。"],["Shall we try again tomorrow?","我们明天再试一次好吗？"]],
    inspired:[["I feel inspired!","我突然有灵感了！"],["I have an idea for a new drawing.","我有个画画的新点子。"],["Can I show you what I imagined?","我能给你看看我的想法吗？"]],
    interested:[["I'm interested in this.","我对这个很感兴趣。"],["I want to learn more about dinosaurs.","我想多了解一些恐龙。"],["Could we read a book about it?","我们能找本相关的书看看吗？"]],
    nervous:[["I feel nervous.","我有点紧张。"],["My tummy feels funny before the test.","考试前，我的肚子有点不舒服。"],["Could you stay with me for a moment?","你能陪我一会儿吗？"]],
    angry:[["I feel angry.","我生气了。"],["I got upset when my toy was broken.","玩具被弄坏了，我很生气。"],["I need a little time to calm down.","我需要一点时间冷静。"]],
    anxious:[["I'm feeling anxious.","我现在有点焦虑。"],["I keep thinking about my first school day.","我总想着开学第一天会怎么样。"],["Can we talk about what worries me?","我们能聊聊让我担心的事吗？"]],
    ashamed:[["I feel ashamed.","我觉得很惭愧。"],["I wish I'd told the truth.","我真希望刚才说了实话。"],["Can I tell you what happened?","我能跟你说说发生了什么吗？"]],
    bored:[["I feel bored.","我好无聊。"],["I can't think of anything fun to do.","我想不出有什么好玩的事。"],["Can we find something to do together?","我们能一起找点事做吗？"]],
    confused:[["I feel confused.","我有点糊涂了。"],["I don't understand these instructions.","我看不懂这些说明。"],["Can you explain it one more time?","你能再解释一遍吗？"]],
    disappointed:[["I feel disappointed.","我很失望。"],["I was hoping the picnic would happen.","我本来很期待今天的野餐。"],["Can we make a new plan?","我们能重新安排吗？"]],
    discouraged:[["I feel discouraged.","我有点灰心。"],["I tried so many times, but it's still hard.","我试了好多次，还是很难。"],["Could you encourage me to try again?","你能鼓励我再试一次吗？"]],
    embarrassed:[["I feel embarrassed.","我好尴尬。"],["Everyone saw me make that mistake.","大家都看到我出错了。"],["Please give me a moment.","请让我缓一缓。"]],
    fearful:[["I feel afraid.","我有点害怕。"],["It's dark and I can't see well.","这里好黑，我看不清。"],["Can you hold my hand?","你能牵着我的手吗？"]],
    frightened:[["I was frightened.","我被吓到了。"],["That sound scared me!","刚才那个声音吓了我一跳！"],["Can you stay close to me?","你能离我近一点吗？"]],
    jealous:[["I feel jealous.","我有点嫉妒。"],["I wish I had a turn too.","我也希望能轮到我。"],["Could we take turns?","我们可以轮流玩吗？"]],
    impatient:[["I'm getting impatient.","我开始不耐烦了。"],["Waiting in this line feels so long.","排队等得我好着急。"],["How much longer do we need to wait?","我们还要等多久？"]],
    sad:[["I feel sad.","我有点难过。"],["I miss my friend today.","今天我很想念朋友。"],["Could I have a hug?","你能抱抱我吗？"]],
    scared:[["I feel scared.","我有点害怕。"],["That loud noise made me jump.","刚才的巨响把我吓了一跳。"],["Can we go somewhere quieter?","我们能去安静一点的地方吗？"]],
    sorry:[["I'm sorry.","对不起。"],["I wish I hadn't said that.","我真希望刚才没有那样说。"],["How can I make things better?","我该怎么弥补呢？"]],
    tired:[["I feel tired.","我累了。"],["My legs are tired after that long walk.","走了好久，我的腿都累了。"],["Can we take a break?","我们能休息一下吗？"]],
    upset:[["I feel upset.","我心里不好受。"],["That didn't turn out as I hoped.","事情和我想的不一样。"],["Could we talk about it?","我们能聊聊这件事吗？"]],
    worried:[["I feel worried.","我有点担心。"],["I keep thinking about what might happen.","我总想着接下来会发生什么。"],["Can you help me make a plan?","你能帮我想个办法吗？"]],
    relaxed:[["I feel relaxed.","我现在很放松。"],["It's nice to rest after playing.","玩完以后休息真舒服。"],["Let's sit quietly for a while.","我们安静地坐一会儿吧。"]],
    proud:[["I feel proud of myself!","我为自己感到骄傲！"],["I finished that hard project.","我完成了那个很难的作品。"],["Can I show you what I made?","我能给你看看我的作品吗？"]],
    thankful:[["I'm thankful for your help.","谢谢你帮助我。"],["You made a hard day easier.","有你帮忙，今天轻松多了。"],["I want to say thank you.","我想认真地谢谢你。"]],
    hurt:[["My feelings are hurt.","我心里受伤了。"],["Those words made me feel sad.","那些话让我很难受。"],["Please don't say that to me.","请不要再那样对我说话。"]]
  };
  const groupRules=[
    ["rest","beat exhausted fatigued lethargic listless sleepy tired weary heavy wide-awake numb uncomfortable".split(" ")],
    ["explain","bewildered confused perplexed puzzled skeptical suspicious intrigued curious inquisitive".split(" ")],
    ["comfort","blue brokenhearted dejected depressed despairing despondent distressed downcast downhearted forlorn gloomy lonely miserable mopey morose mournful sad sorrowful unhappy wistful woeful wretched".split(" ")],
    ["space","agitated angry bitter cross disgruntled displeased embittered exasperated furious hostile impatient irate irked irritated mad nettled rancorous resentful upset vexed frustrated".split(" ")],
    ["reassurance","alarmed anxious apprehensive dismayed disquieted edgy fearful fidgety frightened hesitant horrified jittery leery nervous panicky scared shaky shocked startled terrified troubled uneasy unnerved uptight worried".split(" ")],
    ["company","aloof detached disaffected withdrawn indifferent lonely forlorn passive".split(" ")],
    ["share","adventurous amazed amused animated appreciative astonished blissful buoyant cheerful confident contented dazzled delighted eager ecstatic elated enchanted encouraged energetic enthusiastic excited exhilarated expectant exultant glad gleeful glowing grateful gratified happy hopeful inspired joyous joyful jubilant merry mirthful moved overjoyed pleased proud radiant rapturous satisfied spellbound surprised thankful thrilled touched upbeat wonderful zestful".split(" ")]
  ];
  const questions={rest:["Can we take a little break?","我们能休息一会儿吗？"],explain:["Can you explain it to me?","你能给我解释一下吗？"],comfort:["Could you stay with me for a while?","你能陪我一会儿吗？"],space:["I need a little time to calm down.","我需要一点时间冷静下来。"],reassurance:["Can we talk about what worries me?","我们能聊聊让我担心的事吗？"],company:["Could we spend some time together?","我们能一起待一会儿吗？"],share:["Come and share this moment with me!","快来和我一起感受这一刻！"],met:["I'd like to share this with you.","我想把这件开心的事告诉你。"],unmet:["Could we talk about how I feel?","我们能聊聊我的感受吗？"]};
  const stripEmoji=t=>t.replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu,"").trim().replace(/[.!?。！？,\s]+$/g,"");
  const splitEn=t=>{const s=stripEmoji(t);const m=/,\s*(?:like (?:when\s+)?|such as\s+|as when\s+)/i.exec(s);return m?[s.slice(0,m.index).trim(),s.slice(m.index+m[0].length).trim()]:[s,""];};
  const splitZh=t=>{const s=stripEmoji(t);const m=/，\s*(?:就像|比如说|比如|像是|例如|像|如)/.exec(s);return m?[s.slice(0,m.index).trim(),s.slice(m.index+m[0].length).trim()]:[s,""];};
  const punctuation=(t,lang)=>t.replace(/[\s.!?。！？]+$/g,"")+(lang==="zh"?"。":".");
  const scenarioEn=(example,meaning)=>{if(!example)return punctuation(meaning,"en");let e=example.trim();if(/^you're /i.test(e))return punctuation("You're "+e.slice(7),"en");if(/^you /i.test(e))return punctuation("You "+e.slice(4),"en");if(/^when you /i.test(e))return punctuation("You "+e.slice(9),"en");if(/^(dancing|exploring|wearing|watching|going|opening|playing|sharing|reading|helping|feeling|learning|running|thinking|making|eating|telling|meeting|being|spending|waiting|getting|finding|finishing|cuddling|petting|working|trying|walking|talking|listening|sitting|lying|building|creating|saying|seeing|standing|looking|doing|asking|enjoying|joking|hearing|riding|singing|holding|having)\b/i.test(e))return punctuation("You're "+e,"en");return punctuation(e.charAt(0).toUpperCase()+e.slice(1),"en");};
  const scenarioZh=(example,meaning)=>{if(!example)return punctuation(meaning,"zh");let e=example.trim().replace(/时$/,"");return punctuation(e.startsWith("你")?e:e.startsWith("当")?e:"你在"+e,"zh");};
  const firstPersonContext=(example,word)=>{if(!example)return "This is making me feel "+word+".";let e=example.trim();if(/^you're /i.test(e))return "I feel "+word+" when I'm "+e.slice(7)+".";if(/^you /i.test(e))return "I feel "+word+" when I "+e.slice(4)+".";if(/^when you /i.test(e))return "I feel "+word+" when I "+e.slice(9)+".";if(/^[a-z]+ing\b/i.test(e))return "I feel "+word+" when I'm "+e+".";return "I feel "+word+" when I think about "+e+".";};
  const chineseContext=(ex,zh)=>{if(!ex)return "这件事让我觉得"+zh+"。";let e=ex.trim().replace(/[。]$/,"");if(e.endsWith("时"))e=e.slice(0,-1);if(e.startsWith("你"))e="我"+e.slice(1);else e="我在"+e;return punctuation(e+"的时候，我觉得"+zh,"zh");};
  const expanded=[],links=[],flags=[],ids=new Set(pilot.map(e=>e.id));
  for(const entry of legacy.entries){
    const word=entry.english.trim(),lower=word.toLowerCase(),category=entry.source_category;
    const source={source_list:"emotions-card.zip",source_word:word,source_index:entry.legacy_index};
    if(merges[lower]){links.push({legacy_index:entry.legacy_index,word,concept_id:merges[lower],disposition:"linked_to_existing_pilot"});continue;}
    const id=lower.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+(dup.has(lower)?category==="needs_met"?"-met":"-unmet":"");
    if(ids.has(id))throw Error("Duplicate concept ID: "+id);ids.add(id);
    const [meaningEn,exampleEn]=splitEn(entry.explanation_en),[meaningZh,exampleZh]=splitZh(entry.explanation_zh);
    const zh=corrections[lower]||entry.chinese.trim(),zhFeel=zh.replace(/的$/,"");
    const sourceFlags=[];
    if(!exampleEn||!exampleZh)sourceFlags.push("legacy explanation does not clearly separate a situational example");
    if(withheld.has(lower))sourceFlags.push("sense or child suitability requires explicit editorial review before preview");
    if(dup.has(lower))sourceFlags.push("source word has another occurrence with a distinct category/sense");
    if(physical.has(lower)||attitudes.has(lower)||descriptive.has(lower))sourceFlags.push("may not be an emotion: assess feeling-state versus trait/physical description");
    let pairs;
    if(manual[lower]&&!dup.has(lower)){pairs=manual[lower].map(([en,zh])=>({en,zh}));}
    else{
      const group=groupRules.find(([g,arr])=>arr.includes(lower))?.[0]||(category==="needs_met"?"met":"unmet"),last=questions[group];
      const p1=(physical.has(lower)||descriptive.has(lower)?"Right now, I feel ":"I feel ")+lower+".";
      const zh1="我现在觉得"+zhFeel+"。";
      pairs=[{en:p1,zh:zh1},{en:firstPersonContext(exampleEn,lower),zh:chineseContext(exampleZh,zhFeel)},{en:last[0],zh:last[1]}];
      sourceFlags.push("expressions are source-guided draft templates; bilingual fluency not editor-approved");
    }
    const concept={id,status:withheld.has(lower)?"draft":"pilot",taxonomy:{needs:[category],kind:physical.has(lower)?"physical_state":attitudes.has(lower)?"attitude_trait":descriptive.has(lower)?"descriptive_other":"feeling_state"},terms:{en:{noun:null,feeling:word,aliases:[]},zh:{noun:null,feeling:zh,aliases:[]}},definition:{en:punctuation(meaningEn,"en"),zh:punctuation(meaningZh,"zh")},scenario:{en:scenarioEn(exampleEn,meaningEn),zh:scenarioZh(exampleZh,meaningZh)},expression:pairs,emoji:"✦",illustration:{asset_id:"feeling-placeholder",src:"./images/feeling-placeholder.svg",stage:"pending",alt:{en:"A playful notebook and pencil placeholder; a unique feeling illustration will be added later.",zh:"童趣手绘笔记本和铅笔占位图；独立的情绪插画以后再加入。"}},pronunciation:{en:{text:word,locale:"en-US"},zh:{text:zh,locale:"zh-CN"}},related_ids:[],sources:[source],review:{translation:"drafted",meaning:"drafted",child_suitability:"pending",illustration:"pending"}};
    for(const language of ["en","zh"]){const ps=pairs.map(p=>p[language]);if(ps.some(p=>p.length<2)||new Set(ps).size!==3)throw Error("Invalid expression set for "+id+"/"+language);}
    expanded.push(concept);
    links.push({legacy_index:entry.legacy_index,word,concept_id:id,disposition:withheld.has(lower)?"withheld_pending_review":"preview_draft"});
    if(sourceFlags.length)flags.push({legacy_index:entry.legacy_index,word,id,flags:sourceFlags});
  }
  return {expanded,report:{sourceRows:legacy.entries.length,canonicalNew:expanded.length,merged:links.filter(l=>l.disposition==="linked_to_existing_pilot").length,visibleNew:expanded.filter(x=>x.status==="pilot").length,withheld:expanded.filter(x=>x.status==="draft").length,flags,links,notice:"These are source-derived bilingual editorial drafts; no automatic content approval has been applied."}};
}
const source=JSON.parse(fs.readFileSync(path.join(root,"data/legacy/emotions-card.json"),"utf8"));
const pilot=JSON.parse(fs.readFileSync(path.join(root,"data/concepts/pilot.json"),"utf8"));
const result=migrateLegacy(source,pilot);
const overrides={};
for(const name of ["expression-overrides-positive.json","expression-overrides-negative-a.json","expression-overrides-negative-b.json"]){
  const block=JSON.parse(fs.readFileSync(path.join(root,"data/legacy",name),"utf8"));
  for(const [id,examples] of Object.entries(block)){
    if(overrides[id])throw new Error("Repeated editorial override: "+id);
    overrides[id]=examples;
  }
}
const known=new Set(result.expanded.map(x=>x.id));
for(const id of Object.keys(overrides))if(!known.has(id))throw new Error("Unknown editorial override: "+id);
for(const item of result.expanded)if(overrides[item.id])item.expression=overrides[item.id];
for(const entry of result.report.flags){
  if(overrides[entry.id]){
    entry.flags=entry.flags.filter(x=>!x.startsWith("expressions are source-guided draft templates"));
    entry.flags.push("three bilingual examples written individually; editorial approval still pending");
  }
}
const sceneOverrides=JSON.parse(fs.readFileSync(path.join(root,"data/legacy/scene-overrides.json"),"utf8"));
for(const id of Object.keys(sceneOverrides))if(!known.has(id))throw new Error("Unknown scene override: "+id);
for(const item of result.expanded)if(sceneOverrides[item.id])item.scenario=sceneOverrides[item.id];
result.report.scenesCuratedOverrideCount=Object.keys(sceneOverrides).length;
const semanticOverrides=JSON.parse(fs.readFileSync(path.join(root,"data/legacy/semantic-overrides.json"),"utf8"));
for(const id of Object.keys(semanticOverrides))if(!known.has(id))throw new Error("Unknown semantic override: "+id);
for(const item of result.expanded)if(semanticOverrides[item.id]){
 const fix=semanticOverrides[item.id];
 if(fix.zh){item.terms.zh.noun=null;item.terms.zh.feeling=fix.zh;item.pronunciation.zh.text=fix.zh;}
 if(fix.definitionZh)item.definition.zh=fix.definitionZh;
 if(fix.definitionEn)item.definition.en=fix.definitionEn;
}
result.report.semanticOverrideCount=Object.keys(semanticOverrides).length;

// Full-corpus clarity calibration is a source-controlled editorial overlay, not an edit
// to generated legacy-expanded.json. Original ZIP text and manual expression overrides
// remain recoverable. Proposed text does NOT imply human editorial approval.
const clarity=JSON.parse(fs.readFileSync(path.join(root,"data/editorial/legacy-calibration.json"),"utf8"));
if(clarity.reviewStatus==="approved"||clarity.status!=="editorial-proposals-not-human-approved")throw new Error("Invalid calibration review status");
const clarityIds=new Set(result.expanded.map(x=>x.id));
for(const id of Object.keys(clarity.entries))if(!clarityIds.has(id))throw new Error("Unknown clarity calibration ID: "+id);
if(Object.keys(clarity.entries).length!==result.expanded.length)throw new Error("Every migrated concept requires an individual clarity calibration record");
let expressionPatchCount=0;
for(const item of result.expanded){
  const proposal=clarity.entries[item.id];
  if(!proposal?.definition?.en||!proposal.definition.zh||!proposal.scenario?.en||!proposal.scenario.zh)throw new Error("Incomplete bilingual calibration: "+item.id);
  if(proposal.reviewStatus!=="proposed")throw new Error("Unexpected human approval state: "+item.id);
  item.definition={en:proposal.definition.en,zh:proposal.definition.zh};
  item.scenario={en:proposal.scenario.en,zh:proposal.scenario.zh};
  for(const [index,value] of Object.entries(proposal.expressionPatch||{})){
    const pos=Number(index);
    if(!Number.isInteger(pos)||pos<0||pos>=item.expression.length||!value?.en||!value?.zh)throw new Error("Invalid expression patch: "+item.id+"/"+index);
    item.expression[pos]={en:value.en,zh:value.zh};
    expressionPatchCount++;
  }
  // Maintain the original draft/pilot visibility and review ledger semantics.
  if(item.review.translation==="approved"||item.review.meaning==="approved")throw new Error("Automatic clarity review cannot publish an entry");
}
result.report.clarityCalibrationCount=Object.keys(clarity.entries).length;
result.report.clarityExpressionPatchCount=expressionPatchCount;
result.report.clarityReviewStatus=clarity.status;

result.report.handCuratedOverrideCount=Object.keys(overrides).length;
result.report.originalCuratedCount=result.expanded.length-Object.keys(overrides).length;
result.report.templateExpressionCount=0;
const expandedPath=path.join(root,"data/concepts/legacy-expanded.json");
const reportPath=path.join(root,"data/legacy/migration-report.json");
if(process.argv.includes("--check")){
 const currentConcepts=JSON.parse(fs.readFileSync(expandedPath,"utf8"));
 const currentReport=JSON.parse(fs.readFileSync(reportPath,"utf8"));
 const assert=(await import("node:assert/strict")).default;
 assert.deepEqual(currentConcepts,result.expanded,"legacy concepts drifted from the recoverable source and editorial overrides");
 assert.deepEqual(currentReport,result.report,"legacy migration report drifted from source");
 console.log("OK: all legacy concepts and migration decisions reproduce exactly.");
}else{
 fs.writeFileSync(expandedPath,JSON.stringify(result.expanded,null,2)+"\n");
 fs.writeFileSync(reportPath,JSON.stringify(result.report,null,2)+"\n");
 console.log("Legacy concepts: "+result.expanded.length+"; preview: "+result.report.visibleNew+"; withheld: "+result.report.withheld+"; pilot links: "+result.report.merged);
}
