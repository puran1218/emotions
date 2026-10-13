(function emolexApp() {
  'use strict';
  const app = document.getElementById('app');
  const live = document.getElementById('live');
  const STORAGE_KEY = 'emolex.language.v1';
  let entries = [];
  let search = '';
  let filter = 'all';
  let current = null;
  let view = 'discover';
  let focusSearchAfterRender = false;
  let language = (() => { try { return localStorage.getItem(STORAGE_KEY) || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch { return 'en'; } })();
  function esc(text) { return String(text == null ? '' : text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function text(e, path, fallback='') { const value = path.split('.').reduce((a,b)=> a && a[b],e); return value || fallback; }
  function normalize(s) { return String(s || '').normalize('NFKC').toLocaleLowerCase().trim().replace(/[-_\s]+/g,''); }
  function t(en,zh) { return language === 'zh' ? zh : en; }
  function head(e) { return language === 'zh' ? [text(e,'word.zh'),text(e,'word.en')] : [text(e,'word.en'),text(e,'word.zh')]; }
  function message(s) { live.textContent = s; }
  function pageUrl(params={}) { const url = new URL(window.location.href); url.search=''; Object.keys(params).forEach(k=>url.searchParams.set(k,params[k])); return url; }
  function resolveRoute() {
    const q = new URL(location.href).searchParams;
    current = q.get('word');
    view = current ? 'detail' : q.get('view') === 'explore' ? 'explore' : 'discover';
  }
  function navigate(next, value) {
    const url = next==='detail' ? pageUrl({word:value}) : next==='explore' ? pageUrl({view:'explore'}) : pageUrl();
    history.pushState({emolex:true}, '', url);
    resolveRoute();
    render();
    window.scrollTo(0,0);
    document.getElementById('main')?.focus();
  }
  function dailyIndex() {
    const today = new Date();
    const token = [today.getFullYear(),today.getMonth()+1,today.getDate()].join('-');
    let hash=0;
    for (const ch of token) hash = ((hash * 31) + ch.charCodeAt(0))|0;
    return Math.abs(hash) % entries.length;
  }
  function pickNext(from) { const i = entries.findIndex(e=>e.id===from); return entries[(i + 1 + entries.length) % entries.length]; }
  function speech(phrase,locale) {
    if (!('speechSynthesis' in window)) { message(t('Voice is unavailable in this browser.','当前浏览器暂不支持语音朗读。')); return; }
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(phrase);
    utterance.lang=locale; utterance.rate=.88;
    const voices=window.speechSynthesis.getVoices();
    utterance.voice=voices.find(v=>v.lang.toLowerCase()===locale.toLowerCase()) || voices.find(v=>v.lang.toLowerCase().startsWith(locale.split('-')[0].toLowerCase())) || null;
    utterance.onerror=()=>message(t('Voice could not start. Try again.','朗读没有成功，请再试一次。'));
    window.speechSynthesis.speak(utterance);
    message(t('Speaking: ','正在朗读：')+phrase);
  }
  async function share(e) {
    const url=pageUrl({word:e.id}).toString(),title=e.word.en+' · '+e.word.zh;
    try {
      if(navigator.share){await navigator.share({url,title});return;}
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);message(t('Link copied.','链接已复制。'));return;}
    }catch(err){if(err.name==='AbortError')return;}
    const input=document.getElementById('share-url');
    if(input){input.hidden=false;input.value=url;input.focus();input.select();}
    message(t('Copy the link below.','请复制下方链接。'));
  }
  let preparedImage=null,preparedKey=null;
  function displayedEntry(){
    if(view==='detail')return entries.find(e=>e.id===current);
    return entries.find(e=>e.id===window.__emolexDiscoverOverride)||entries[dailyIndex()];
  }
  function prepareImageShare(e) {
    const button=document.getElementById('share-image-btn'),service=window.EmoLexShareImage;
    if(!button||!service)return;
    const key=service.key(e,language);
    if(preparedImage&&key===preparedKey){readyImage(button);return;}
    button.disabled=true;
    service.prepare(e,language).then(file=>{
      preparedImage=file;preparedKey=key;
      const currentButton=document.getElementById('share-image-btn');
      if(currentButton&&displayedEntry()?.id===e.id&&service.key(e,language)===key)readyImage(currentButton);
    }).catch(()=>{
      const currentButton=document.getElementById('share-image-btn');
      if(currentButton&&displayedEntry()?.id===e.id){
        currentButton.disabled=true;
        currentButton.querySelector('.action-text').textContent=t('Image unavailable','暂无法生成图片');
      }
    });
  }
  function canShareFile(file){
    try{return !!(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}));}
    catch{return false;}
  }
  function readyImage(button){
    const native=canShareFile(preparedImage);
    button.disabled=false;
    button.querySelector('.action-text').textContent=native?t('Share image','分享图片'):t('Save image','保存图片');
  }
  async function shareImage(e){
    const service=window.EmoLexShareImage;
    if(!service||!preparedImage||preparedKey!==service.key(e,language)){
      message(t('Image is still preparing.','图片还在准备中。'));return;
    }
    // Call the native share sheet before any await: iOS Safari needs a user gesture.
    if(canShareFile(preparedImage)){
      try{await navigator.share({files:[preparedImage],title:e.word.en+' · '+e.word.zh});
        message(t('Image shared.','图片已分享。'));return;
      }catch(err){if(err.name==='AbortError')return;}
    }
    service.download(preparedImage);
    message(t('Image saved to downloads.','图片已保存到下载。'));
  }

  const sectionIcons={definition:'✎',scene:'✳',say:'❞',related:'↗'};
  function artworkSrc(e){
    const source=e.illustration?.src||'';
    return /^\.\/images\/[a-z0-9.-]+\.(webp|png|svg)$/.test(source)?source:'./images/feeling-placeholder.svg';
  }
  function header(){
    return '<header class="site-header"><button class="brand" data-action="discover" aria-label="'+t('EmoLex home','EmoLex 首页')+'">Emo<span>Lex</span><i aria-hidden="true">✳</i></button>'+
      '<span class="tagline">'+t('Feel · Understand · Express','感受 · 理解 · 表达')+'</span>'+
      '<div class="top-actions"><button class="header-explore" data-action="explore">'+t('Explore','探索情绪')+' <span aria-hidden="true">↗</span></button>'+
      '<button class="language-button" data-action="language" aria-label="'+t('Switch to Chinese first','切换英文优先')+'">'+(language==='zh'?'中文 / EN':'EN / 中文')+'</button></div></header>';
  }
  function sectionLabel(field,en,zh){
    return '<h2 class="section-label"><span class="label-icon" aria-hidden="true">'+sectionIcons[field]+'</span><span>'+t(en,zh)+'</span></h2>';
  }
  function bilingual(e,part){
    const first=language,second=language==='zh'?'en':'zh';
    return '<p class="primary-copy" lang="'+(first==='zh'?'zh-CN':'en')+'">'+esc(e[part][first])+'</p>'+
      '<p class="secondary-copy" lang="'+(second==='zh'?'zh-CN':'en')+'">'+esc(e[part][second])+'</p>';
  }
  function media(e){
    const alt=language==='zh'?e.alt.zh:e.alt.en;
    return '<figure class="artwork-wrap"><img class="artwork" src="'+esc(artworkSrc(e))+'" alt="'+esc(alt)+'" width="960" height="640" decoding="async" loading="eager">'+
      '<figcaption class="art-caption">'+(e.illustration?.stage==='approved'?'':t('Illustration coming soon','插画即将加入'))+'</figcaption></figure>';
  }
  function headline(e,context){
    const names=head(e),sp=e.pronunciation?.[language],phrase=sp?.text||names[0];
    const locale=sp?.locale||(language==='zh'?'zh-CN':'en-US');
    const form=language==='zh'?[e.word.feelingZh,e.word.feelingEn.toLocaleLowerCase('en-US')]:[e.word.feelingEn.toLocaleLowerCase('en-US'),e.word.feelingZh];
    const kicker=context==='discover'?(window.__emolexDiscoverOverride?t('DISCOVER A FEELING','探索一种感受'):t("TODAY'S FEELING",'今天的感受')):t('EXPLORE A FEELING','探索一种感受');
    return '<div class="emotion-head"><p class="intro-kicker">'+kicker+' <span aria-hidden="true">✦</span></p>'+
      '<div class="headword-line"><h1 data-fit-word lang="'+(language==='zh'?'zh-CN':'en')+'" title="'+esc(names[0])+'">'+esc(names[0])+'</h1>'+
      '<button class="speak-button" data-action="speak" data-phrase="'+esc(phrase)+'" data-locale="'+esc(locale)+'" aria-label="'+esc(t('Listen to ','朗读 ')+phrase)+'" title="'+esc(t('Listen to ','朗读 ')+phrase)+'">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6.6 9H3v6h3.6l4.4 4V5Zm4 4a4.2 4.2 0 0 1 0 6m2.8-9a8 8 0 0 1 0 12"/></svg></button></div>'+
      '<p class="translation" lang="'+(language==='zh'?'en':'zh-CN')+'">'+esc(names[1])+'</p>'+
      '<p class="usage-form">'+esc(form[0])+' · '+esc(form[1])+'</p>'+
      '</div>';
  }
  function expressions(e){
    const first=language,second=language==='zh'?'en':'zh',locale=first==='zh'?'zh-CN':'en-US';
    return '<div class="expression-grid">'+e.say.map((example,index)=>
      '<div class="expression-card"><div class="expression-phrase">'+
      '<div class="expression-copy"><p class="primary-copy" lang="'+(first==='zh'?'zh-CN':'en')+'">'+esc(example[first])+'</p>'+
      '<p class="secondary-copy" lang="'+(second==='zh'?'zh-CN':'en')+'">'+esc(example[second])+'</p></div>'+
      '<button class="expression-speak" data-action="speak" data-phrase="'+esc(example[first])+'" data-locale="'+locale+'" aria-label="'+esc(t('Listen to example ','朗读第')+(first==='zh'?index+1+'条：':(index+1)+': ')+example[first])+'">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6.6 9H3v6h3.6l4.4 4V5Zm4 4a4.2 4.2 0 0 1 0 6m2.8-9a8 8 0 0 1 0 12"/></svg></button></div></div>'
    ).join('')+'</div>';
  }
  function reading(e){
    const related=e.related.map(id=>entries.find(x=>x.id===id)).filter(Boolean);
    return '<div class="reading-grid"><section class="reading-section meaning-section">'+sectionLabel('definition','WHAT DOES IT MEAN?','这是一种怎样的感受？')+bilingual(e,'definition')+'</section>'+
      '<section class="reading-section scene-section">'+sectionLabel('scene','IMAGINE THIS...','想象一下……')+bilingual(e,'scene')+'</section></div>'+
      '<section class="reading-section speaking-section">'+sectionLabel('say','YOU CAN SAY...','你可以这样说……')+expressions(e)+'</section>'+
      (related.length?'<section class="related-section">'+sectionLabel('related','RELATED FEELINGS','相关感受')+
       '<div class="related-list">'+related.map(x=>'<button class="related-chip" data-action="detail" data-id="'+esc(x.id)+'">'+esc(head(x)[0])+' <span aria-hidden="true">↗</span></button>').join('')+'</div></section>':'');
  }
  function footer(e){
    return '<footer class="card-footer"><div class="share-controls">'+
      '<button class="footer-action" data-action="share" data-id="'+esc(e.id)+'"><span aria-hidden="true">↗</span><span>'+t('Share link','分享链接')+'</span></button>'+
      '<button class="footer-action" id="share-image-btn" data-action="share-image" data-id="'+esc(e.id)+'" disabled><svg class="image-share-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.5" y="3.5" width="19" height="17" rx="3"/><circle cx="8.2" cy="9" r="1.7"/><path d="m4.5 18 5.6-6 4 3.8 3.1-3.2 4.1 4.1"/></svg><span class="action-text">'+t('Preparing image…','正在准备图片…')+'</span></button></div>'+
      '<button class="next-button" data-action="next" data-id="'+esc(e.id)+'">'+t('Another feeling','看看另一种感受')+' <span aria-hidden="true">→</span></button>'+
      '<input id="share-url" class="share-url" aria-label="'+t('Share URL','分享链接')+'" hidden readonly></footer>';
  }
  function detailPanel(e,context){
    if(!e) return '<section class="detail-pane"><div class="empty-state"><h1>'+t('This feeling is not here yet.','这个词条暂时找不到')+'</h1><p>'+t('Try searching the dictionary.','可以去词典里找找。')+'</p><button class="next-button" data-action="explore">'+t('Explore feelings','探索情绪')+'</button></div></section>';
    return '<section class="detail-pane" aria-label="'+esc(t('Emotion detail','情绪详情'))+'"><nav class="mobile-back"><button data-action="back">← '+t('Explore feelings','探索情绪')+'</button></nav>'+
      '<article class="emotion-card"><div class="hero-layout">'+headline(e,context)+'<div class="art-panel">'+media(e)+'</div></div>'+
      reading(e)+footer(e)+'</article><p class="pilot-note">'+t('Editorial preview · '+entries.length+' feelings, content review ongoing','内容预览 · '+entries.length+' 种感受，仍在逐条审校')+'</p></section>';
  }
  function matching() {
    const q=normalize(search);
    return entries.filter(e=>{
      if(filter!=='all' && !e.needs.includes(filter)) return false;
      if(!q) return true;
      return [e.word.en,e.word.zh,e.word.feelingEn,e.word.feelingZh,...(e.aliases||[])].some(x=>normalize(x).includes(q));
    });
  }

  function resultsHtml() {
    const found=matching(),selected=displayedEntry()?.id;
    if(!found.length)return '<div class="search-empty"><div aria-hidden="true">✳</div><p>'+t('No feeling found. Try a different word.','没有找到，可以换个词再试试。')+'</p><button class="button-outline" data-action="clear">'+t('Clear search','清除搜索')+'</button></div>';
    return '<p class="result-count">'+found.length+' '+t(found.length===1?'feeling to explore':'feelings to explore','种感受等你发现')+'</p>'+
      '<div class="results-list">'+found.map(e=>{
        const h=head(e),active=e.id===selected;
        return '<button class="result-row'+(active?' selected':'')+'" data-action="detail" data-id="'+esc(e.id)+'" aria-current="'+(active?'true':'false')+'">'+
          '<span class="row-illustration"><img src="'+esc(artworkSrc(e))+'" alt="" loading="lazy" width="120" height="80"></span>'+
          '<span class="row-words"><strong data-fit-word title="'+esc(h[0])+'">'+esc(h[0])+'</strong><span class="row-translation">'+esc(h[1])+'</span><small>'+esc(e.definition[language])+'</small></span>'+
          '<span class="row-arrow" aria-hidden="true">›</span></button>';
      }).join('')+'</div>';
  }
  function explorePanel(){
    return '<aside class="explore-pane" aria-label="'+t('Explore feelings','探索情绪')+'"><div class="explore-intro"><p class="eyebrow">'+t('A WORLD OF FEELINGS','感受的世界')+'</p>'+
      '<h2 class="explore-title">'+t('Every feeling has a story.','每一种感受，都有故事。')+'</h2></div>'+
      '<label class="search-box" for="search"><span aria-hidden="true">⌕</span><input id="search" type="search" autocomplete="off" placeholder="'+t('Search feelings or 中文','搜索感受或 English')+'" value="'+esc(search)+'"></label>'+
      '<div class="filter-row" role="group" aria-label="'+t('Feelings category','感受分类')+'">'+[['all',t('All','全部')],['needs_met',t('Needs met','需要已满足')],['needs_unmet',t('Needs unmet','需要未满足')]].map(([id,label])=>'<button class="filter-chip '+(filter===id?'selected':'')+'" data-action="filter" data-id="'+id+'" aria-pressed="'+(filter===id)+'">'+esc(label)+'</button>').join('')+'</div>'+
      '<div id="results" aria-live="polite">'+resultsHtml()+'</div>'+
      '<p class="sidebar-note">'+t('Illustrations coming later · expressions are editorial previews','插画稍后加入 · 词义和例句仍处于审校预览阶段')+'</p></aside>';
  }
  function fitWordText(){
    if(typeof document.querySelectorAll!=='function'||typeof getComputedStyle!=='function')return;
    for(const label of document.querySelectorAll('[data-fit-word]')){
      label.style.fontSize='';
      if(!label.clientWidth)continue;
      let size=parseFloat(getComputedStyle(label).fontSize);
      if(!Number.isFinite(size))continue;
      const overflow=label.scrollWidth;
      if(overflow<=label.clientWidth+1)continue;
      size=Math.max(14,Math.floor(size*label.clientWidth/overflow));
      label.style.fontSize=size+'px';
      let count=0;
      while(label.scrollWidth>label.clientWidth+1&&size>14&&count++<5){
        size=Math.max(14,size-1);
        label.style.fontSize=size+'px';
      }
    }
  }
  window.addEventListener('resize',fitWordText);
  if(document.fonts?.ready)document.fonts.ready.then(fitWordText);
  function render(){
    if(!entries.length)return;
    const e=displayedEntry();
    app.innerHTML='<main id="main" tabindex="-1" class="site-main"><div class="page-content">'+header()+
      '<div class="app-shell" data-view="'+esc(view)+'">'+explorePanel()+detailPanel(e,view)+'</div></div></main>';
    fitWordText();
    if(e)prepareImageShare(e);
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    document.title=(view==='detail'?(entries.find(x=>x.id===current)?.word.en||'Feeling')+' · ':'')+'EmoLex · An Illustrated Dictionary of Feelings';
    if(focusSearchAfterRender&&view==='explore'){
      const input=document.getElementById('search');
      if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
      focusSearchAfterRender=false;
    }
  }
  document.addEventListener('error',event=>{
    const img=event.target;
    if(img?.tagName!=='IMG'||img.dataset?.placeholderFallback==='true')return;
    img.dataset.placeholderFallback='true';
    img.src='./images/feeling-placeholder.svg';
    if(img.classList?.contains('artwork'))img.alt=t('A playful notebook illustration placeholder.','童趣手绘笔记本插画占位图。');
  },true);
  document.addEventListener('click',async (event)=>{
    const btn=event.target.closest('[data-action]'); if(!btn) return;
    const action=btn.dataset.action, id=btn.dataset.id;
    if(action==='discover'){window.__emolexDiscoverOverride=null;navigate('discover');}
    if(action==='explore'){navigate('explore');}
    if(action==='detail'){navigate('detail',id);}
    if(action==='language'){language=language==='zh'?'en':'zh';try{localStorage.setItem(STORAGE_KEY,language)}catch{};focusSearchAfterRender=view==='explore'&&document.activeElement?.id==='search';render();}
    if(action==='back'){ if(history.state && history.state.emolex){history.back();} else navigate('explore'); }
    if(action==='next'){const next=pickNext(id); if(view==='discover'){window.__emolexDiscoverOverride=next.id;render();window.scrollTo(0,0);} else navigate('detail',next.id);}
    if(action==='speak'){speech(btn.dataset.phrase,btn.dataset.locale);}
    if(action==='share'){const e=entries.find(x=>x.id===id);if(e)await share(e);}
    if(action==='share-image'){const e=entries.find(x=>x.id===id);if(e)await shareImage(e);}
    if(action==='clear'){search='';focusSearchAfterRender=true;render();}
    if(action==='filter'){filter=id;render();}
  });
  document.addEventListener('input',event=>{if(event.target.id==='search'){search=event.target.value;const container=document.getElementById('results');if(container){container.innerHTML=resultsHtml();fitWordText();}}});
  document.addEventListener('keydown',event=>{
    if(event.target.id!=='search') return;
    if(event.key==='Escape'){event.preventDefault();search='';event.target.value='';document.getElementById('results').innerHTML=resultsHtml();}
    if(event.key==='Enter'){const first=matching()[0];if(first){event.preventDefault();event.target.blur();navigate('detail',first.id);}}
  });
  window.addEventListener('popstate',()=>{resolveRoute();render();});
  async function load() {
    try {
      const res=await fetch('./data/emotions.json',{cache:'no-cache'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const data=await res.json();
      if(!Array.isArray(data.entries)||data.entries.length===0)throw new Error('Missing entries');
      entries=data.entries;resolveRoute();render();
    } catch {
      app.innerHTML='<main class="site-main empty-state"><h1>EmoLex</h1><p>'+t('We couldn’t load the feelings library. Check your connection and try again.','暂时无法加载情绪词典，请检查网络后重试。')+'</p><button class="button-main" id="retry">'+t('Try again','重试')+'</button></main>';
      document.getElementById('retry').addEventListener('click',load);
    }
  }
  load();
})();
