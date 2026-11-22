import {escapeHtml,printImage} from './print-core.js';

function bilingual(value, language='en') {
  const first=language==='zh'?'zh':'en';
  const second=first==='en'?'zh':'en';
  return '<div class="wb-bilingual"><p class="wb-primary" lang="'+(first==='zh'?'zh-CN':'en')+'">'+escapeHtml(value?.[first])+'</p>'+
    '<p class="wb-secondary" lang="'+(second==='zh'?'zh-CN':'en')+'">'+escapeHtml(value?.[second])+'</p></div>';
}

function step(number,en,zh,body,extra='') {
  return '<section class="wb-step '+extra+'"><header class="wb-step-head"><span class="wb-number">'+number+'</span><h3>'+escapeHtml(en)+' <span lang="zh-CN">'+escapeHtml(zh)+'</span></h3></header>'+body+'</section>';
}

function lines(count=2) {
  return Array.from({length:count},()=>'<div class="wb-writing-line" aria-hidden="true"></div>').join('');
}

function writeGroups(lesson) {
  const guided=lesson.mode==='guided-source';
  return '<div class="wb-change-options">'+lesson.change.groups.map(group =>
    '<div class="wb-change-option"><strong>'+escapeHtml(group.label.en)+' <span lang="zh-CN">'+escapeHtml(group.label.zh)+'</span></strong>'+
    (group.prompt?'<p class="wb-hint">'+escapeHtml(group.prompt.en)+'</p>':'')+
    '<p class="wb-sample">'+(guided?'Original: ':'Try: ')+escapeHtml(group.examples[0])+'</p></div>').join('')+'</div>';
}

function writeIdeas(lesson,language) {
  return '<div class="wb-ideas">'+lesson.imagineIdeas.map(idea =>
    '<div class="wb-idea"><strong>'+escapeHtml(idea.label.en)+' <span lang="zh-CN">'+escapeHtml(idea.label.zh)+'</span></strong>'+
    bilingual(idea.prompt,language)+'</div>').join('')+'</div>';
}

function renderPage(entry,lesson,number,total,language) {
  if (!Array.isArray(lesson.change?.groups) || lesson.change.groups.length!==3 ||
      !Array.isArray(lesson.imagineIdeas) || lesson.imagineIdeas.length!==3) {
    throw new Error('Incomplete Daily 5 lesson: '+entry.id);
  }
  const art=printImage(entry);
  const mode=lesson.mode==='curated'?'Curated draft · 精编练习草稿':'Guided from dictionary source · 词典原句引导';
  return '<section class="sheet workbook" data-word-id="'+escapeHtml(entry.id)+'">'+
    '<div class="book-line"><span>EMOLEX / DAILY 5 · 每日五分钟</span><span>LESSON '+String(number).padStart(3,'0')+' / '+total+'</span></div>'+
    '<header class="wb-title"><div><h1>'+escapeHtml(entry.word.en)+'</h1><h2 lang="zh-CN">'+escapeHtml(entry.word.zh)+'</h2>'+
    '<p class="forms">'+escapeHtml(entry.word.feelingEn)+' · '+escapeHtml(entry.word.feelingZh)+'</p></div>'+
    (art?'<img class="wb-illustration" src="'+escapeHtml(art)+'" alt="'+escapeHtml(entry.alt?.en || entry.word.en)+'">':'')+'</header>'+
    '<div class="wb-definition">'+bilingual(entry.definition,language)+'</div>'+
    step(1,'LISTEN','听一听','<p class="wb-instruction">Listen on Daily 5 online, or ask someone to read this English sentence aloud.</p>'+
      '<p class="wb-phrase" lang="en">'+escapeHtml(lesson.sentence.en)+'</p>','wb-listen')+
    step(2,'REPEAT','跟着说','<p class="wb-instruction">Say the English sentence three times. Check each box when you finish.</p>'+
      '<div class="wb-repeat"><span class="wb-checkbox"></span> 1 <span class="wb-checkbox"></span> 2 <span class="wb-checkbox"></span> 3</div>','wb-repeat-stage')+
    step(3,'CHANGE','改一改','<p class="wb-instruction">'+(lesson.mode==='guided-source'?
      'Use these original dictionary sentences as starting points. Create your own change; the samples are not corrected answers.':
      'Choose one way to change the sentence. You do not have to try them all.')+'</p>'+
      '<div class="wb-translation">'+escapeHtml(lesson.sentence.zh)+'</div>'+
      writeGroups(lesson)+'<p class="wb-prompt">My changed sentence · 我改写的一句话</p>'+lines(1),'wb-change')+
    step(4,'IMAGINE','想一想','<p class="wb-instruction">'+escapeHtml(lesson.imagine.en)+'</p>'+writeIdeas(lesson,language)+
      '<p class="wb-prompt">One moment from my life · 发生在我生活里的事</p>'+lines(1),'wb-imagine')+
    step(5,'WRITE','写下来',bilingual(lesson.writePrompt,language)+lines(3),'wb-write')+
    '<footer class="page-foot"><span>EmoLex · '+escapeHtml(mode)+' · 内容未获独立审校</span><span>'+escapeHtml(entry.id)+'</span></footer>'+
    '</section>';
}

export function renderWorkbook(entries,lessons,selected,{language='en'}={}) {
  const known=new Map(lessons.map(lesson=>[lesson.id,lesson]));
  const numbered=new Map(entries.map((entry,index)=>[entry.id,index+1]));
  return selected.map(entry => {
    const lesson=known.get(entry.id);
    if (!lesson) {
      throw new Error('Missing Daily 5 lesson for '+entry.id);
    }
    return renderPage(entry,lesson,numbered.get(entry.id),entries.length,language);
  }).join('');
}
