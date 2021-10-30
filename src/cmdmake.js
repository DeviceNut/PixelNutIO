import { get } from 'svelte/store';

import {
  pStrand,
  dStrands,
  idStrand,
  aEffectsDraw,
  aEffectsFilter,
  maxLenPattern
} from './globals.js';

import {
  DRAW_LAYER           ,
  DEF_HUE_DEGREE       ,
  DEF_PCENT_BRIGHT     ,
  DEF_PCENT_DELAY      ,
  DEF_PCENT_COUNT      ,
  DEF_FORCE_VALUE      ,
  overBit_DegreeHue    ,
  overBit_PcentWhite   ,
  overBit_PcentCount   ,
  cmdStr_PcentXoffset  ,
  cmdStr_PcentXlength  ,
  cmdStr_SetEffect     ,
  cmdStr_PcentBright   ,
  cmdStr_MsecsDelay    ,
  cmdStr_DegreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Backwards     ,
  cmdStr_CombinePixs   ,
  cmdStr_TrigAtStart   ,
  cmdStr_TrigByEffect  ,
  cmdStr_TrigFromMain  ,
  cmdStr_TrigRepeating ,
  cmdStr_TrigOffset    ,
  cmdStr_TrigRange     ,
  cmdStr_TrigForce     ,
  cmdStr_Go            
} from './devcmds.js';

import {
  strandCopyLayer,
  strandCopyTracks
} from './strands.js';

import { deviceError } from './devtalk.js';

import { pluginBit_SENDFORCE } from './presets.js';

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
  
// combine all layer cmds into command output string
export const makeEntireCmdStr = () =>
{
  // combine all layers into single string
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

    //let ismute = false; // DEBUG

    // must have effect and not be mute be enabled

    for (let j = 0; j < track.lactives; ++j)
    {
      let layer = track.layers[j];

      // must have effect and not be mute to get output
      // (note that draw layer does not have mute)
      if (j === DRAW_LAYER)
      {
        drawplugin = !layer.mute;
        tplugbits |= layer.pluginBits;

        if (drawplugin)
        {
          cmdstr = cmdstr.concat(`${layer.cmdstr}`);
          ridebits |= makeOrideBits(strand, i);
          splugbits |= layer.pluginBits;

          //console.log(`draw: cmdstr=${cmdstr} tmain=${layer.trigFromMain}`);
          if (layer.trigFromMain) trigused = true;
        }
        //else ismute = true; // DEBUG
      }
      else if (drawplugin && !layer.mute)
      {
        cmdstr = cmdstr.concat(`${layer.cmdstr}`);
        splugbits |= layer.pluginBits;
        tplugbits |= layer.pluginBits;

        //console.log(`filter: tmain=${layer.trigFromMain}`);
        if (layer.trigFromMain) trigused = true;
      }

      //else ismute = true; // DEBUG
      //console.log(`  ${i}:${j} ${layer.cmdstr} ${ismute?'*':''}`) // DEBUG
    }

    // track plugin bits includes bits from all layers
    track.trackBits = tplugbits;
  }

  if (cmdstr !== '') cmdstr = cmdstr.concat(`${cmdStr_Go}`);

  get(pStrand).curPatternStr = cmdstr;
  get(pStrand).bitsOverride  = ridebits;
  get(pStrand).bitsEffects   = splugbits;
  get(pStrand).triggerUsed   = trigused;

  if (cmdstr.length > get(maxLenPattern))
    deviceError('Exceeded max pattern length');

  //console.log(`oridebits=${ridebits.toString(16)}`); // DEBUG
  //console.log(`splugbits=${splugbits.toString(16)}`); // DEBUG

  pStrand.set(get(pStrand)); // triggers update to UI - MUST HAVE THIS
}

// create partial command string for one layer in a track
export const makeLayerCmdStr = (track, layer) =>
{
  let player = get(pStrand).tracks[track].layers[layer];
  let cmdstr = '';

  if (layer === DRAW_LAYER)
  {
    let plugvalue = get(aEffectsDraw)[player.pluginIndex].id;
    let pdraw = get(pStrand).tracks[track].drawProps;

    cmdstr = cmdstr.concat(`${cmdStr_SetEffect}${plugvalue} `);

    if (pdraw.pcentXoffset !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentXoffset}${pdraw.pcentXoffset} `);

    if (pdraw.pcentXlength !== 100)
      cmdstr = cmdstr.concat(`${cmdStr_PcentXlength}${pdraw.pcentXlength} `);

    if (pdraw.pcentBright !== DEF_PCENT_BRIGHT)
      cmdstr = cmdstr.concat(`${cmdStr_PcentBright}${pdraw.pcentBright} `);

    if (pdraw.pcentDelay !== DEF_PCENT_DELAY)
      cmdstr = cmdstr.concat(`${cmdStr_MsecsDelay}${pdraw.pcentDelay} `);

    if (pdraw.degreeHue !== DEF_HUE_DEGREE)
      cmdstr = cmdstr.concat(`${cmdStr_DegreeHue}${pdraw.degreeHue} `);

    if (pdraw.pcentWhite !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentWhite}${pdraw.pcentWhite} `);

    if (pdraw.pcentCount !== DEF_PCENT_COUNT)
      cmdstr = cmdstr.concat(`${cmdStr_PcentCount}${pdraw.pcentCount} `);

    let bits = makeOrideBits(get(pStrand), track);
    if (bits !== 0)
      cmdstr = cmdstr.concat(`${cmdStr_OrideBits}${bits} `);

    if (pdraw.dirBackwards === true)
      cmdstr = cmdstr.concat(`${cmdStr_Backwards} `);

    if (pdraw.orPixelVals === true)
      cmdstr = cmdstr.concat(`${cmdStr_CombinePixs} `);
  }
  else
  {
    let plugvalue = get(aEffectsFilter)[player.pluginIndex].id;
    cmdstr = cmdstr.concat(`${cmdStr_SetEffect}${plugvalue} `);
  }

  if (player.forceRandom)
    cmdstr = cmdstr.concat(`${cmdStr_TrigForce} `);
  else if (player.forceValue !== DEF_FORCE_VALUE)
    cmdstr = cmdstr.concat(`${cmdStr_TrigForce}${player.forceValue} `);

  if (player.trigAtStart)
    cmdstr = cmdstr.concat(`${cmdStr_TrigAtStart} `);

  if (player.trigFromMain)
    cmdstr = cmdstr.concat(`${cmdStr_TrigFromMain} `);

  if (player.trigOnLayer)
    cmdstr = cmdstr.concat(`${cmdStr_TrigByEffect}${player.trigDevIndex} `);

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
      if (strand.tracks[track].layers[layer].pluginBits & pluginBit_SENDFORCE)
      {
        let sourceid = strand.tracks[track].layers[layer].uniqueID;
        let index = strand.tracks[track].layers[layer].pluginIndex;
        let name = (layer === 0) ? get(aEffectsDraw)[index].text : get(aEffectsFilter)[index].text;

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
        let sourceid = strand.tracks[track].layers[layer].trigSourceID;
        let found = false;

        for (const [i, item] of slist.entries())
        {
          if (i > 0) // not <none>
          {
            if (item.sourceid === sourceid)
            {
              found = true;
              strand.tracks[track].layers[layer].trigSrcListDex = i;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigSrcListDex = i;

              strand.tracks[track].layers[layer].trigDevIndex = item.devindex;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDevIndex = item.devindex;

              //console.log(`update: devindex=${item.devindex} => ${item.track}:${item.layer}`); // DEBUG
            }
          }
        }

        if (!found)
        {
          console.warn(`Failed to find trigger source for: ${track}:${layer}`);
          console.log(`parse: ID=${sourceid}`)

          strand.tracks[track].layers[layer].trigOnLayer = false;
          strand.tracks[track].layers[layer].trigSrcListDex = 0;

          get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer = false;
          get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigSrcListDex = 0;
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
