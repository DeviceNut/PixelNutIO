import { get } from 'svelte/store';

import {
  nStrands,
  sStrands,
  idStrand,
  pStrand,
  aStrands,
  allowUpdates,
  showCustom
} from './globals.js';

import {
  strandCopyAll
} from './strands.js';

import {
  sendStrandSwitch,
  sendPatternToStrand
} from './cmdsend.js';

///////////////////////////////////////////////////////////

// Must be called before selected is toggled
// (passed value must be the previous setting)
export const userStrandCombine = (combine) =>
{
  //console.log(`StrandCombine: ${combine}`);

  if (combine && (get(sStrands) > 1))
  {
    // combine was on and more than one selected

    const cur = get(idStrand);
    const scount = get(nStrands);

    // disable all but the current one
    for (let i = 0; i < scount; ++i)
    {
      if (i !== cur) get(aStrands)[i].selected = false;

      //console.log(`StrandCombine: #${i} selected=${get(aStrands)[i].selected}`);
    }

    sStrands.set(1);
    aStrands.set(get(aStrands)); // trigger update to other checkboxes
  }
}

// Must be called before selected is toggled
// Assume disabling last strand is not allowed
export const userStrandSelect = (combine, index) =>
{
  let newui = false;

  if (combine)
  {
    let cur = get(idStrand);
    const scount = get(nStrands);

    const wason = get(aStrands)[index].selected;
    get(aStrands)[index].selected = !wason;

    if (!wason)
    {
      //console.log(`Mirror current strand #${cur} onto #${index}`);

      strandCopyAll();
      sendPatternToStrand(index);

      sStrands.set(get(sStrands)+1);
    }
    else if (cur == index)
    {
      //console.log(`Disable current strand #${cur}`);

      for (let s = 0; s < scount; ++s)
      {
        // set current to first enabled one
        if (get(aStrands)[s].selected)
        {
          //console.log(`Set current strand to #${s}`);

          idStrand.set(s);
          pStrand.set(get(aStrands)[s]);
          sendStrandSwitch(s);
          break;
        }
      }

      sStrands.set(get(sStrands)-1);
      newui = true; // pStrand changed
    }
    else
    {
      //console.log(`Disable combined strand #${index}`);
      sStrands.set(get(sStrands)-1);
    }
  }
  else // index is new strand to switch to
  {
    //console.log(`StrandSelect: #${index}`);

    get(aStrands)[get(idStrand)].selected = false; // clears previous checkbox

    idStrand.set(index);
    pStrand.set(get(aStrands)[index]);
    sendStrandSwitch(index);

    newui = true; // pStrand changed
  }

  //console.log(get(aStrands), get(pStrand));

  if (newui && get(showCustom))
  {
    // supress reactive changes until UI updated
    //console.log('Supress updates...');
    allowUpdates.set(false);
  }
}
