/* Offline canvas export; same-origin illustrations only. No third-party services. */
(function () {
  'use strict';
  const pending=new Map();
  const surface='#FFFEFA', ink='#293C3B', muted='#65716E', green='#31665F', rule='#DFE5DB';
  function path(e){const src=e.illustration?.src||'./images/feeling-placeholder.svg';return new URL(src,document.baseURI).href;}
  const placeholder=new URL('./images/feeling-placeholder.svg',document.baseURI).href;
  function key(e,lang){return e.id+':'+lang+':'+path(e);}
  function imgFrom(src){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('Illustration could not be loaded for image sharing'));
      image.src=src;
    });
  }
  function rounded(ctx,x,y,w,h,r,fill,stroke){
    r=Math.min(r,w/2,h/2);
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.lineTo(x,y+r);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
  }
  function wrap(ctx,text,maxWidth,lang){
    const words=lang==='zh'?Array.from(text):(text.match(/\S+\s*/g)||[text]);
    const lines=[];let line='';
    for(const word of words){
      if(ctx.measureText(line+word).width>maxWidth&&line){lines.push(line.trim());line='';}
      // A long headword or unspaced URL must not disappear beyond the canvas.
      if(ctx.measureText(word).width>maxWidth){
        for(const char of Array.from(word)){
          if(ctx.measureText(line+char).width>maxWidth&&line){lines.push(line.trim());line='';}
          line+=char;
        }
      }else line+=line?word:word.trimStart();
    }
    if(line)lines.push(line.trim());
    return lines;
  }
  function multiline(ctx,text,x,y,width,size,height,lang,color=ink,bold=false){
    const family=lang==='zh'?'"PingFang SC","Noto Sans CJK SC",sans-serif':'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.font=(bold?'600 ':'400 ')+size+'px '+family;
    ctx.fillStyle=color;ctx.textBaseline='top';
    for(const line of wrap(ctx,text,width,lang)){ctx.fillText(line,x,y);y+=height;}
    return y;
  }
  function heading(ctx,text,x,y){
    const icon=/WHAT|怎样/.test(text)?'📖':/IMAGINE|想象/.test(text)?'✨':'💬';
    rounded(ctx,x,y,45,42,11,'#ECF3EC');
    ctx.font='28px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText(icon,x+7,y+8);
    return multiline(ctx,text,x+62,y+4,985,28,38,'en',green,true)+18;
  }
  function font(lang,size,bold=false){
    return (bold?'600 ':'400 ')+size+'px '+(lang==='zh'?'"PingFang SC","Noto Sans CJK SC",sans-serif':'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
  }
  function lineHeight(ctx,value,width,size,height,lang,bold=false){
    ctx.font=font(lang,size,bold);
    return wrap(ctx,value,width,lang).length*height;
  }
  function estimatedHeight(ctx,e,lang){
    const other=lang==='zh'?'en':'zh';
    let y=87+lineHeight(ctx,'emolex  ✳',1030,39,48,'en',true)+61;
    y+=lineHeight(ctx,lang==='zh'?'一种感受 · ONE FEELING':'ONE FEELING · 一种感受',1020,25,34,'en',true)+28;
    y+=lineHeight(ctx,e.word[lang],865,78,97,lang,true)+8;
    y+=lineHeight(ctx,e.word[other],950,43,57,other)+24+620+34;
    y+=lineHeight(ctx,lang==='zh'?'认识这种感受':'A moment to understand',1040,24,34,lang)+45;
    const titleHeight=(title)=>4+lineHeight(ctx,title,985,28,38,'en',true)+18;
    y+=titleHeight(lang==='zh'?'这是一种怎样的感受？':'WHAT DOES IT MEAN?');
    y+=lineHeight(ctx,e.definition[lang],1032,37,58,lang)+9;
    y+=lineHeight(ctx,e.definition[other],1032,32,53,other)+33+33;
    y+=titleHeight(lang==='zh'?'想象一下……':'IMAGINE THIS...');
    y+=lineHeight(ctx,e.scene[lang],1032,37,58,lang)+9;
    y+=lineHeight(ctx,e.scene[other],1032,32,53,other)+34+34;
    y+=titleHeight(lang==='zh'?'你可以这样说……':'YOU CAN SAY...');
    for(const example of (Array.isArray(e.say)?e.say:[e.say]).slice(0,2)){
      y+=20+lineHeight(ctx,'“'+example[lang]+'”',970,32,50,lang,true)+7+
        lineHeight(ctx,'“'+example[other]+'”',970,28,44,other)+22+16;
    }
    y+=14+26;
    return Math.max(1200,Math.ceil(y+77));
  }
  async function render(e,lang){
    // Measure first, then paint directly onto an exact-size canvas. No 3170px
    // cropping cap: long bilingual descriptions must not lose the footer.
    const canvas=document.createElement('canvas');
    canvas.width=1200;canvas.height=1;
    let c=canvas.getContext('2d',{alpha:false});
    if(!c)throw Error('Canvas is unavailable');
    const finalHeight=estimatedHeight(c,e,lang);
    canvas.height=finalHeight;
    c=canvas.getContext('2d',{alpha:false});
    if(!c)throw Error('Canvas is unavailable');
    c.fillStyle='#F8F6F0';c.fillRect(0,0,1200,canvas.height);
    rounded(c,32,32,1136,canvas.height-64,38,surface);
    let y=87;
    y=multiline(c,'emolex  ✳',84,y,1030,39,48,'en',green,true);
    c.strokeStyle=rule;c.lineWidth=2;c.beginPath();c.moveTo(84,y+20);c.lineTo(1116,y+20);c.stroke();
    y+=61;
    y=multiline(c,lang==='zh'?'一种感受 · ONE FEELING':'ONE FEELING · 一种感受',84,y,1020,25,34,'en',muted,true)+28;
    const h=lang==='zh'?[e.word.zh,e.word.en]:[e.word.en,e.word.zh];
    y=multiline(c,h[0],84,y,865,78,97,lang,ink,true)+8;
    y=multiline(c,h[1],84,y,950,43,57,lang==='zh'?'en':'zh',muted,false)+24;
    c.font='74px "Apple Color Emoji","Segoe UI Emoji",sans-serif';c.fillText(e.emoji||'',1017,192);
    const imageY=y; rounded(c,84,imageY,1032,620,26,'#F0EBE0');
    let image;
    try{image=await imgFrom(path(e));}catch{try{image=await imgFrom(placeholder);}catch{image=null;}}
    if(image){
      const ratio=Math.min(1032/image.width,620/image.height);
      const width=image.width*ratio,height=image.height*ratio;
      c.drawImage(image,84+(1032-width)/2,imageY+(620-height)/2,width,height);
    }else{
      multiline(c,lang==='zh'?'情绪场景插画':'Feeling illustration',120,imageY+295,900,34,42,lang,muted);
    }
    y=imageY+620+34;
    y=multiline(c,lang==='zh'?'认识这种感受':'A moment to understand',84,y,1040,24,34,lang,muted)+45;
    y=heading(c,lang==='zh'?'这是一种怎样的感受？':'WHAT DOES IT MEAN?',84,y);
    y=multiline(c,e.definition[lang],84,y,1032,37,58,lang)+9;
    y=multiline(c,e.definition[lang==='zh'?'en':'zh'],84,y,1032,32,53,lang==='zh'?'en':'zh',muted)+33;
    c.strokeStyle=rule;c.beginPath();c.moveTo(84,y);c.lineTo(1116,y);c.stroke();y+=33;
    y=heading(c,lang==='zh'?'想象一下……':'IMAGINE THIS...',84,y);
    y=multiline(c,e.scene[lang],84,y,1032,37,58,lang)+9;
    y=multiline(c,e.scene[lang==='zh'?'en':'zh'],84,y,1032,32,53,lang==='zh'?'en':'zh',muted)+34;
    c.strokeStyle=rule;c.beginPath();c.moveTo(84,y);c.lineTo(1116,y);c.stroke();y+=34;
    y=heading(c,lang==='zh'?'你可以这样说……':'YOU CAN SAY...',84,y);
    const examples=(Array.isArray(e.say)?e.say:[e.say]).slice(0,2);
    const otherLang=lang==='zh'?'en':'zh';
    for(const example of examples){
      const primary='“'+example[lang]+'”',secondary='“'+example[otherLang]+'”';
      const primaryFont=lang==='zh'?'"PingFang SC","Noto Sans CJK SC",sans-serif':'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const secondaryFont=otherLang==='zh'?'"PingFang SC","Noto Sans CJK SC",sans-serif':'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      c.font='600 32px '+primaryFont;
      const primaryHeight=wrap(c,primary,970,lang).length*50;
      c.font='400 28px '+secondaryFont;
      const secondaryHeight=wrap(c,secondary,970,otherLang).length*44;
      const boxHeight=20+primaryHeight+7+secondaryHeight+22;
      const top=y;
      rounded(c,84,top,1032,boxHeight,21,'#EAF1EA');
      let lineY=multiline(c,primary,111,top+20,970,32,50,lang,ink,true)+7;
      multiline(c,secondary,111,lineY,970,28,44,otherLang,muted);
      y=top+boxHeight+16;
    }
    y+=14;
    c.strokeStyle=rule;c.beginPath();c.moveTo(84,y);c.lineTo(1116,y);c.stroke();y+=26;
    multiline(c,'EmoLex · '+new URL(location.href).host,84,y,1030,25,34,'en',muted);
    if(y+77>canvas.height)throw Error('Image layout exceeds the measured canvas height');
    rounded(c,32,32,1136,canvas.height-64,38,'rgba(0,0,0,0)',rule);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error('PNG encoding failed')),'image/png'));
    return new File([blob], 'emolex-'+e.id+'-'+lang+'.png',{type:'image/png'});
  }
  function prepare(e,lang){
    const k=key(e,lang);
    if(!pending.has(k)){
      const p=render(e,lang).catch(err=>{pending.delete(k);throw err;});
      pending.set(k,p);
      // A dictionary browsing session can touch hundreds of words. Bound the
      // retained PNG promises/files so image sharing does not grow without limit.
      while(pending.size>3)pending.delete(pending.keys().next().value);
    }
    return pending.get(k);
  }
  function download(file){
    const url=URL.createObjectURL(file);
    const link=document.createElement('a');
    link.href=url;link.download=file.name;link.rel='noopener';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  window.EmoLexShareImage={prepare,download,key};
})();
