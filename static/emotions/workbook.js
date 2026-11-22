import {selectEntries} from './print-core.js';
import {renderWorkbook} from './workbook-core.js';

const root=document.getElementById('workbook-pages');
const feedback=document.getElementById('workbook-status');
const printButton=document.getElementById('workbook-print');
const range=document.getElementById('workbook-range');
const start=document.getElementById('workbook-start');
const count=document.getElementById('workbook-count');
const ids=document.getElementById('workbook-ids');
const language=document.getElementById('workbook-language');
const chunkFields=document.getElementById('workbook-chunk-fields');
const selectedFields=document.getElementById('workbook-selected-fields');
let entries=[],lessons=[],ready=false;

function render() {
  if (!ready) {
    return;
  }
  chunkFields.hidden=range.value!=='month';
  selectedFields.hidden=range.value!=='selected';
  try {
    const selected=selectEntries(entries,{range:range.value,start:start.value,count:count.value,ids:ids.value});
    if (selected.missing.length) {
      throw new Error('Unknown word-sense IDs: '+selected.missing.join(', '));
    }
    if (!selected.entries.length) {
      root.replaceChildren();
      printButton.disabled=true;
      feedback.textContent='Add one or more exact word IDs to prepare your workbook.';
      return;
    }
    root.innerHTML=renderWorkbook(entries,lessons,selected.entries,{language:language.value});
    printButton.disabled=false;
    feedback.textContent=selected.entries.length+' Daily 5 lessons · '+selected.entries.length+' A4 pages · one worksheet per word.';
  } catch (error) {
    root.replaceChildren();
    printButton.disabled=true;
    feedback.textContent=error.message;
  }
}

async function preloadArtwork() {
  await Promise.all([...root.querySelectorAll('img')].map(async img => {
    try {
      if (img.decode) {
        await img.decode();
      }
    } catch {
      img.hidden=true;
    }
  }));
}

printButton.addEventListener('click',async () => {
  if (printButton.disabled) {
    return;
  }
  printButton.disabled=true;
  feedback.textContent='Preparing the A4 worksheets…';
  await preloadArtwork();
  feedback.textContent='Ready. Select A4 portrait and print or save as PDF.';
  printButton.disabled=false;
  window.print();
});
[range,start,count,language].forEach(control=>control.addEventListener('change',render));
ids.addEventListener('input',render);

try {
  const [dictionary,daily]=await Promise.all([
    fetch('./data/emotions.json').then(res=>{if(!res.ok)throw new Error('Cannot load the dictionary.');return res.json();}),
    fetch('./data/daily5.json').then(res=>{if(!res.ok)throw new Error('Cannot load Daily 5.');return res.json();})
  ]);
  if (!Array.isArray(dictionary.entries)||!Array.isArray(daily.items)) {
    throw new Error('Unexpected practice data format.');
  }
  entries=dictionary.entries.filter(entry=>entry.status==='pilot'||entry.status==='published');
  lessons=daily.items;
  if (entries.length!==lessons.length || entries.some(entry=>!lessons.some(lesson=>lesson.id===entry.id))) {
    throw new Error('Daily 5 and the visible dictionary are out of sync.');
  }
  ready=true;
  render();
} catch (error) {
  feedback.textContent='Workbook unavailable: '+error.message;
}
