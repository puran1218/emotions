(function emolexExport(){
  'use strict';
  const order=(lang)=>lang==='zh'?['zh','en']:['en','zh'];
  function bilingual(value,lang){
    return order(lang).map(l=>value?.[l]||'').join('\n\n');
  }
  function markdown(entry,lang,insight,entries,baseUrl){
    const base=new URL(baseUrl),lookup=new Map(entries.map(x=>[x.id,x]));
    const lines=[
      '# '+entry.word.en+' · '+entry.word.zh,
      '',
      '**EmoLex · Editorial preview / 内容审校预览**',
      '',
      '## What does it mean? · 这是一种怎样的感受？',
      '',
      bilingual(entry.definition,lang),
      '',
      '## Imagine this · 想象一下',
      '',
      bilingual(entry.scene,lang),
      '',
      '## You can say · 你可以这样说',
      ''
    ];
    entry.say.forEach((sample,i)=>lines.push(String(i+1)+'. '+sample.en+'  /  '+sample.zh));
    if(insight){
      const target=lookup.get(insight.compareWith);
      const left=insight.first||{label:entry.word,description:entry.definition};
      const right=insight.second||((target&&{label:target.word,description:target.definition})||null);
      if(right){
        const question=insight.question||{en:'How are '+left.label.en+' and '+right.label.en+' different?',zh:left.label.zh+'和'+right.label.zh+'，有什么不同？'};
        lines.push('','## A Little Closer · 再理解一点','',bilingual(question,lang),'',
          '### '+left.label.en+' · '+left.label.zh,'',bilingual(left.description,lang),'',
          '### '+right.label.en+' · '+right.label.zh,'',bilingual(right.description,lang),'',
          bilingual(insight.takeaway,lang));
      }
    }
    const related=(entry.related||[]).map(id=>lookup.get(id)).filter(Boolean);
    if(related.length)lines.push('','## Related feelings · 相关感受','',...related.map(e=>'- '+e.word.en+' · '+e.word.zh));
    const image=entry.illustration?.src;
    if(/^\.\/images\/[a-z0-9.-]+\.(webp|svg|png)$/.test(image||'')){
      const url=new URL(image,base).href;
      lines.push('','## Illustration · 插画','',
        '!['+(lang==='zh'?entry.alt.zh:entry.alt.en).replace(/[\]\[]/g,'')+']('+url+')');
    }
    const link=new URL(base.href);
    link.search='';link.searchParams.set('word',entry.id);
    lines.push('','Source: '+link.href,'',
      'Content, translations and contrasts are editorial previews, not independently approved.','');
    return lines.join('\n');
  }
  function libraryJSON(entries,comparisons){
    return JSON.stringify({
      format:'emolex-full-library-v1',
      status:'editorial-preview-not-human-approved',
      count:entries.length,
      entries:entries.map(e=>({...e,closer:comparisons.get(e.id)||null}))
    },null,2)+'\n';
  }
  function download(content,name,type){
    const blob=new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=name;a.rel='noopener';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  window.EmoLexExportEntry={markdown,libraryJSON,download};
})();
