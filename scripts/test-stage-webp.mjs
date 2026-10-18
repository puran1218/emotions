#!/usr/bin/env node
import assert from 'node:assert/strict';
import {argsOf,plannedStage} from './stage-webp.mjs';

assert.deepEqual(argsOf(['--id','curious','--file','/tmp/a.webp']),{id:'curious',file:'/tmp/a.webp',version:'01'});
assert.deepEqual(argsOf(['--id','curious','--file','/tmp/a.webp','--version','02']),{id:'curious',file:'/tmp/a.webp',version:'02'});
assert.deepEqual(argsOf(['--help']),{help:true});
assert.throws(()=>argsOf(['--id','curious']),/Required/);
assert.throws(()=>argsOf(['--id','bad/word','--file','/tmp/a.webp']),/Invalid concept id/);
assert.throws(()=>argsOf(['--id','curious','--file','/tmp/a.webp','--version','2']),/two digits/);
assert.throws(()=>plannedStage({id:'does-not-exist',file:'/tmp/a.webp',version:'01'}),/Unknown canonical concept/);
assert.throws(()=>plannedStage({id:'aroused',file:'/tmp/a.webp',version:'01'}),/withheld for meaning review/);
assert.throws(()=>plannedStage({id:'curious',file:'/tmp/a.png',version:'01'}),/existing \.webp/);
console.log('OK: candidate staging parser, withheld-word release boundary, and safe refusal tests.');
