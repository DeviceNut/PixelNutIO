import { get } from 'svelte/store';

import {
  pStrand,
  aBuiltinPats,
  aCustomPats,
  aCustomDesc
} from './globals.js';

const SavePatternKey      = "PixelNut-Patterns";
const SavePatternKeyCmd   = "PixelNut-Names-";
const SavePatternKeyDesc  = "PixelNut-Descs-";

///////////////////////////////////////////////////////////

export const storePatternInit = () =>
{
  // if device has a saved pattern:
  // retrieve command and search for built-in
  // else set to first one (Rainbow Ripple)

  const names = localStorage.getItem(SavePatternKey);
  if ((names != null) && (names != ''))
  {
    let lpats = [];
    let ldesc = [];
    let list = names.split(',');
    let bcount = get(aBuiltinPats).length;

    console.log('list=', list);

    let obj = { id: `${++bcount}`, text: 'Purple Please', cmd: 'E0 H270 T G' };
    lpats.push(obj);
    ldesc.push(["Just a simple solid purple color."]);

    for (const text of list)
    {
      if (text == '') continue;
      let cmd = localStorage.getItem(SavePatternKeyCmd+text);
      let adesc = localStorage.getItem(SavePatternKeyDesc+text);
      console.log('cmd=', cmd);
      console.log('adesc=', adesc);

      if (cmd != '')
      {
        obj = { id: `${++bcount}`, text: text, cmd: cmd };
        lpats.push(obj);

        let dlist = [adesc];
        console.log('dlist=', dlist);
        ldesc.push(dlist);
      }
    }
  
    aCustomPats.set(lpats);
    aCustomDesc.set(ldesc);
  }
}

export const storePatternSave = (text, desc) =>
{
  console.log(`saving: ${text}:${desc}`);

  let names = localStorage.getItem(SavePatternKey);
  if (names == null) names = '';
  else if (names != '') names = names.concat(',');
  names = names.concat(text);
  console.log('names=', names);
  localStorage.setItem(SavePatternKey, names);

  let cmd = get(pStrand).patternStr;
  localStorage.setItem(SavePatternKeyCmd+text, cmd);
  localStorage.setItem(SavePatternKeyDesc+text, desc);
}

export const storePatternRemove = (name) =>
{
  console.log(`removing: ${name}`);
}
