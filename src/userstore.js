import { get } from 'svelte/store';

import {
  aStoredPats,
  aStoredDesc
} from './globals.js';

const SavePatternSeparator  = ',';
const SavePatternNames      = "PixelNut-Names";
const SavePatternKeyCmd     = "PixelNut-Cmds-";
const SavePatternKeyDesc    = "PixelNut-Desc-";

///////////////////////////////////////////////////////////

export const storePatternsInit = () =>
{
  // if user has saved patterns:
  // retrieve command and search for built-ins
  // else set to first one (Rainbow Ripple)

  let lpats = [];
  let ldesc = [];

  const names = localStorage.getItem(SavePatternNames);
  if ((names !== null) && (names !== ''))
  {
    let nlist = names.split(SavePatternSeparator);
    let bcount = 0;

    //console.log('nlist=', nlist); // DEBUG

    for (const text of nlist)
    {
      if (text === '') continue;
      let cmd = localStorage.getItem(SavePatternKeyCmd+text);
      let adesc = localStorage.getItem(SavePatternKeyDesc+text);

      if (cmd !== '')
      {
        if (bcount === 0)
        {
          const obj = { id:'0', text:'<none>', cmd:'' };
          lpats.push(obj);
          ldesc.push([]);
          bcount = 1;
        }

        const obj = { id:`${++bcount}`, text:text, cmd:cmd };
        lpats.push(obj);

        let dlist = [adesc];
        ldesc.push(dlist);

        //console.log('dlist=', dlist); // DEBUG
      }
    }
  }
  
  aStoredPats.set(lpats);
  aStoredDesc.set(ldesc);
}

export const storePatternSave = (name, desc, cmds) =>
{
  if (!desc) desc = ''; // allow empty description
  if (name && cmds)
  {
    //console.log(`saving: ${name}:${desc}`); // DEBUG

    let names = localStorage.getItem(SavePatternNames);
    if (names === null) names = '';
    else if (names !== '') names = names.concat(SavePatternSeparator);
    names = names.concat(name);
  
    //console.log('names=', names); // DEBUG
  
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
        //console.log(`removing: ${name}`); // DEBUG

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
