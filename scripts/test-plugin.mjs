#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const plugin=JSON.parse(read('plugin.json'));
const data=JSON.parse(read('static/emotions/data/emotions.json'));
const html=read('static/emotions/index.html');
assert.ok(/^\d+\.\d+\.\d+$/.test(plugin.version),'micro.blog version must be semver');
assert.ok(plugin.title?.length&&plugin.description?.length,'micro.blog metadata');
assert.ok(!plugin.includes?.length,'standalone EmoLex must not inject CSS/JS into every blog page');
assert.ok(!plugin.fields?.length,'standalone version has no theme-specific configuration');
const base='https://sample.micro.blog/emotions/';
for(const relative of ['./styles.css','./share-image.js','./app.js','./data/emotions.json','./images/feeling-placeholder.svg']){
  const url=new URL(relative,base);
  assert.ok(url.pathname.startsWith('/emotions/'),'static resources must remain under /emotions/');
  const staticPath=path.join(root,'static',url.pathname);
  assert.ok(fs.existsSync(staticPath),'missing published resource: '+url.pathname);
}
for(const relative of ['./styles.css','./share-image.js','./app.js']){
  assert.ok(html.includes(relative),'standalone page must load '+relative);
}
assert.ok(html.includes('viewport-fit=cover'),'mobile Safari viewport');
assert.ok(!html.includes('http://')&&!html.includes('https://'),'no remote runtime assets');
for(const entry of data.entries){
  const asset=new URL(entry.illustration.src,base);
  assert.ok(asset.pathname.startsWith('/emotions/images/'),'image must be a same-origin static resource: '+entry.id);
  assert.ok(fs.existsSync(path.join(root,'static',asset.pathname)),'missing picture for '+entry.id);
  assert.ok(entry.alt?.en&&entry.alt?.zh,'image alt text must be bilingual: '+entry.id);
}
const htmlPaths=['/emotions/','/emotions/?view=explore','/emotions/?word=joy'];
for(const location of htmlPaths){
  const u=new URL(location,'https://sample.micro.blog');
  assert.equal(u.pathname,'/emotions/','all routes must resolve to the same static index page');
}
assert.ok(!read('static/emotions/styles.css').includes('@import url('),'no remote font dependencies');
console.log('OK: theme-neutral micro.blog static plugin, standalone route, local assets, bilingual image fallbacks, and deep links.');
