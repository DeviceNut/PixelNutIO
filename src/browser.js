import { get } from 'svelte/store';

import {
  mqttBrokerIP,
  aStoredPatt,
  aStoredDesc,
  menuBrowser,
  MENUID_BROWSWER
} from './globals.js';

const SaveBrokerIPaddr      = "PixelNut-BrokerIP";
const SavePatternNames      = "PixelNut-Names";
const SavePatternKeyCmd     = "PixelNut-Cmds-";
const SavePatternKeyDesc    = "PixelNut-Desc-";
const SavePatternSeparator  = ',';

///////////////////////////////////////////////////////////

export const storeBrokerRead = () =>
{
  let ipaddr = localStorage.getItem(SaveBrokerIPaddr);
  if (ipaddr === null) ipaddr = '';
  console.log(`Retrieving broker IP: ${ipaddr}`);
  if (ipaddr === '')
  {
    // TODO check if passed IP from server
  }
  mqttBrokerIP.set(ipaddr);
}

export const storeBrokerWrite = () =>
{
  let ipaddr = get(mqttBrokerIP);
  console.log(`Saving broker IP: ${ipaddr}`);
  localStorage.setItem(SaveBrokerIPaddr, ipaddr);
}

export const storePatternsInit = () =>
{
  // if user has saved patterns:
  // retrieve command and search for built-ins
  // else set to first one (Rainbow Ripple)

  let lmenu = [];
  let lpatt = [];
  let ldesc = [];

  const names = localStorage.getItem(SavePatternNames);
  if ((names !== null) && (names !== ''))
  {
    let nlist = names.split(SavePatternSeparator);
    let bcount = MENUID_BROWSWER;

    //console.log('nlist=', nlist); // DEBUG

    for (const text of nlist)
    {
      if (text === '') continue;
      let patt = localStorage.getItem(SavePatternKeyCmd+text);
      let desc = localStorage.getItem(SavePatternKeyDesc+text);
      desc = [desc];

      if (patt !== '')
      {
        const obj = { id:`${++bcount}`, text:text };
        lmenu.push(obj);
        lpatt.push(patt);
        ldesc.push(desc);
      }
    }
  }

  menuBrowser.children = lmenu;
  aStoredPatt.set(lpatt);
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

export const storePatternRemove = (delname) =>
{
  let found = false;

  let names = localStorage.getItem(SavePatternNames);
  if (names === null) names = '';

  if (names !== '')
  {
    let nlist = names.split(SavePatternSeparator);
    for (const [i, n] of nlist.entries())
    {
      if (n === delname)
      {
        //console.log(`removing: ${n}`); // DEBUG

        nlist.splice(i, 1);
        const str = nlist.join(SavePatternSeparator);
        localStorage.setItem(SavePatternNames, str);
        localStorage.removeItem(SavePatternKeyCmd+n);
        localStorage.removeItem(SavePatternKeyDesc+n);

        found = true;
        break;
      }
    }
  }

  if (!found) console.warn(`Failed to remove pattern: ${delname}`);
}

export const storePatternRemAll = () =>
{
  let names = localStorage.getItem(SavePatternNames);
  if (names === null) names = '';

  if (names !== '')
  {
    let nlist = names.split(SavePatternSeparator);
    for (const [i, n] of nlist.entries())
    {
        console.log(`removing: ${n}`); // DEBUG

        localStorage.removeItem(SavePatternKeyCmd+n);
        localStorage.removeItem(SavePatternKeyDesc+n);
    }
    localStorage.setItem(SavePatternNames, '');
  }
}