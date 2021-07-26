import { get } from 'svelte/store';

import {
  pStrand,
  aBuiltinPats,
  aCustomPats,
  aCustomDesc
} from './globals.js';

const SavePatternSeparator  = ',';
const SavePatternNames      = "PixelNut-Names";
const SavePatternKeyCmd     = "PixelNut-Cmds-";
const SavePatternKeyDesc    = "PixelNut-Desc-";

///////////////////////////////////////////////////////////

export const storePatternInit = () =>
{
  // if device has a saved pattern:
  // retrieve command and search for built-ins
  // else set to first one (Rainbow Ripple)

  let lpats = [];
  let ldesc = [];

  const names = localStorage.getItem(SavePatternNames);
  if ((names !== null) && (names !== ''))
  {
    let nlist = names.split(SavePatternSeparator);
    let bcount = get(aBuiltinPats).length;

    //console.log('nlist=', nlist);

    for (const text of nlist)
    {
      if (text === '') continue;
      let cmd = localStorage.getItem(SavePatternKeyCmd+text);
      let adesc = localStorage.getItem(SavePatternKeyDesc+text);

      //console.log('cmd=', cmd);
      //console.log('adesc=', adesc);

      if (cmd !== '')
      {
        const obj = { id:`${++bcount}`, text:text, cmd:cmd };
        lpats.push(obj);

        let dlist = [adesc];
        ldesc.push(dlist);

        //console.log('dlist=', dlist);
      }
    }
  }
  
  aCustomPats.set(lpats);
  aCustomDesc.set(ldesc);
}

export const storePatternSave = (name, desc, cmds) =>
{
  if (name && desc && cmds)
  {
    //console.log(`saving: ${name}:${desc}`);

    let names = localStorage.getItem(SavePatternNames);
    if (names === null) names = '';
    else if (names !== '') names = names.concat(SavePatternSeparator);
    names = names.concat(name);
  
    //console.log('names=', names);
  
    localStorage.setItem(SavePatternNames, names);
    localStorage.setItem(SavePatternKeyCmd+name, cmds);
    localStorage.setItem(SavePatternKeyDesc+name, desc);
  }
}

export const storePatternRemove = (name) =>
{
  let found = false;

  let names = localStorage.getItem(SavePatternNames);
  if (names === null) names = '';

  if (names !== '')
  {
    let nlist = names.split(SavePatternSeparator);
    for (const [i, n] of nlist.entries())
    {
      if (n === name)
      {
        //console.log(`removing: ${name}`);

        nlist.splice(i, 1);
        const str = nlist.join(SavePatternSeparator);
        localStorage.setItem(SavePatternNames, str);
        localStorage.removeItem(SavePatternKeyCmd+name);
        localStorage.removeItem(SavePatternKeyDesc+name);

        found = true;
        break;
      }
    }
  }

  if (!found) console.error(`Failed to remove pattern: ${name}`);
}
