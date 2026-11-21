export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

export function selectEntries(all, {range='all', start=1, count=30, ids=''}={}) {
  const unique = new Map(all.map(entry => [entry.id, entry]));
  if (range === 'all') {
    return {entries:all.slice(), missing:[]};
  }
  if (range === 'month') {
    const offset = Math.max(0, Math.min(all.length - 1, Math.floor(Number(start) || 1) - 1));
    const size = Math.max(1, Math.min(225, Math.floor(Number(count) || 30)));
    return {entries:all.slice(offset, offset + size), missing:[]};
  }
  if (range === 'selected') {
    const requested = [...new Set(String(ids).split(/[\s,;，；]+/).map(s => s.trim().toLowerCase()).filter(Boolean))];
    const found = new Set(requested.filter(id => unique.has(id)));
    return {entries:all.filter(entry => found.has(entry.id)), missing:requested.filter(id => !unique.has(id))};
  }
  throw new Error('Unknown print range.');
}

export function printImage(entry) {
  const image = entry.illustration;
  if (!image || image.stage !== 'approved') {
    return null;
  }
  const path = image.src || '';
  if (!/^\.\/images\/[a-z0-9-]+-v\d{2}\.webp$/.test(path) || path.includes('placeholder')) {
    return null;
  }
  return path;
}

function pair(value, language='en', className='bilingual') {
  const first = language === 'zh' ? 'zh' : 'en';
  const second = first === 'zh' ? 'en' : 'zh';
  return '<div class="'+className+'"><p lang="'+(first === 'zh' ? 'zh-CN' : 'en')+'" class="primary">'+escapeHtml(value?.[first])+'</p>'+
    '<p lang="'+(second === 'zh' ? 'zh-CN' : 'en')+'" class="secondary">'+escapeHtml(value?.[second])+'</p></div>';
}

function label(en, zh) {
  return '<h3 class="section-heading">'+escapeHtml(en)+' <span lang="zh-CN">'+escapeHtml(zh)+'</span></h3>';
}

function picture(entry) {
  const src = printImage(entry);
  if (!src) {
    return '';
  }
  return '<img class="print-illustration" src="'+escapeHtml(src)+'" alt="'+escapeHtml(entry.alt?.en || entry.word.en)+'" width="960" height="640" decoding="async">';
}

function sayLines(entry, language) {
  return '<ol class="expressions">'+entry.say.map(sample => '<li>'+pair(sample, language, 'bilingual expression')+'</li>').join('')+'</ol>';
}

function closerSection(entry, comparison, language) {
  if (!comparison || comparison.id !== entry.id) {
    return '';
  }
  const first = comparison.first || {label:entry.word, description:entry.definition};
  const second = comparison.second;
  if (!second) {
    return '';
  }
  return '<section class="closer-section">'+label('A LITTLE CLOSER','再理解一点')+
    pair(comparison.question || {en:'What is the difference?', zh:'有什么不同？'},language,'bilingual closer-question')+
    '<div class="comparison-grid">'+[first,second].map(side => '<div class="comparison-item"><h4>'+escapeHtml(side.label?.en)+' · '+escapeHtml(side.label?.zh)+'</h4>'+
      pair(side.description,language)+'</div>').join('')+'</div>'+
    '<div class="takeaway">'+pair(comparison.takeaway,language)+'</div></section>';
}

function relatedSection(entry, byId) {
  const related = (entry.related || []).map(id => byId.get(id)).filter(Boolean);
  return related.length ? '<div class="related"><strong>RELATED · 相关感受</strong> '+related.map(e => escapeHtml(e.word.en)+' · '+escapeHtml(e.word.zh)).join('  /  ')+'</div>' : '';
}

function fullEntry(entry, comparison, language, number, total, byId) {
  return '<section class="sheet full" data-word-id="'+escapeHtml(entry.id)+'"><div class="book-line"><span>EMOLEX / FEELINGS · 情绪词语</span><span>'+number+' / '+total+'</span></div>'+
    '<article class="entry"><header class="entry-head"><div><h1>'+escapeHtml(entry.word.en)+'</h1>'+
    '<h2 lang="zh-CN">'+escapeHtml(entry.word.zh)+'</h2><p class="forms">'+escapeHtml(entry.word.feelingEn)+' · '+escapeHtml(entry.word.feelingZh)+'</p></div>'+picture(entry)+'</header>'+
    '<section class="content-section">'+label('WHAT DOES IT MEAN?','这是一种怎样的感受？')+pair(entry.definition,language)+'</section>'+
    '<section class="content-section">'+label('IMAGINE THIS','想象一下')+pair(entry.scene,language)+'</section>'+
    '<section class="content-section">'+label('YOU CAN SAY','你可以这样说')+sayLines(entry,language)+'</section>'+
    closerSection(entry,comparison,language)+relatedSection(entry,byId)+
    '<section class="writing-space">'+label('MY OWN EXAMPLE','我的例子')+'<div class="writing-line"></div><div class="writing-line"></div></section>'+
    '</article><footer class="page-foot"><span>EmoLex · 内容审校预览 / Editorial preview</span><span>'+escapeHtml(entry.id)+'</span></footer></section>';
}

function compactEntry(entry, language, number, total) {
  return '<article class="compact-entry" data-word-id="'+escapeHtml(entry.id)+'"><header class="compact-head"><div>'+
    '<span class="small-index">'+number+' / '+total+'</span><h2>'+escapeHtml(entry.word.en)+' <span lang="zh-CN">'+escapeHtml(entry.word.zh)+'</span></h2>'+
    '<p class="forms">'+escapeHtml(entry.word.feelingEn)+' · '+escapeHtml(entry.word.feelingZh)+'</p></div>'+picture(entry)+'</header>'+
    '<div class="compact-body">'+label('MEANING','意思')+pair(entry.definition,language)+
    label('SCENE','场景')+pair(entry.scene,language)+label('YOU CAN SAY','你可以这样说')+sayLines(entry,language)+'</div></article>';
}

export function renderBook(all, selected, comparisons, {layout='full', language='en'}={}) {
  const map = new Map(all.map((e,i) => [e.id,{entry:e,number:i+1}]));
  const byId = new Map(all.map(e => [e.id,e]));
  const closerMap = new Map(comparisons.map(e => [e.id,e]));
  if (layout === 'compact') {
    const sheets = [];
    for (let index=0; index<selected.length; index+=2) {
      const group = selected.slice(index,index+2);
      sheets.push('<div class="sheet compact"><div class="compact-grid">'+group.map(e =>
        compactEntry(e,language,String(map.get(e.id).number).padStart(3,'0'),all.length)).join('')+
        '</div><footer class="page-foot"><span>EmoLex · Editorial preview / 内容审校预览</span><span>PRINTABLE CARDS</span></footer></div>');
    }
    return sheets.join('');
  }
  if (layout !== 'full') {
    throw new Error('Unknown print layout.');
  }
  return selected.map(e => fullEntry(e,closerMap.get(e.id),language,String(map.get(e.id).number).padStart(3,'0'),all.length,byId)).join('');
}
