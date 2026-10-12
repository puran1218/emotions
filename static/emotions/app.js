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
  }
  function dailyIndex() {
    const today = new Date();
    const token = [today.getFullYear(),today.getMonth()+1,today.getDate()].join('-');
    let hash=0;
    for (const ch of token) hash = ((hash * 31) + ch.charCodeAt(0))|0;
    return Math.abs(hash) % entries.length;
  }
  function pickNext(from) { const i = entries.findIndex(e=>e.id===from); return entries[(i + 1 + entries.length) % entries.length]; }
  function media(e) {
    const label = language==='zh' ? e.alt.zh : e.alt.en;
    return '<div class="artwork-wrap"><img class="artwork" loading="eager" decoding="async" src="./images/'+encodeURIComponent(e.visual)+'-storyboard.svg" alt="'+esc(label)+'" width="960" height="640" /><span class="draft-caption">'+t('Illustration study · final watercolor art in review','插画分镜稿 · 正式水彩作品待审核')+'</span></div>';
  }
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
    const url=pageUrl({word:e.id}).toString();
    const title=e.word.en+' · '+e.word.zh;
    try {
      if (navigator.share) { await navigator.share({title,url}); return; }
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); message(t('Link copied!','链接已复制！')); return; }
    } catch (err) { if (err.name==='AbortError') return; }
    const field=document.getElementById('share-url');
    if(field) { field.hidden=false; field.value=url; field.focus(); field.select(); }
    message(t('Copy the link in the field.','请复制显示的链接。'));
  }
  function header(back=false) {
    return '<header class="topbar"><div class="topbar-inner">'+
      (back?'<button class="icon-button" data-action="back" aria-label="'+t('Back','返回')+'">←</button>':'')+
      '<button class="brand" data-action="discover" aria-label="EmoLex home">emo<span>lex</span><small>✳</small></button>'+
      '<div class="top-actions">'+
      '<button class="language-button" data-action="language" aria-label="'+t('Switch primary language to Chinese','切换主语言为英文')+'">'+(language==='zh'?'中文 / EN':'EN / 中文')+'</button>'+
      '<button class="icon-button" data-action="explore" aria-label="'+t('Explore feelings','探索情绪')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.9"/><path d="m16.1 16.1 4.1 4.1"/></svg></button>'+
      '</div></div></header>';
  }
  function bottomNav() {
    return '<nav class="bottom-nav" aria-label="'+t('Primary navigation','主导航')+'"><button class="'+(view==='discover'?'active':'')+'" data-action="discover" aria-current="'+(view==='discover'?'page':'false')+'"><span aria-hidden="true">✳</span>'+t('Discover','发现')+'</button><button class="'+(view==='explore'?'active':'')+'" data-action="explore" aria-current="'+(view==='explore'?'page':'false')+'"><span aria-hidden="true">⌕</span>'+t('Explore','探索')+'</button></nav>';
  }
  function buttons(e,context) {
    if(context==='discover') {
      return '<div class="hero-actions"><button class="button-main" data-action="detail" data-id="'+esc(e.id)+'">'+t('Read this feeling','读懂这种感受')+' <span aria-hidden="true">→</span></button><button class="button-subtle" data-action="next" data-id="'+esc(e.id)+'">'+t('Another feeling','看看另一种感受')+' ↻</button></div>';
    }
    return '<div class="detail-actions"><button class="button-main" data-action="next" data-id="'+esc(e.id)+'">'+t('Another feeling','看看另一种感受')+' →</button><button class="button-outline" data-action="share" data-id="'+esc(e.id)+'">'+t('Share feeling','分享这个词')+'</button></div><input id="share-url" class="share-url" aria-label="'+t('Share URL','分享链接')+'" hidden readonly />';
  }
  function hero(e,context) {
    const titles=head(e);
    const speakPhrase=language==='zh' ? (e.word.feelingZh||e.word.zh) : (e.word.feelingEn||e.word.en);
    const locale=language==='zh'?'zh-CN':'en-US';
    return '<section class="hero '+(context==='detail'?'detail-hero':'discover-hero')+'"><div class="hero-copy">'+
      '<p class="eyebrow">'+(context==='discover'?t('TODAY’S FEELING','今天的感受'):t('A FEELING TO UNDERSTAND','认识一种感受'))+'</p>'+
      '<div class="headword"><h1>'+esc(titles[0])+'</h1><span class="emotion-emoji" aria-hidden="true">'+esc(e.emoji)+'</span></div>'+
      '<p class="translation" lang="'+(language==='zh'?'en':'zh-CN')+'">'+esc(titles[1])+'</p>'+
      '<div class="spoken"><span>'+esc(speakPhrase)+'</span><button class="speak-button" data-action="speak" data-phrase="'+esc(speakPhrase)+'" data-locale="'+locale+'" aria-label="'+esc(t('Listen to ','朗读 ')+speakPhrase)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6.6 9H3v6h3.6l4.4 4V5Zm4 4a4.2 4.2 0 0 1 0 6m2.8-9a8 8 0 0 1 0 12"/></svg></button></div>'+
      '</div>'+media(e)+'</section>';
  }
  function bilingual(e,part) {
    const first=language, second=language==='zh'?'en':'zh';
    return '<p class="primary-copy" lang="'+(first==='zh'?'zh-CN':'en')+'">'+esc(e[part][first])+'</p><p class="secondary-copy" lang="'+(second==='zh'?'zh-CN':'en')+'">'+esc(e[part][second])+'</p>';
  }
  function discover() {
    const daily = entries[dailyIndex()];
    const e=window.__emolexDiscoverOverride && entries.find(v=>v.id===window.__emolexDiscoverOverride) || daily;
    return header()+'<main id="main" tabindex="-1" class="site-main"><div class="page-content">'+hero(e,'discover')+
      '<section class="preview-meaning"><div class="section-kicker"><span class="rule"></span>'+t('WHAT DOES IT MEAN?','这是一种怎样的感受？')+'</div>'+bilingual(e,'definition')+'</section>'+
      buttons(e,'discover')+'<p class="pilot-note">'+t('Editorial pilot · five sample feelings','内容校准版 · 当前展示五条示范词')+'</p></div></main>'+bottomNav();
  }
  function detail() {
    const e=entries.find(x=>x.id===current);
    if(!e) return header(true)+'<main id="main" tabindex="-1" class="site-main empty-state"><h1>'+t('This feeling is not here yet.','这个词条暂时找不到')+'</h1><p>'+t('Try the Explore dictionary.','可以去词典里找找其他感受。')+'</p><button class="button-main" data-action="explore">'+t('Explore feelings','探索情绪')+'</button></main>'+bottomNav();
    const related=e.related.map(id=>entries.find(x=>x.id===id)).filter(Boolean);
    return header(true)+'<main id="main" tabindex="-1" class="site-main"><article class="page-content">'+hero(e,'detail')+
      '<div class="reading-column"><section class="reading-section"><div class="section-kicker"><span class="rule"></span>'+t('WHAT DOES IT MEAN?','这是一种怎样的感受？')+'</div>'+bilingual(e,'definition')+'</section>'+
      '<section class="reading-section"><div class="section-kicker"><span class="rule"></span>'+t('IMAGINE THIS...','想象一下……')+'</div>'+bilingual(e,'scene')+'</section>'+
      '<section class="reading-section speaking-section"><div class="section-kicker"><span class="rule"></span>'+t('YOU CAN SAY...','你可以这样说……')+'</div><blockquote>'+bilingual(e,'say')+'</blockquote></section>'+
      '<section class="reading-section"><div class="section-kicker"><span class="rule"></span>'+t('RELATED FEELINGS','相关感受')+'</div><div class="related-list">'+related.map(x=>'<button data-action="detail" data-id="'+esc(x.id)+'" class="related-chip">'+esc(x.emoji)+' '+esc(head(x)[0])+' <span aria-hidden="true">↗</span></button>').join('')+'</div></section>'+
      buttons(e,'detail')+'<p class="pilot-note">'+t('Editorial pilot · illustrations are storyboards pending art review','内容校准版 · 插画为待审核分镜稿')+'</p></div></article></main>'+bottomNav();
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
    const found=matching();
    if(!found.length) return '<div class="search-empty"><div aria-hidden="true">⌕</div><p>'+t('No feeling found. Try a different word.','没有找到，可以换个词再试试。')+'</p><button class="button-outline" data-action="clear">'+t('Clear search','清除搜索')+'</button></div>';
    return '<p class="result-count">'+found.length+' '+t(found.length===1?'feeling':'feelings','种感受')+'</p><div class="results-list">'+found.map(e=>{ const h=head(e);return '<button class="result-row" data-action="detail" data-id="'+esc(e.id)+'"><span class="row-emoji" aria-hidden="true">'+esc(e.emoji)+'</span><span class="row-words"><strong>'+esc(h[0])+'</strong><small>'+esc(h[1])+'</small></span><span class="row-arrow" aria-hidden="true">↗</span></button>';}).join('')+'</div>';
  }
  function explore() {
    return header(true)+'<main id="main" tabindex="-1" class="site-main"><div class="page-content explore-page"><p class="eyebrow">'+t('A WORLD OF FEELINGS','感受的世界')+'</p><h1 class="explore-title">'+t('Find the words for how you feel.','找到表达感受的词语。')+'</h1>'+
      '<label class="search-box" for="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.9"/><path d="m16.1 16.1 4.1 4.1"/></svg><input id="search" type="search" autocomplete="off" placeholder="'+t('Search feelings or 中文词语','搜索感受或 English words')+'" value="'+esc(search)+'" /></label>'+
      '<div class="filter-row" role="group" aria-label="'+t('Feelings category','感受分类')+'">'+[['all',t('All feelings','全部')],['needs_met',t('Needs met','需要得到满足')],['needs_unmet',t('Needs unmet','需要未得到满足')]].map(([id,label])=>'<button class="filter-chip '+(filter===id?'selected':'')+'" data-action="filter" data-id="'+id+'" aria-pressed="'+(filter===id)+'">'+esc(label)+'</button>').join('')+'</div>'+
      '<div id="results" aria-live="polite">'+resultsHtml()+'</div><p class="pilot-note">'+t('Five pilot entries; unreviewed source words are not yet shown.','目前只有五条内容校准词，未经审核的原始词不会出现在词典中。')+'</p></div></main>'+bottomNav();
  }
  function render() {
    if(!entries.length) return;
    app.innerHTML=view==='explore'?explore():view==='detail'?detail():discover();
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    document.title=(view==='detail'? (entries.find(x=>x.id===current)?.word.en||'Feeling')+' · ':'')+'EmoLex · Feelings Explorer';
    if(focusSearchAfterRender && view==='explore') { const input=document.getElementById('search'); input.focus(); input.setSelectionRange(input.value.length,input.value.length); focusSearchAfterRender=false; }
  }
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
    if(action==='clear'){search='';focusSearchAfterRender=true;render();}
    if(action==='filter'){filter=id;render();}
  });
  document.addEventListener('input',event=>{if(event.target.id==='search'){search=event.target.value;const container=document.getElementById('results');if(container)container.innerHTML=resultsHtml();}});
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
