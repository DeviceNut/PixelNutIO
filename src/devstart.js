import { get } from 'svelte/store';

import {
  MIN_TRACKS,
  MIN_LAYERS,
  MINLEN_MAXPATTERN,
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
  msgTitle,
  msgDesc
} from './globals.js';

import {
  preset_DrawEffectItems,
  preset_DrawEffectDescs,
  preset_FilterEffectItems,
  preset_FilterEffectDescs
} from './presets.js';

import { pluginBit_REDRAW } from './devcmds.js';
import { deviceError } from './devtalk.js';

import { strandCreateNew } from './strands.js';
import { parsePattern } from './cmdparse.js';
import { makeEntireCmdStr } from './cmdmake.js';

import {
  MENUID_CUSTOM,
  MENUID_DEVICE,
  menuDevice,
  menuCreate
} from './menu.js';

///////////////////////////////////////////////////////////

function devInfoErr(msg)
{
  deviceError(msg, 'Device Error');
}

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
  //console.log(`Connecting to: "${device.curname}"...`);

  // now being actively controlled
  device.active = true;
  curDevice.set(device);

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

  for (let i = 0; i < device.report.plugins.length; ++i)
  {
    let bvalue = parseInt(device.report.plugins[i].bits, 16);
    const item = { id:  device.report.plugins[i].id,
                  bits: bvalue,
                  text: device.report.plugins[i].name };

    if (bvalue & pluginBit_REDRAW)
    {
      items_draw.push( item );
      descs_draw.push( device.report.plugins[i].desc );
    }
    else
    {
      items_filter.push( item );
      descs_filter.push( device.report.plugins[i].desc );
    }
  }

  aEffectsDraw.set(items_draw);
  aEffDrawDesc.set(descs_draw);

  aEffectsFilter.set(items_filter);
  aEffFilterDesc.set(descs_filter);

  // create strand lists for this specific device

  let numstrands = device.report.strands.length;
  if (numstrands <= 0)
    return devInfoErr(`No strands found: ${numstrands}`);

  let numtracks = device.report.numtracks;
  let numlayers = device.report.numlayers;
  let tracklayers = numlayers / numtracks;

  let maxstrlen = device.report.maxstrlen;
  maxLenPattern.set(maxstrlen);

  if (maxstrlen < MINLEN_MAXPATTERN)
    return devInfoErr(`Must support longer patterns: ${maxstrlen} < ${MINLEN_MAXPATTERN}`);

  if (numtracks < MIN_TRACKS)
    return devInfoErr(`Too few tracks: ${numtracks} < ${MIN_TRACKS}`);

  if (tracklayers < MIN_LAYERS)
    return devInfoErr(`Too few layers: ${tracklayers} < ${MIN_LAYERS}`);

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

  const patlen = device.report.patterns.length;
  if (patlen > 0)
  {
    let pcmds = [];
    let descs = [];
  
    for (let i = 0; i < patlen; ++i)
    {
      const item =
      {
        id:MENUID_DEVICE + i + 1,
        text: device.report.patterns[i].name
      };

      items.push( item );
      pcmds.push( device.report.patterns[i].pcmd );
      descs.push( device.report.patterns[i].desc );
    }

    aDevicePatt.set(pcmds);
    aDeviceDesc.set(descs);
  }

  // setup each strand with its pattern

  for (let s = 0; s < numstrands; ++s)
  {
    idStrand.set(s);
    let strand = get(aStrands)[s];
    pStrand.set(strand);

    let cmdname = device.report.strands[s].patname;
    let cmdstr = device.report.strands[s].patstr;

    if (0)//parsePattern(cmdstr))
    {
      makeEntireCmdStr();

      strand.curPatternName = cmdname;
      strand.curPatternCmd = cmdstr;

    }
    else
    {
      // trigger error message title/text
      msgDesc.set(`For strand #${s}: ${cmdstr}`);
      msgTitle.set('Device Pattern Unregonized');

      strand.curPatternId   = MENUID_CUSTOM;
      strand.curPatternName = '';
      strand.curPatternCmd  = '';
      strand.curPatternDesc = '';
    }
  }

  if (get(curDevice) !== null)
  {
    menuDevice.children = items;
    menuCreate();
  
    // reset to use first strand
    idStrand.set(0);
    pStrand.set(get(aStrands)[0]);
  
    curPageMode.set(PAGEMODE_CONTROLS);
  }
}
