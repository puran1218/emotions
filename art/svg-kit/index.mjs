// Lightweight scene-oriented SVG utilities inspired by Anatomy's build/verify workflow.
// Original EmoLex drawing code, not a copy of Anatomy geometry engines.
export const C={
  "paper": "#F8F4E9",
  "paperLight": "#FFFCF5",
  "graphite": "#5B5957",
  "lightInk": "#82796C",
  "skin": "#E8B797",
  "skinShade": "#C98A70",
  "blush": "#D98F83",
  "hair": "#543F35",
  "hairHighlight": "#8A6047",
  "mustard": "#D9AC59",
  "sun": "#EDBD4F",
  "sunLight": "#F7D672",
  "sunDark": "#D98D42",
  "slate": "#6D8796",
  "slateShadow": "#547385",
  "sage": "#94A58D",
  "sageDark": "#647D60",
  "terracotta": "#BA7C65",
  "pot": "#C98E70",
  "potDark": "#AB715A",
  "soil": "#80624F",
  "cream": "#FFF8E8"
};
export function escXML(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));}

export function attrsOf(attrs={}){return Object.entries(attrs).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>` ${k}="${escXML(v)}"`).join("");}

export function path(d,fill="none",stroke=C.graphite,strokeWidth=3.4,attrs={}){return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${attrsOf(attrs)}/>`;}

export function ellipse(cx,cy,rx,ry,fill,stroke="none",width=2,attrs={}){return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${attrsOf(attrs)}/>`;}

export function circle(cx,cy,r,fill,stroke="none",width=2,attrs={}){return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${attrsOf(attrs)}/>`;}

export function group(children,attrs={}){return `<g${attrsOf(attrs)}>${Array.isArray(children)?children.join(""):children}</g>`;}

export function documentSVG(scene,title,description){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" width="960" height="640" role="img" aria-labelledby="art-title art-desc"><title id="art-title">${escXML(title)}</title><desc id="art-desc">${escXML(description)}</desc>${scene}</svg>\n`;}

export function sunflower({x=710,y=237,scale=1}={}){
 const pieces=[];
 pieces.push(path("M0 44 Q-5 161 6 246", "none",C.sageDark,10));
 pieces.push(path("M-5 128 Q-40 92-98 119 Q-82 160-10 166Z",C.sage,C.sageDark,3.3));
 pieces.push(path("M-9 161 Q-50 143-83 134", "none",C.sageDark,2.7));
 pieces.push(path("M6 187 Q69 146 110 181 Q87 214 9 211Z",C.sage,C.sageDark,3.3));
 pieces.push(path("M13 201 Q55 184 92 183","none",C.sageDark,2.5));
 pieces.push(path("M-2 224 Q-23 208-41 219","none",C.sageDark,2.6));
 for(let i=0;i<13;i++){const a=i*360/13;
  pieces.push(group([path("M-15-39 Q-33-77 -3-100 Q20-76 12-43Z",i%3===0?C.sunLight:C.sun,C.sunDark,2.1),
    path("M-4-48 Q-3-70 0-83","none","#E3A53D",1.8)],{transform:`rotate(${a})`}));
 }
 pieces.push(circle(0,0,43,C.soil,C.graphite,3.3));
 pieces.push(circle(0,0,34,"#8A6245","none"));
 const seeds=[];
 for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){
  if(row*row+col*col>6)continue;
  seeds.push(ellipse(col*11+(row%2)*3,row*11,3.1,4.4,(row+col)%2?"#5A473B":"#C29159", "none",0,{transform:`rotate(${row*12+col*7} ${col*11+(row%2)*3} ${row*11})`}));
 }
 pieces.push(group(seeds));
 pieces.push(path("M-39 0 Q-52-18 -47-30 M31 26Q47 12 48-8","none",C.sunDark,1.7));
 return group(pieces,{transform:`translate(${x} ${y}) scale(${scale})`});
}

export function meiHead({x=263,y=153,scale=1,emotion="joy"}={}){
 const lines=[];
 // Chin-length dark hair: dark silhouette behind the face, then visible bangs.
 lines.push(path("M21 64 Q0 25 48 9 Q83-13 131 1 Q176-5 204 34 Q229 70 209 131 Q221 180 190 201 Q157 211 119 192 L51 204 Q12 195 16 155Q-7 119 21 64Z",C.hair,C.graphite,4.5));
 lines.push(path("M26 80 Q16 21 95 28 Q164 21 191 67 Q204 94 193 141 Q177 186 124 190 Q61 187 40 148 Q22 126 26 80Z",C.skin,C.graphite,4.3));
 lines.push(path("M35 109 Q5 104 17 126 Q24 146 47 142",C.skin,C.graphite,3));
 lines.push(path("M166 128 Q181 137 196 122","none",C.skinShade,3));
 lines.push(ellipse(88,140,22,12,C.blush,"none",0,{opacity:".54"}));
 lines.push(ellipse(161,133,20,10,C.blush,"none",0,{opacity:".49"}));
 lines.push(path("M68 107 Q81 95 97 106 M138 101 Q154 91 168 103","none",C.hair,4));
 lines.push(ellipse(92,117,10,13,C.cream,C.graphite,2.5));
 lines.push(ellipse(154,115,10,13,C.cream,C.graphite,2.5));
 lines.push(ellipse(96,118,5.2,8,C.hair));
 lines.push(ellipse(158,115,5.2,8,C.hair));
 lines.push(circle(98,115,1.9,C.cream));
 lines.push(circle(160,112,1.8,C.cream));
 lines.push(path("M128 129 Q137 133 131 140","none",C.skinShade,2.5));
 if(emotion==="joy")lines.push(path("M111 153 Q132 171 154 147", "none","#A45D52",4.6));
 if(emotion==="concerned")lines.push(path("M114 152 Q133 142 154 151","none","#A45D52",3));
 // Bangs and flyaways, not disconnected eyelashes/cheek marks.
 lines.push(path("M22 69 Q32 13 86 16 Q126-2 172 26 Q207 49 198 84 Q178 75 168 59 Q159 95 145 90 Q132 75 130 59 Q118 94 100 89 Q88 77 87 55 Q66 83 48 83 Q31 96 22 69Z",C.hair,C.graphite,3.5));
 lines.push(path("M55 25 Q78 36 73 65 M101 20 Q127 42 119 69 M147 30 Q164 45 167 63","none",C.hairHighlight,3.1));
 lines.push(path("M30 149 Q27 172 42 186 M188 146 Q211 171 191 188 M77 6 Q80-14 110 0","none",C.hairHighlight,2.7));
 return group(lines,{transform:`translate(${x} ${y}) scale(${scale})`});
}
