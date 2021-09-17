import { get } from 'svelte/store';

import {
  MIN_TRACK_LAYERS,
  PAGEMODE_CONTROLS,
  curPageMode,
  curDevice,
  nTracks,
  tLayers,
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  eStrands,
  dStrands,
  aDevicePats,
  aDeviceDesc,
  aStoredPats,
  aBuiltinPats,
  selectSource,
  selectPattern
} from './globals.js';

import { makeNewStrand } from './strands.js';
import { parsePattern } from './cmdparse.js';
import { makeEntireCmdStr } from './cmdmake.js';

///////////////////////////////////////////////////////////

// returns index of match in list, or -1
function matchCmdInItemList(cmd, list)
{
  for (let i = 0; i < list.length; ++i)
  {
    //console.log('\n\nmatch: ');
    //console.log(`"${cmd}"`);
    //console.log(`"${list[i].cmd}"`);

    if (list[i].cmd === cmd)
      return i;
  }

  return -1;
}

export let deviceSetup = (device) =>
{
  //console.log(`Connecting to: "${device.curname}"...`); // DEBUG

  let numstrands = device.report.nstrands;

  let numtracks = device.report.numtracks;
  let numlayers = device.report.numlayers;
  let tracklayers = numlayers / numtracks;

  if (tracklayers < MIN_TRACK_LAYERS)
  {
    tracklayers = MIN_TRACK_LAYERS;
    numtracks = numlayers / tracklayers;
  }

  nStrands.set(numstrands);
  nTracks.set(numtracks);
  tLayers.set(tracklayers);

  const sid = 0;
  let slist = [];
  let elist = [];

  for (let s = 0; s < numstrands; ++s)
  {
    const strand = makeNewStrand(s);
    const select = (s === sid) ? true : false;

    strand.selected = select;

    strand.pcentBright = device.report.strands[s].bright;
    strand.msecsDelay  = device.report.strands[s].delay;
    strand.firstPixel  = device.report.strands[s].first;
    strand.numPixels   = device.report.strands[s].pixels;

    strand.doOverride  = device.report.strands[s].xt_mode;
    strand.degreeHue   = device.report.strands[s].xt_hue;
    strand.pcentWhite  = device.report.strands[s].xt_white;
    strand.pcentCount  = device.report.strands[s].xt_count;

    slist.push(strand);
    elist.push(select);
  }

  aStrands.set(slist);
  eStrands.set(elist);
  pStrand.set(slist[sid]);

  // make duplicate object to keep shadow values
  slist = [];
  for (let i = 0; i < numstrands; ++i)
    slist.push(makeNewStrand(i));
  dStrands.set(slist);

  device.active = true;
  curDevice.set(device);

  let doselect = false;
  let doreset;

  for (let s = 0; s < numstrands; ++s)
  {
    doreset = false;

    idStrand.set(s);
    let strand = get(aStrands)[s];
    pStrand.set(strand);

    if (parsePattern(device.report.strands[s].pattern))
    {
      makeEntireCmdStr();

      let cmdstr = strand.curPatternStr;
      let sindex = 0;
      let match, slist;
      let found = false;

      console.log(`Device pattern: "${cmdstr}"`); // DEBUG

      if (cmdstr !== '')
      {
        // search for match in any of the pattern lists

        slist = get(aDevicePats);
        if (slist.length > 0)
        {
          if ((match = matchCmdInItemList(cmdstr, slist)) >= 0)
          {
            strand.curSourceIdx = sindex;
            strand.curPatternIdx = match;
            found = true;
          }
          ++sindex;
        }

        slist = get(aStoredPats);
        if (!found && (slist.length > 0))
        {
          if ((match = matchCmdInItemList(cmdstr, slist)) >= 0)
          {
            strand.curSourceIdx = sindex;
            strand.curPatternIdx = match;
            found = true;
          }
          ++sindex;
        }

        slist = get(aBuiltinPats);
        if (!found && (slist.length > 0))
        {
          if ((match = matchCmdInItemList(cmdstr, slist)) >= 0)
          {
            strand.curSourceIdx = sindex;
            strand.curPatternIdx = match;
            found = true;
          }
          //++sindex;
        }

        if (!found)
        {
          const devlen = get(aDevicePats).length;

          if (devlen === 0)
          {
            aDevicePats.set([{ id:'0', text:'<none>', cmd:'' }]);
            aDeviceDesc.set([[]]);
          }

          const obj = { id:devlen, text:'found-on-device', cmd:cmdstr };
          const desc = 'This pattern was found on the device.';

          get(aDevicePats).push(obj);
          get(aDeviceDesc).push([desc]);

          strand.curSourceIdx = 0;
          strand.curPatternIdx = devlen;
        }
      }
      else doreset = true;
    }
    else doreset = true;

    if (doreset) // set to first pattern in built-ins
    {
      let index = 0;
      if (get(aDevicePats).length > 0) ++index;
      if (get(aStoredPats).length > 0) ++index;
      strand.curSourceIdx = index;
      strand.curPatternIdx = 1;

      if (s === 0) doselect = true;
    }

    //console.log('index: ', strand.curSourceIdx, strand.curPatternIdx); // DEBUG
  }

  // reset to use first strand
  idStrand.set(0);
  pStrand.set(get(aStrands)[0]);

  selectSource.set(false);
  selectPattern.set(doselect);

  curPageMode.set(PAGEMODE_CONTROLS);
}
