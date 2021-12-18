import { get } from 'svelte/store';

import {
  MIN_TRACK_LAYERS,
  PAGEMODE_CONTROLS,
  curPageMode,
  curDevice,
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  eStrands,
  dStrands,
  nTracks,
  nLayers,
  maxLenPattern,
  aDevicePatt,
  aDeviceDesc,
  aEffectsDraw,
  aEffDrawDesc,
  aEffectsFilter,
  aEffFilterDesc,
  menuDevice
} from './globals.js';

import {
  preset_DrawEffectItems,
  preset_DrawEffectDescs,
  preset_FilterEffectItems,
  preset_FilterEffectDescs,
  pluginBit_REDRAW
} from './presets.js';

import { strandCreateNew } from './strands.js';
import { parsePattern } from './cmdparse.js';
import { makeEntireCmdStr } from './cmdmake.js';
import { menuCreate } from './menu.js';

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

export let deviceStartup = (device) =>
{
  console.log(`Connecting to: "${device.curname}"...`); // DEBUG

  // create draw/filter effect lists with device specific items

  let items_draw = [];
  let descs_draw = [];

  let items_filter = [];
  let descs_filter = [];

  for (let i = 0; i < preset_DrawEffectItems.length; ++i)
  {
    items_draw.push( preset_DrawEffectItems[i] );
    descs_draw.push( preset_DrawEffectDescs[i] );
  }

  for (let i = 0; i < preset_FilterEffectItems.length; ++i)
  {
    items_filter.push( preset_FilterEffectItems[i] );
    descs_filter.push( preset_FilterEffectDescs[i] );
  }

  for (let i = 0; i < device.effects_items.length; ++i)
  {
    let bvalue = device.effects_items[i].bits;
    if (bvalue & pluginBit_REDRAW)
    {
      items_draw.push( device.effects_items[i] );
      descs_draw.push( device.effects_descs[i] );
    }
    else
    {
      items_filter.push( device.effects_items[i] );
      descs_filter.push( device.effects_descs[i] );
    }
  }

  aEffectsDraw.set(items_draw);
  aEffDrawDesc.set(descs_draw);

  aEffectsFilter.set(items_filter);
  aEffFilterDesc.set(descs_filter);

  // create strand lists for this specific device

  let numstrands = device.report.strands.length; // TODO: error if 0

  let numtracks = device.report.numtracks;
  let numlayers = device.report.numlayers;
  let tracklayers = numlayers / numtracks;

  maxLenPattern.set(device.report.maxstrlen);

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
    const strand = strandCreateNew(s);
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
    const strand = strandCreateNew(s);
    setStrandTop(strand, device.report.strands[s]);
    slist.push(strand);
  }
  dStrands.set(slist);

  // create pattern menu lists for this specific device

  let items = [];

  const patlen = device.patterns_items.length;
  if (patlen > 0)
  {
    let pcmds = [];
    let descs = [];
  
    for (let i = 0; i < patlen; ++i)
    {
      items.push( device.patterns_items[i] );
      pcmds.push( device.patterns_pcmds[i] );
      descs.push( device.patterns_descs[i] );
    }

    aDevicePatt.set(pcmds);
    aDeviceDesc.set(descs);
  }

  for (let s = 0; s < numstrands; ++s)
  {
    idStrand.set(s);
    let strand = get(aStrands)[s];
    pStrand.set(strand);

    let cmdname = device.report.strands[s].patname;
    let cmdstr = device.report.strands[s].patstr;

    if (parsePattern(cmdstr))
    {
      makeEntireCmdStr();

      strand.curPatternName = cmdname;
      strand.curPatternCmd = cmdstr;
      // TODO what about ID etc.
    }
    else
    {

    }

    /*
    if (cmdstr != '')
    {
      if (cmdname == '') cmdname = 'Now Playing'
      console.log(`${cmdname}: "${cmdstr}"`);

      const devlen = get(aDevicePats).length;
      const obj = { id:devlen, text:cmdname, cmd:cmdstr };
      const desc = `This is what\'s currently playing on strand ${s}.`;

      get(aDevicePats).push(obj);
      get(aDeviceDesc).push([desc]);

      strand.curPatternIdx = get(aDevicePats).length-1;
    }

    get(dStrands)[s].curPatternIdx = strand.curPatternIdx;
    */
  }

  menuDevice.children = items;
  menuCreate();

  // reset to use first strand
  idStrand.set(0);
  pStrand.set(get(aStrands)[0]);

  device.active = true;
  curDevice.set(device);

  curPageMode.set(PAGEMODE_CONTROLS);
}
