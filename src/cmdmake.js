import { get } from 'svelte/store';

import {
  pStrand,
  maxLenPattern
} from './globals.js';

import {
  overBit_DegreeHue,
  overBit_PcentWhite,
  overBit_PcentCount,
  strandCopyLayer,
  strandCopyTracks
} from './strands.js';

import {
  DRAW_LAYER,
  ENABLEBIT_MUTE,
  ENABLEBIT_SOLO,
  DEF_HUE_VALUE,
  DEF_PCENT_BRIGHT,
  DEF_PCENT_DELAY,
  DEF_PCENT_COUNT,
  DEF_FORCE_VALUE,
  pluginBit_DIRECTION,
  pluginBit_NOREPEATING,
  pluginBit_TRIGFORCE,
  pluginBit_SENDFORCE,
  cmdStr_PcentXoffset,
  cmdStr_PcentXlength,
  cmdStr_LayerMute,
  cmdStr_SetEffect,
  cmdStr_PcentBright,
  cmdStr_MsecsDelay,
  cmdStr_ValueHue,
  cmdStr_PcentWhite,
  cmdStr_PcentCount,
  cmdStr_OrideBits,
  cmdStr_Backwards,
  cmdStr_CombinePixs,
  cmdStr_NoRepeating,
  cmdStr_TrigAtStart,
  cmdStr_TrigByEffect,
  cmdStr_TrigFromMain,
  cmdStr_TrigRepeating,
  cmdStr_TrigOffset,
  cmdStr_TrigRange,
  cmdStr_TrigForce
} from './devcmds.js';

import { deviceError } from './devtalk.js';

///////////////////////////////////////////////////////////

export const makeOrideBits = (p, track) =>
{
  let bits = 0;

  if (p.tracks[track].drawProps.overHue)
    bits |= overBit_DegreeHue;

  if (p.tracks[track].drawProps.overWhite)
    bits |= overBit_PcentWhite;

  if (p.tracks[track].drawProps.overCount)
    bits |= overBit_PcentCount;

  return bits;
}
  
// combine all layer commands into single command string
export const makeEntireCmdStr = () =>
{
  let cmdstr = '';
  let ridebits = 0;
  let splugbits = 0;
  let trigused = false;
  const strand = get(pStrand);

  for (let i = 0; i < strand.tactives; ++i)
  {
    const ptrack = strand.tracks[i];
    let drawplugin = false;
    let tplugbits = 0;

    // must have effect and not be muted to be enabled

    for (let j = 0; j < ptrack.lactives; ++j)
    {
      const player = ptrack.layers[j];
      cmdstr = cmdstr.concat(`${player.cmdstr}`);

    let bits = (player.mute ? ENABLEBIT_MUTE:0) | (player.solo ? ENABLEBIT_SOLO:0);
      if (j === DRAW_LAYER)
      {
        drawplugin = !player.mute;
        if (drawplugin)
        {
          tplugbits |= player.pluginObj.bits;
          splugbits |= player.pluginObj.bits;
          ridebits  |= makeOrideBits(strand, i);

          if (player.trigFromMain) trigused = true;
        }
      }
      else if (drawplugin && !player.mute)
      {
        tplugbits |= player.pluginObj.bits;
        splugbits |= player.pluginObj.bits;

        if (player.trigFromMain) trigused = true;
      }
    }

    // track plugin bits includes bits from all layers
    //console.log(`makeAll: track=${i} trackBits=${tplugbits.toString(16)}`);
    ptrack.trackBits = tplugbits;
  }

  //console.log(`makeEntireCmdStr: ${cmdstr}`);

  strand.curPatternCmd = cmdstr;
  strand.bitsOverride  = ridebits;
  strand.bitsEffects   = splugbits;
  strand.triggerUsed   = trigused;

  if (cmdstr.length > get(maxLenPattern))
    deviceError(`Exceeded max pattern length=${get(maxLenPattern)}`);

  //console.log(`oridebits=${ridebits.toString(16)}`);
  //console.log(`splugbits=${splugbits.toString(16)}`);

  // triggers update to UI - MUST HAVE THIS
  pStrand.set(strand);
}

// create partial command string for one layer in a track
export const makeLayerCmdStr = (track, layer) =>
{
  const strand = get(pStrand);
  const player = strand.tracks[track].layers[layer];
  let cmdstr = '';

  if (layer === DRAW_LAYER)
  {
    let trackbits = strand.tracks[track].trackBits;
    let pdraw = strand.tracks[track].drawProps;

    //console.log(`make: track=${track} bits=${trackbits.toString(16)}`);

    cmdstr = cmdstr.concat(`${cmdStr_SetEffect}${player.pluginObj.id} `);

    let bits = (player.mute ? ENABLEBIT_MUTE:0) | (player.solo ? ENABLEBIT_SOLO:0);
    if (bits) cmdstr = cmdstr.concat(`${cmdStr_LayerMute}${bits} `);

    if (pdraw.pcentXoffset !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentXoffset}${pdraw.pcentXoffset} `);

    if (pdraw.pcentXlength !== 100)
      cmdstr = cmdstr.concat(`${cmdStr_PcentXlength}${pdraw.pcentXlength} `);

    if (pdraw.pcentBright !== DEF_PCENT_BRIGHT)
      cmdstr = cmdstr.concat(`${cmdStr_PcentBright}${pdraw.pcentBright} `);

    if (pdraw.pcentDelay !== DEF_PCENT_DELAY)
      cmdstr = cmdstr.concat(`${cmdStr_MsecsDelay}${pdraw.pcentDelay} `);

    if (pdraw.valueHue !== DEF_HUE_VALUE)
      cmdstr = cmdstr.concat(`${cmdStr_ValueHue}${pdraw.valueHue} `);

    if (pdraw.pcentWhite !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentWhite}${pdraw.pcentWhite} `);

    if (pdraw.pcentCount !== DEF_PCENT_COUNT)
      cmdstr = cmdstr.concat(`${cmdStr_PcentCount}${pdraw.pcentCount} `);

    bits = makeOrideBits(strand, track);
    if (bits) cmdstr = cmdstr.concat(`${cmdStr_OrideBits}${bits} `);

    if (pdraw.orPixelVals)
      cmdstr = cmdstr.concat(`${cmdStr_CombinePixs} `);

    if (pdraw.dirBackwards && (trackbits & pluginBit_DIRECTION))
      cmdstr = cmdstr.concat(`${cmdStr_Backwards} `);

    if (pdraw.noRepeating && (trackbits & pluginBit_NOREPEATING))
      cmdstr = cmdstr.concat(`${cmdStr_NoRepeating} `);
  }
  else cmdstr = cmdstr.concat(`${cmdStr_SetEffect}${player.pluginObj.id} `);

  // don't include force value if effect doesn't use it
  if (player.pluginObj.bits & pluginBit_TRIGFORCE)
  {
    if (player.forceRandom)
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce} `);
    else if (player.forceValue !== DEF_FORCE_VALUE)
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce}${player.forceValue} `);
  }

  if (player.trigAtStart)
    cmdstr = cmdstr.concat(`${cmdStr_TrigAtStart} `);

  if (player.trigFromMain)
    cmdstr = cmdstr.concat(`${cmdStr_TrigFromMain} `);

  if (player.trigOnLayerShow && (player.trigSrcListDex > 0))
    cmdstr = cmdstr.concat(`${cmdStr_TrigByEffect}${player.trigSrcLayerDex} `);

  if (player.trigDoRepeat)
  {
    if (player.trigForever)
         cmdstr = cmdstr.concat(`${cmdStr_TrigRepeating} `);
    else cmdstr = cmdstr.concat(`${cmdStr_TrigRepeating}${player.trigRepCount} `);

    if (player.trigRepOffset !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_TrigOffset}${player.trigRepOffset} `);

    if (player.trigRepRange !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_TrigRange}${player.trigRepRange} `);
  }

  player.isnewstr = cmdstr !== player.cmdstr;
  //console.log(`make isnew=${player.isnewstr} cmdstr=${cmdstr}`);

  if (player.isnewstr)
  {
    //console.log(`makeLayerCmdStr(${track}.${layer}): "${player.cmdstr}" => "${cmdstr}"`);
    player.cmdstr = cmdstr;
    strand.modified = true;
    strand.idletime = 0;
  }
}

// create partial command strings for all layers in a track
export const makeTrackCmdStrs = (track) =>
{
  //console.log(`makeTrackCmdStrs: track=${track}`);
  let ptrack = get(pStrand).tracks[track];
  for (let i = 0; i < ptrack.lactives; ++i)
    makeLayerCmdStr(track, i);
}

export const makeTrigSourceList = () =>
{
  const strand = get(pStrand);
  let items = [];
  let count = 0;
  let devindex = 0;

  // reference: trigSrcItem in strands.js
  items.push({ id:0, devindex:0, sourceid:0,
               track:0, layer:0, text:'<none>' });

  // create list of track/layers that can cause triggering
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      //console.log(strand.tracks[track].layers[layer]);
      if (strand.tracks[track].layers[layer].pluginObj.bits & pluginBit_SENDFORCE)
      {
        let sourceid = strand.tracks[track].layers[layer].uniqueID;
        let name = strand.tracks[track].layers[layer].pluginObj.name;

        items.push({ id: ++count,
                     devindex: devindex,
                     sourceid: sourceid,
                     track: track,
                     layer: layer,
                     text: `Track(${track+1}) Layer(${layer+1}) - ${name}` });

        //console.log('tsource: ', items[count]);
      }

      ++devindex;
    }
  }

  //console.log('trigger items: ', items)
  strand.trigSources = items;
}

// must be called after any changes to the number
// or position of tracks, layers, or effect settings
export const updateTriggerLayers = (delid=0) =>
{
  // make list of possible trigger sources
  makeTrigSourceList();

  const strand = get(pStrand);
  let slist = strand.trigSources;

  // update index into trigger source list for all enabled layers
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      if (strand.tracks[track].layers[layer].trigOnLayerShow)
      {
        let sourceid = strand.tracks[track].layers[layer].trigSrcLayerID;
        let found = false;
        let dowarn = true;

        if (delid !== sourceid)
        {
          for (const [i, item] of slist.entries())
          {
            if (i > 0) // not <none>
            {
              if (item.sourceid === sourceid)
              {
                found = true;
                strand.tracks[track].layers[layer].trigSrcListDex = i;
                strand.tracks[track].layers[layer].trigSrcLayerDex = item.devindex;

                //console.log(`update: devindex=${item.devindex} => ${item.track}:${item.layer}`);
              }
            }
          }
        }
        else dowarn = false;

        if (!found)
        {
          if (dowarn) console.warn(`update: failed to find trigger source for: ${track}:${layer} ID=${sourceid}`);

          strand.tracks[track].layers[layer].trigOnLayerShow = false;
          strand.tracks[track].layers[layer].trigSrcListDex = 0;
        }
      }
    }
  }
}

export const updateAllTracks = () =>
{
  // rebuild all tracks to account for changes
  // to tracks/layers or trigger sources

  const strand = get(pStrand);
  for (let i = 0; i < strand.tactives; ++i)
    makeTrackCmdStrs(i);

  strandCopyTracks();
  makeEntireCmdStr();
}

export const updateLayerVals = (track, layer) =>
{
  //console.log(`updateLayerVals: track=${track} layer=${layer}`);
  makeLayerCmdStr(track, layer);
  strandCopyLayer(track, layer);
  makeEntireCmdStr();
}
