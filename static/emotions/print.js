import {selectEntries, renderBook} from './print-core.js';

const root=document.getElementById('print-pages');
const feedback=document.getElementById('print-status');
const printButton=document.getElementById('print-button');
const rangeControl=document.getElementById('range');
const layoutControl=document.getElementById('layout');
const languageControl=document.getElementById('language');
const startControl=document.getElementById('start');
const countControl=document.getElementById('count');
const idsControl=document.getElementById('ids');
const monthFields=document.getElementById('month-fields');
const selectedFields=document.getElementById('selected-fields');
let entries=[],comparisons=[],ready=false;

function update() {
  if (!ready) {
    return;
  }
  const range=rangeControl.value;
  monthFields.hidden=range!=='month';
  selectedFields.hidden=range!=='selected';
  try {
    const selection=selectEntries(entries,{range,start:startControl.value,count:countControl.value,ids:idsControl.value});
    if (selection.missing.length) {
      throw new Error('Unknown word IDs: '+selection.missing.join(', ')+'. Use the exact word-sense IDs from the dictionary.');
    }
    if (!selection.entries.length) {
      root.replaceChildren();
      feedback.textContent='Enter one or more valid word IDs to prepare the PDF.';
      printButton.disabled=true;
      return;
    }
    root.innerHTML=renderBook(entries,selection.entries,comparisons,{layout:layoutControl.value,language:languageControl.value});
    const pages=root.querySelectorAll('.sheet').length;
    feedback.textContent=selection.entries.length+' words · '+pages+' A4 pages. Choose Print / Save PDF. Only approved illustrations are shown.';
    printButton.disabled=false;
  } catch (error) {
    root.replaceChildren();
    feedback.textContent=error.message;
    printButton.disabled=true;
  }
}

async function waitForImages() {
  const images=[...root.querySelectorAll('img')];
  await Promise.all(images.map(async image => {
    if (image.complete && image.naturalWidth) {
      return;
    }
    try {
      if (image.decode) {
        await image.decode();
      } else {
        await new Promise((resolve,reject) => {
          image.addEventListener('load',resolve,{once:true});
          image.addEventListener('error',reject,{once:true});
        });
      }
    } catch {
      image.hidden=true;
    }
  }));
}

printButton.addEventListener('click',async () => {
  if (printButton.disabled) {
    return;
  }
  printButton.disabled=true;
  feedback.textContent='Preparing print-ready illustrations…';
  await waitForImages();
  printButton.disabled=false;
  feedback.textContent='Ready. Select A4, portrait, and Save as PDF or your printer.';
  window.print();
});

[rangeControl,layoutControl,languageControl,startControl,countControl].forEach(control => control.addEventListener('change',update));
idsControl.addEventListener('input',update);

try {
  const [dictionary,overlay]=await Promise.all([
    fetch('./data/emotions.json').then(result => {if (!result.ok) throw new Error('Cannot load dictionary.');return result.json();}),
    fetch('./data/closer-experiment.json').then(result => {if (!result.ok) throw new Error('Cannot load comparisons.');return result.json();})
  ]);
  if (!Array.isArray(dictionary.entries) || !Array.isArray(overlay.comparisons)) {
    throw new Error('Unexpected content format.');
  }
  entries=dictionary.entries.filter(item => item.status==='pilot'||item.status==='published');
  comparisons=overlay.comparisons;
  ready=true;
  update();
} catch (error) {
  feedback.textContent='Print preview unavailable: '+error.message;
}
