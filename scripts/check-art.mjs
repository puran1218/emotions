#!/usr/bin/env node
// Minimum static-art safety, semantics and size gate. Not a substitute for visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenes } from './build-art.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'art/manifest.json'),'utf8'));
const pilot=JSON.parse(fs.readFileSync(path.join(root,'data/concepts/pilot.json'),'utf8'));
const briefs=JSON.parse(fs.readFileSync(path.join(root,'data/illustration-briefs/pilots.json'),'utf8'));
const runtime=JSON.parse(fs.readFileSync(path.join(root,'static/emotions/data/emotions.json'),'utf8')).entries;
const budget={targetBytes:45*1024,hardLimitBytes:80*1024};
for(const scene of scenes){
  const filename=path.join(root,'static/emotions/images',scene.name);
  const svg=fs.readFileSync(filename,'utf8');
  const bytes=Buffer.byteLength(svg,'utf8');
  assert.ok(bytes<=budget.hardLimitBytes,scene.id+': SVG exceeds the 80 KB published-file budget');
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 960 640"/);
  assert.match(svg,/<title id="art-title">[^<]+<\/title>/);
  assert.match(svg,/<desc id="art-desc">[^<]+<\/desc>/);
  assert.match(svg,/<\/svg>\s*$/);
  assert.ok(!/(?:<script\b|<image\b|<foreignObject\b|<animate\b|<use\b|<style\b|<filter\b|<pattern\b|<text\b|<a\b|<iframe\b|data:|javascript:|https?:\/\/|@import|url\(|href\s*=|onload\s*=|onclick\s*=)/i.test(svg.replace('http://www.w3.org/2000/svg','')),
    scene.id+': standalone static SVG must not embed external assets, scripts, links or image text');
  // All emitted elements are constrained to the tiny supported drawing vocabulary.
  const tags=[...svg.matchAll(/<([a-z][\w:-]*)\b/g)].map(m=>m[1]);
  const whitelist=new Set(['svg','title','desc','rect','g','path','ellipse','circle']);
  assert.ok(tags.every(tag=>whitelist.has(tag)),scene.id+': unexpected SVG element '+tags.filter(x=>!whitelist.has(x)).join(','));
  assert.ok(tags.filter(x=>x==='path').length>=20,'story illustration must have meaningful geometry');
  assert.ok(tags.filter(x=>x==='path').length<=200,'avoid vector tracing or excessive path density');
  const asset=manifest.assets.find(e=>e.concept_id===scene.id);
  assert.equal(asset?.file,'static/emotions/images/'+scene.name);
  assert.equal(asset.stage,'draft','candidate is not approved yet');
  assert.equal(asset.approved,false);
  assert.equal(asset.format,'svg');
  assert.equal(asset.budgetBytes,budget.hardLimitBytes);
  const meaning=pilot.find(e=>e.id===scene.id);
  const brief=briefs.briefs.find(e=>e.id===scene.id);
  assert.ok(meaning&&brief,'scene must have a canonical concept and a completed semantic brief');
  assert.deepEqual(meaning.scenario,brief.scenario,'art plans cannot silently change story text');
  assert.equal(meaning.illustration.src,'./images/feeling-placeholder.svg','candidate must not auto-publish');
  assert.equal(meaning.illustration.stage,'pending','candidate is waiting for human visual approval');
  assert.equal(runtime.find(e=>e.id===scene.id)?.illustration.src,'./images/feeling-placeholder.svg','deployed preview still uses neutral art');
  console.log(scene.id+': '+bytes+' B; '+tags.filter(x=>x==='path').length+' paths; budget '+(bytes<=budget.targetBytes?'on target':'above target but below limit')+'; publication status pending');
}
console.log('OK: SVG build, safe standalone asset policy, 3:2 artwork and candidate-only publication boundary.');
