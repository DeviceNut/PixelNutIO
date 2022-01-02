import { get } from 'svelte/store';

import {
  pStrand,
  idStrand,
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
  DRAW_LAYER           ,
  DEF_HUE_VALUE       ,
  DEF_PCENT_BRIGHT     ,
  DEF_PCENT_DELAY      ,
  DEF_PCENT_COUNT      ,
  DEF_FORCE_VALUE      ,
  pluginBit_TRIGFORCE  ,
  pluginBit_SENDFORCE  ,
  cmdStr_PcentXoffset  ,
  cmdStr_PcentXlength  ,
  cmdStr_LayerMute     ,
  cmdStr_SetEffect     ,
  cmdStr_PcentBright   ,
  cmdStr_MsecsDelay    ,
  cmdStr_DegreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Backwards     ,
  cmdStr_CombinePixs   ,
  cmdStr_NoRepeating   ,
  cmdStr_TrigAtStart   ,
  cmdStr_TrigByEffect  ,
  cmdStr_TrigFromMain  ,
  cmdStr_TrigRepeating ,
  cmdStr_TrigOffset    ,
  cmdStr_TrigRange     ,
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
  let strand = get(pStrand);

  for (let i = 0; i < strand.tactives; ++i)
  {
    let track = strand.tracks[i];
    let drawplugin = false;
    let tplugbits = 0;

    // must have effect and not be muted to be enabled

    for (let j = 0; j < track.lactives; ++j)
    {
      let layer = track.layers[j];
      //console.log(`makeAll: track=${i} layer=${j} bits=${layer.pluginObj.bits.toString(16)}`);

      if (j === DRAW_LAYER)
      {
        cmdstr = cmdstr.concat(`${layer.cmdstr}`);

        drawplugin = !layer.mute;
        if (drawplugin)
        {
          tplugbits |= layer.pluginObj.bits;
          splugbits |= layer.pluginObj.bits;
          ridebits |= makeOrideBits(strand, i);

          if (layer.trigFromMain) trigused = true;
        }
        else cmdstr = cmdstr.concat(`${cmdStr_LayerMute} `);
      }
      else
      {
        cmdstr = cmdstr.concat(`${layer.cmdstr}`);

        if (drawplugin && !layer.mute)
        {
          tplugbits |= layer.pluginObj.bits;
          splugbits |= layer.pluginObj.bits;

          if (layer.trigFromMain) trigused = true;
        }
        else cmdstr = cmdstr.concat(`${cmdStr_LayerMute} `);
      }
    }

    // track plugin bits includes bits from all layers
    //console.log(`makeAll: track=${i} trackBits=${tplugbits.toString(16)}`);
    track.trackBits = tplugbits;
  }

  get(pStrand).curPatternCmd = cmdstr;
  get(pStrand).bitsOverride  = ridebits;
  get(pStrand).bitsEffects   = splugbits;
  get(pStrand).triggerUsed   = trigused;

  if (cmdstr.length > get(maxLenPattern))
    deviceError(`Exceeded max pattern length=${get(maxLenPattern)}`);

  //console.log(`oridebits=${ridebits.toString(16)}`);
  //console.log(`splugbits=${splugbits.toString(16)}`);

  // triggers update to UI - MUST HAVE THIS
  pStrand.set(get(pStrand));
}

// create partial command string for one layer in a track
export const makeLayerCmdStr = (track, layer) =>
{
  let player = get(pStrand).tracks[track].layers[layer];
  let cmdstr = '';

  if (layer === DRAW_LAYER)
  {
    let pdraw = get(pStrand).tracks[track].drawProps;

    cmdstr = cmdstr.concat(`${cmdStr_SetEffect}${player.pluginObj.id} `);

    if (pdraw.pcentXoffset !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentXoffset}${pdraw.pcentXoffset} `);

    if (pdraw.pcentXlength !== 100)
      cmdstr = cmdstr.concat(`${cmdStr_PcentXlength}${pdraw.pcentXlength} `);

    if (pdraw.pcentBright !== DEF_PCENT_BRIGHT)
      cmdstr = cmdstr.concat(`${cmdStr_PcentBright}${pdraw.pcentBright} `);

    if (pdraw.pcentDelay !== DEF_PCENT_DELAY)
      cmdstr = cmdstr.concat(`${cmdStr_MsecsDelay}${pdraw.pcentDelay} `);

    if (pdraw.degreeHue !== DEF_HUE_VALUE)
      cmdstr = cmdstr.concat(`${cmdStr_DegreeHue}${pdraw.degreeHue} `);

    if (pdraw.pcentWhite !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentWhite}${pdraw.pcentWhite} `);

    if (pdraw.pcentCount !== DEF_PCENT_COUNT)
      cmdstr = cmdstr.concat(`${cmdStr_PcentCount}${pdraw.pcentCount} `);

    let bits = makeOrideBits(get(pStrand), track);
    if (bits !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_OrideBits}${bits} `);

    if (pdraw.orPixelVals === true)
      cmdstr = cmdstr.concat(`${cmdStr_CombinePixs} `);

    if (pdraw.dirBackwards === true)
      cmdstr = cmdstr.concat(`${cmdStr_Backwards} `);

    if (pdraw.noRepeating === true)
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

  if (player.trigOnLayer)
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

  player.cmdstr = cmdstr;
}

// create partial command strings for all layers in a track
export const makeTrackCmdStrs = (track) =>
{
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

  items.push({ id:0,
               devindex:0, sourceid:0,
               track:0, layer:0,
               text:'<none>' });

  // create list of track/layers that can cause triggering
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      if (strand.tracks[track].layers[layer].pluginObj.bits & pluginBit_SENDFORCE)
      {
        let sourceid = strand.tracks[track].layers[layer].uniqueID;
        let name = strand.tracks[track].layers[layer].pluginObj.name;

        ++count;
        items.push({ id:count,
                     devindex:devindex, sourceid:sourceid,
                     track:track, layer:layer,
                     text: `Track(${track+1}) Layer(${layer+1}) - ${name}` });

        //console.log('tsource: ', items[count]);
      }

      ++devindex;
    }
  }

  strand.trigSources = items;
}

// must be called after any changes to the number
// or position of tracks, layers, or effect settings
export const updateTriggerLayers = () =>
{
  makeTrigSourceList();

  const strand = get(pStrand);
  let slist = strand.trigSources;

  // update index into trigger source list for all enabled layers
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      if (strand.tracks[track].layers[layer].trigOnLayer)
      {
        let sourceid = strand.tracks[track].layers[layer].trigSrcLayerID;
        let found = false;

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

        if (!found)
        {
          console.warn(`update: failed to find trigger source for: ${track}:${layer} ID=${sourceid}`);

          strand.tracks[track].layers[layer].trigOnLayer = false;
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

  for (let i = 0; i < get(pStrand).tactives; ++i)
    makeTrackCmdStrs(i);

  strandCopyTracks();
  makeEntireCmdStr();
}

export const updateLayerVals = (track, layer) =>
{
  makeLayerCmdStr(track, layer);
  strandCopyLayer(track, layer);
  makeEntireCmdStr();
}
