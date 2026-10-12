/* Offline canvas export; same-origin illustrations only. No third-party services. */
(function () {
  'use strict';
  const pending=new Map();
  const surface='#FFFEFA', ink='#293C3B', muted='#65716E', green='#31665F', rule='#DFE5DB';
  function path(e){const src=e.illustration?.src||('./images/'+e.visual+'-storyboard.svg');return new URL(src,document.baseURI).href;}
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
      if(ctx.measureText(line+word).width>maxWidth&&line){lines.push(line.trim());line=word.trimStart();}
      else line+=word;
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
  async function render(e,lang){
    const canvas=document.createElement('canvas');
    canvas.width=1200;canvas.height=3200;
    const c=canvas.getContext('2d',{alpha:false});
    if(!c)throw Error('Canvas is unavailable');
    c.fillStyle='#F8F6F0';c.fillRect(0,0,1200,2500);
    rounded(c,32,32,1136,3060,38,surface);
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
    try{image=await imgFrom(path(e));}catch{image=null;}
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
    const cropped=document.createElement('canvas');cropped.width=1200;cropped.height=Math.min(3170,Math.ceil(y+77));
    const out=cropped.getContext('2d',{alpha:false});
    out.fillStyle='#F8F6F0';out.fillRect(0,0,1200,cropped.height);
    out.drawImage(canvas,0,0,1200,cropped.height,0,0,1200,cropped.height);
    rounded(out,32,32,1136,cropped.height-64,38,'rgba(0,0,0,0)',rule);
    const blob=await new Promise((resolve,reject)=>cropped.toBlob(v=>v?resolve(v):reject(new Error('PNG encoding failed')),'image/png'));
    return new File([blob], 'emolex-'+e.id+'-'+lang+'.png',{type:'image/png'});
  }
  function prepare(e,lang){
    const k=key(e,lang);
    if(!pending.has(k)){
      const p=render(e,lang).catch(err=>{pending.delete(k);throw err;});
      pending.set(k,p);
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
