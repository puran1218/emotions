(function emolexDailyFive(){
  'use strict';
  const root=document.getElementById('practice-root');
  const live=document.getElementById('practice-status');
  let items=[],lesson=null,step=0,repeats=0,situation='',reflection='',showChinese=false,changeGroup=0;
  const labels=[['Listen','只听'],['Repeat','跟读'],['Change','替换'],['Imagine','想象'],['Write','写下']];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now=new Date(),dateId=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  const todayNumber=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
  const savedKey=()=> 'emolex.daily5.'+dateId+'.'+lesson.id;
  function say(value){
    if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance!=='function'){live.textContent='Speech is not available in this browser.';return;}
    try{
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(value);
      utterance.lang='en-US';utterance.rate=.86;
      window.speechSynthesis.speak(utterance);
      live.textContent='Speaking: '+value;
    }catch{live.textContent='Speech is unavailable right now.';}
  }
  function markdown(){
    return [
      '# EmoLex · Daily 5 — '+dateId,
      '',
      'Feeling: '+lesson.word.en+' / '+lesson.word.zh,
      '',
      '## Minute 1 — Listen',
      lesson.sentence.en,
      '',
      '## Minute 2 — Repeat aloud three times',
      lesson.sentence.en,
      '',
      '## Minute 3 — Change different parts of the sentence',
      ...lesson.change.groups.flatMap(group=>[
        '',
        '### '+group.label.en+' / '+group.label.zh,
        ...group.examples.map(x=>'- '+x)
      ]),
      '',
      '## Minute 4 — Imagine',
      lesson.imagine.en,
      '',
      ...lesson.imagineIdeas.flatMap(idea=>[
        '### '+idea.label.en+' / '+idea.label.zh,
        idea.prompt.en,
        'Example: '+idea.example,
        ''
      ]),
      'My own situation:',
      situation.trim()||'(Not written yet)',
      '',
      '## Minute 5 — Write',
      lesson.writePrompt.en,
      '',
      reflection.trim()||'(Not written yet)',
      '',
      'Source: EmoLex · YOU CAN SAY · '+lesson.id,
      'Editorial preview · content not independently reviewed',
      ''
    ].join('\n');
  }
  function download(){
    const blob=new Blob([markdown()],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download='emolex-daily5-'+dateId+'-'+lesson.id+'.md';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
    live.textContent='Practice note downloaded.';
  }
  function save(){
    try{
      localStorage.setItem(savedKey(),JSON.stringify({situation,reflection}));
      live.textContent='Saved privately in this browser. No account or upload.';
      render();
    }catch{live.textContent='Local saving is unavailable; use Download instead.';}
  }
  function choose(item){
    lesson=item;step=0;repeats=0;situation='';reflection='';showChinese=false;changeGroup=0;
    try{
      const data=JSON.parse(localStorage.getItem(savedKey())||'null');
      if(data&&typeof data==='object'){situation=String(data.situation||'');reflection=String(data.reflection||'');}
    }catch{}
    render();
  }
  function work(){
    if(step===0)return '<p class="daily-prompt">Listen to the whole English sentence. Try not to translate it yet.</p>'+
      '<button class="daily-speak" data-daily-action="listen" type="button">▶ Listen to the sentence</button>'+
      '<p class="daily-hint">只听句子，先别翻译。专注声音、停顿和节奏。</p>';
    if(step===1)return '<p class="daily-prompt">Say the whole sentence out loud three times. Keep the same natural rhythm.</p>'+
      '<button class="daily-speak" data-daily-action="listen" type="button">▶ Hear it again</button> '+
      '<button class="daily-action secondary" data-daily-action="repeat" type="button">I said it · +1</button>'+
      '<p class="daily-counter" aria-live="polite">Spoken aloud: '+repeats+' / 3</p>'+
      '<p class="daily-hint">大声跟读三次。这里不使用麦克风，次数由你自己确认。</p>';
    if(step===2){
      const groups=lesson.change.groups;
      const selected=groups[changeGroup]||groups[0];
      return '<p class="daily-prompt">Try changing <strong>who, what, or when</strong>. Keep the idea natural and say each version aloud.</p>'+
        '<p class="daily-hint">每次只改一个有意义的部分：人物、动作、事情或时间。不必拘泥于单个单词。</p>'+
        '<div class="daily-change-tabs" role="group" aria-label="Ways to change this sentence">'+groups.map((group,i)=>
          '<button type="button" class="daily-change-tab" data-daily-action="change-group" data-group-index="'+i+'" aria-pressed="'+(i===changeGroup?'true':'false')+'">'+
            esc(group.label.en)+' <span lang="zh-CN">'+esc(group.label.zh)+'</span></button>').join('')+'</div>'+
        '<div class="daily-variants">'+selected.examples.map((x,i)=>
          '<button class="daily-variant" type="button" data-daily-action="variant" data-variant-index="'+i+'">▶ '+esc(x)+'</button>').join('')+
        '</div><p class="daily-hint">▶ '+groups.length+' types of change · '+groups.reduce((sum,g)=>sum+g.examples.length,0)+' speakable examples. Each version starts from today’s sentence.</p>';
    }
    if(step===3)return '<p class="daily-prompt">'+esc(lesson.imagine.en)+'</p>'+
      '<p class="daily-hint">'+esc(lesson.imagine.zh)+'</p>'+
      '<div class="daily-ideas">'+lesson.imagineIdeas.map((idea,i)=>
        '<div class="daily-idea"><h3>'+esc(idea.label.en)+' <span lang="zh-CN">'+esc(idea.label.zh)+'</span></h3>'+
        '<p>'+esc(idea.prompt.en)+'</p>'+
        '<p class="daily-idea-zh" lang="zh-CN">'+esc(idea.prompt.zh)+'</p>'+
        '<p class="daily-idea-example" lang="en">“'+esc(idea.example)+'”</p>'+
        '<div class="daily-idea-actions"><button type="button" class="daily-idea-try" data-daily-action="idea" data-idea-index="'+i+'">Use as a starting point · 参考这句</button>'+
        '<button type="button" class="daily-idea-speak" data-daily-action="idea-speak" data-idea-index="'+i+'" aria-label="Listen to example: '+esc(idea.example)+'">▶ Listen</button></div>'+
        '</div>').join('')+'</div>'+
      '<label class="daily-field" for="daily-situation">Your own English sentence · 你自己的英文句子</label>'+
      '<textarea id="daily-situation" class="daily-textarea" maxlength="700" placeholder="A moment from my own life…">'+esc(situation)+'</textarea>'+
      '<p class="daily-hint">Choose an idea, then change it to fit your real life. Existing writing is never overwritten.</p>';
    return '<p class="daily-prompt">'+esc(lesson.writePrompt.en)+'</p>'+
      '<p class="daily-hint">'+esc(lesson.writePrompt.zh)+'</p>'+
      '<label class="daily-field" for="daily-reflection">Today, I want to write…</label>'+
      '<textarea id="daily-reflection" class="daily-textarea" maxlength="1500" placeholder="Today, I…">'+esc(reflection)+'</textarea>'+
      '<div class="daily-actions"><button class="daily-action" type="button" data-daily-action="save">Save in this browser</button>'+
      '<button class="daily-action secondary" type="button" data-daily-action="download">↓ Download my practice (.md)</button></div>'+
      '<p class="daily-hint">Your writing stays on this device unless you choose to download it. No AI or microphone recording is used.</p>';
  }
  function render(){
    if(!lesson)return;
    const title=labels[step];
    root.innerHTML='<article class="daily-card">'+
      '<div class="daily-top"><div><p class="daily-eyebrow">EMOLEX · DAILY 5</p>'+
      '<h1 class="daily-title">One sentence. Five minutes.</h1>'+
      '<p class="daily-subtitle">每天一句 · 听、说、变、想、写 · '+esc(lesson.word.en)+' / '+esc(lesson.word.zh)+'</p></div>'+
      '<span class="daily-date">'+esc(dateId)+'</span></div>'+
      '<div class="daily-sentence"><h2 lang="en">'+esc(lesson.sentence.en)+'</h2>'+
      (step>=2&&showChinese?'<p class="daily-translation" lang="zh-CN">'+esc(lesson.sentence.zh)+'</p>':'')+
      (step>=2?'<button class="daily-action secondary" type="button" data-daily-action="translate">'+(showChinese?'Hide Chinese · 隐藏翻译':'Show Chinese · 查看中文')+'</button>':'')+
      '</div>'+
      '<nav class="daily-progress" aria-label="Jump to a practice minute">'+labels.map(([en,zh],i)=>
        '<button type="button" class="daily-progress-step" data-daily-action="go" data-step="'+i+'"'+
        (i===step?' aria-current="step"':'')+' aria-label="Go to minute '+(i+1)+': '+esc(en)+'"'+
        '><span class="daily-progress-number">'+(i+1)+'</span><span class="daily-progress-word">'+esc(en)+'</span></button>').join('')+'</nav>'+
      '<section class="daily-work"><p class="daily-eyebrow">MINUTE '+(step+1)+' / 5</p>'+
      '<h2 class="daily-minute">'+esc(title[0])+' · '+esc(title[1])+'</h2>'+
      work()+'</section>'+
      '<nav class="daily-nav" aria-label="Practice steps">'+
      '<button class="daily-action secondary" type="button" data-daily-action="previous"'+(step===0?' disabled':'')+'>← Previous</button>'+
      '<button class="daily-action" type="button" data-daily-action="next"'+(step===4?' disabled':'')+'>Next minute →</button></nav>'+
      '<div class="daily-foot">This is a self-paced five-step habit; “minute” is a guide, not a timed test. Curated draft from the existing EmoLex sentence library.</div>'+
      '<div class="daily-actions"><button class="daily-action secondary" type="button" data-daily-action="another">Try another curated sentence ↗</button>'+
      '<a class="daily-return" href="./?word='+encodeURIComponent(lesson.id)+'">Read this feeling · 阅读词条</a></div>'+
      '</article>';
    document.title='Daily 5 · '+lesson.word.en+' · EmoLex';
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-daily-action]');
    if(!btn||!lesson)return;
    const action=btn.dataset.dailyAction;
    if(action==='listen')say(lesson.sentence.en);
    if(action==='repeat'){repeats=Math.min(3,repeats+1);render();}
    if(action==='change-group'){
      const index=Number(btn.dataset.groupIndex);
      if(Number.isInteger(index)&&index>=0&&index<lesson.change.groups.length){changeGroup=index;render();}
    }
    if(action==='variant'){
      const index=Number(btn.dataset.variantIndex),group=lesson.change.groups[changeGroup];
      if(group&&Number.isInteger(index)&&index>=0&&index<group.examples.length)say(group.examples[index]);
    }
    if(action==='idea-speak'){
      const index=Number(btn.dataset.ideaIndex);
      if(Number.isInteger(index)&&index>=0&&index<lesson.imagineIdeas.length)say(lesson.imagineIdeas[index].example);
    }
    if(action==='idea'){
      const index=Number(btn.dataset.ideaIndex);
      if(Number.isInteger(index)&&index>=0&&index<lesson.imagineIdeas.length){
        if(situation.trim()){live.textContent='You already wrote a sentence. Edit it directly to keep your work.';}
        else{
          situation=lesson.imagineIdeas[index].example;
          render();
          document.getElementById('daily-situation')?.focus();
          live.textContent='Example added as a starting point. Make it your own.';
        }
      }
    }
    if(action==='go'){
      const index=Number(btn.dataset.step);
      if(Number.isInteger(index)&&index>=0&&index<labels.length){step=index;render();}
    }
    if(action==='previous'){step=Math.max(0,step-1);render();}
    if(action==='next'){step=Math.min(4,step+1);render();}
    if(action==='translate'){showChinese=!showChinese;render();}
    if(action==='save')save();
    if(action==='download')download();
    if(action==='another'){
      const index=items.findIndex(x=>x.id===lesson.id);
      const next=items[(index+1)%items.length];
      history.replaceState(null,'','?word='+encodeURIComponent(next.id));
      choose(next);
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='daily-situation')situation=event.target.value;
    if(event.target.id==='daily-reflection')reflection=event.target.value;
  });
  async function load(){
    try{
      const res=await fetch('./data/daily5.json',{cache:'no-cache'});
      if(!res.ok)throw Error('Could not load lesson library');
      const payload=await res.json();
      if(payload.status!=='curated-practice-proposals-not-human-approved'||!Array.isArray(payload.items)||!payload.items.length)throw Error('No reviewed starter structure');
      items=payload.items;
      const wanted=new URL(location.href).searchParams.get('word');
      const selected=items.find(x=>x.id===wanted)||items[((todayNumber%items.length)+items.length)%items.length];
      choose(selected);
    }catch{
      root.innerHTML='<div class="daily-error">Daily 5 could not load. Return to <a href="./">EmoLex</a> and try again.</div>';
    }
  }
  load();
})();
