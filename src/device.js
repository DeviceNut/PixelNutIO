import { get } from 'svelte/store';

import {
  MIN_TRACK_LAYERS,
  PAGEMODE_CONTROLS,
  curPageMode,
  curDevice,
  nTracks,
  nLayers,
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  eStrands,
  dStrands,
  aDevicePats,
  aDeviceDesc,
  aStoredPats,
  selectSource,
  selectPattern
} from './globals.js';

import { makeNewStrand } from './strands.js';
import { parsePattern } from './cmdparse.js';
import { makeEntireCmdStr } from './cmdmake.js';

///////////////////////////////////////////////////////////

function setStrandTop(strand, dvals)
{
  strand.pcentBright = dvals.bright;
  strand.pcentDelay  = dvals.delay;
  strand.pixelOffset = dvals.first;
  strand.numPixels   = dvals.pixels;

  strand.doOverride  = dvals.xt_mode;
  strand.degreeHue   = dvals.xt_hue;
  strand.pcentWhite  = dvals.xt_white;
  strand.pcentCount  = dvals.xt_count;
}

export let deviceSetup = (device) =>
{
  console.log(`Connecting to: "${device.curname}"...`); // DEBUG

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
  nLayers.set(tracklayers);

  const sid = 0;
  let slist = [];
  let elist = [];

  for (let s = 0; s < numstrands; ++s)
  {
    const strand = makeNewStrand(s);
    const select = (s === sid) ? true : false;

    strand.selected = select;
    setStrandTop(strand, device.report.strands[s]);

    slist.push(strand);
    elist.push(select);
  }

  aStrands.set(slist);
  eStrands.set(elist);
  pStrand.set(slist[sid]);

  // make duplicate object to keep shadow values
  slist = [];
  for (let s = 0; s < numstrands; ++s)
  {
    const strand = makeNewStrand(s);
    setStrandTop(strand, device.report.strands[s]);
    slist.push(strand);
  }
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

    if (parsePattern(device.report.strands[s].patstr))
    {
      makeEntireCmdStr();

      const cmdstr = strand.curPatternStr;
      let cmdname = device.report.strands[s].patname;
      strand.curPatternName = cmdname;

      if (cmdstr != '')
      {
        if (cmdname == '') cmdname = 'Unknown'
        console.log(`Now playing: ${cmdname}: "${cmdstr}"`);

        const devlen = get(aDevicePats).length;
        const obj = { id:devlen, text:cmdname, cmd:cmdstr };
        const desc = 'This is what\'s currently playing on the device.';

        get(aDevicePats).push(obj);
        get(aDeviceDesc).push([desc]);

        strand.curSourceIdx = 0;
        strand.curPatternIdx = devlen;
      }
      else doreset = true; // if no pattern string
    }
    else doreset = true; // if pattern string parse error

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

    get(dStrands)[s].curSourceIdx = strand.curSourceIdx;
    if (!doselect)
      get(dStrands)[s].curPatternIdx = strand.curPatternIdx;
  }

  // reset to use first strand
  idStrand.set(0);
  pStrand.set(get(aStrands)[0]);

  // prevent disturbing what's currently running on the device
  // when first connect unless explicitely setting pattern
  selectSource.set(false);
  selectPattern.set(doselect);

  curPageMode.set(PAGEMODE_CONTROLS);
}
