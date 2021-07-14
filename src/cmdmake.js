import { get } from 'svelte/store';

import {
  overBits_DegreeHue   ,
  overBits_PcentWhite  ,
  overBits_PixCount    ,
  cmdStr_PcentStart    ,
  cmdStr_PcentLength   ,
  cmdStr_Effect        ,
  cmdStr_Bright        ,
  cmdStr_Delay         ,
  cmdStr_degreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Direction     ,
  cmdStr_OwritePixs    ,
  cmdStr_TrigLayer     ,
  cmdStr_TrigManual    ,
  cmdStr_TrigForce     ,
  cmdStr_TrigCount     ,
  cmdStr_TrigMinTime   ,
  cmdStr_TriggerRange  ,
  cmdStr_Go            
  } from './pixelnut.js';

import {
  pStrand,
  aEffectsDraw, aEffectsFilter,
  refreshCmdStr
} from './globals.js';
  
export const makeOrideBits = (p, track) =>
{
  let bits = 0;

  if (p.tracks[track].drawProps.overHue)
    bits |= overBits_DegreeHue;

  if (p.tracks[track].drawProps.overWhite)
    bits |= overBits_PcentWhite;

  if (p.tracks[track].drawProps.overCount)
    bits |= overBits_PixCount;

  return bits;
}
  
// calculate what pixelnut engine layerid is
export const makeLayerID = (track, layer) =>
{
  let layerid = 0;

  if (track >= get(pStrand).tactives)
  {
    console.error(`No track=${track+1}`);
    track = get(pStrand).tactives-1;
  }

  for (let i = 0; i < track; ++i)
    layerid += get(pStrand).tracks[i].lactives;

  if (layer >= get(pStrand).tracks[track].lactives)
  {
    console.error(`No layer=${layer+1}`);
    layer = get(pStrand).tracks[track].lactives-1;
  }

  return layerid + layer;
}

function combineAllCmdStrs()
{
  // combine all layers into single string
  let cmdstr = '';

  let strand = get(pStrand);
  for (let i = 0; i < strand.tactives; ++i)
  {
    let track = strand.tracks[i];
    for (let j = 0; j < track.lactives; ++j)
    {
      let layer = track.layers[j];
      cmdstr = cmdstr.concat(`${layer.cmdstr}`);

      console.log(`  ${i}:${j}: ${layer.cmdstr}`)
    }
  }

  cmdstr = cmdstr.concat(`${cmdStr_Go}`);
  get(pStrand).patternStr = cmdstr;

  refreshCmdStr.set(true); // hack to force refresh
}

// create partial command string for track/layer
export const makeLayerCmdStr = (track, layer) =>
{
  let player = get(pStrand).tracks[track].layers[layer];
  let cmdstr = '';

  if (player.pluginIndex > 0) // else not created yet
  {
    if (layer == 0) // drawing layer
    {
      let pdraw = get(pStrand).tracks[track].drawProps;
      let start = pdraw.pcentStart;
      let finish = pdraw.pcentFinish;
  
      if (start != 0)
        cmdstr = cmdstr.concat(`${cmdStr_PcentStart}${start} `);
  
      if (finish != 100)
      {
        let length = finish - start;
        cmdstr = cmdstr.concat(`${cmdStr_PcentLength}${length} `);
      }
  
      let plugvalue = get(aEffectsDraw)[player.pluginIndex].id;
      cmdstr = cmdstr.concat(`${cmdStr_Effect}${plugvalue} `);
  
      if (pdraw.pcentBright != 100)
        cmdstr = cmdstr.concat(`${cmdStr_Bright}${pdraw.pcentBright} `);
  
      if (pdraw.msecsDelay != 0)
        cmdstr = cmdstr.concat(`${cmdStr_Delay}${pdraw.msecsDelay} `);
  
      if (pdraw.degreeHue != 0)
        cmdstr = cmdstr.concat(`${cmdStr_degreeHue}${pdraw.degreeHue} `);
  
      if (pdraw.pcentWhite != 0)
        cmdstr = cmdstr.concat(`${cmdStr_PcentWhite}${pdraw.pcentWhite} `);
  
      if (pdraw.pcentCount != 0)
        cmdstr = cmdstr.concat(`${cmdStr_PcentCount}${pdraw.pcentCount} `);
  
      let bits = makeOrideBits(get(pStrand), track);
      if (bits != 0)
        cmdstr = cmdstr.concat(`${cmdStr_OrideBits}${bits} `);
  
      if (pdraw.reverseDir != false)
        cmdstr = cmdstr.concat(`${cmdStr_Direction}0 `);
  
      if (pdraw.orPixelValues != false)
        cmdstr = cmdstr.concat(`${cmdStr_OwritePixs}1 `);
    }
    else
    {
      let plugvalue = get(aEffectsFilter)[player.pluginIndex].id;
      cmdstr = cmdstr.concat(`${cmdStr_Effect}${plugvalue} `);
    }
  
    if (player.trigDoManual)
      cmdstr = cmdstr.concat(`${cmdStr_TrigManual} `);
  
    if (player.trigDoLayer)
    {
      let tracknum = player.trigTrackNum;
      let layernum = player.trigLayerNum;
      let tlayer = makeLayerID(tracknum-1, layernum-1);
      cmdstr = cmdstr.concat(`${cmdStr_TrigLayer}${tlayer} `);
    }
  
    if (!player.forceRandom)
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce}${player.forceValue} `);
  
    if (player.trigTypeStr == 'once')
      cmdstr = cmdstr.concat(`${cmdStr_TriggerRange} `);
  
    else if (player.trigTypeStr == 'auto')
    {
      if (player.trigDoRepeat)
        cmdstr = cmdstr.concat(`${cmdStr_TrigCount} `);
  
      else if (player.trigRepCount != 1)
        cmdstr = cmdstr.concat(`${cmdStr_TrigCount}${player.trigRepCount} `);
  
      if (player.trigDelayMin != 1)
        cmdstr = cmdstr.concat(`${cmdStr_TrigMinTime}${player.trigDelayMin} `);
  
      if (player.trigDelayRange != 0)
           cmdstr = cmdstr.concat(`${cmdStr_TriggerRange}${player.trigDelayRange} `);
      else cmdstr = cmdstr.concat(`${cmdStr_TriggerRange}$ `);
    }
  }
  
  //console.log(`${track}:${layer}: ${cmdstr}`)
  player.cmdstr = cmdstr;
}

// create partial command string for track/layer
// then combine all those into one single string
export const makeCmdStrs = (track, layer) =>
{
  makeLayerCmdStr(track, layer);
  combineAllCmdStrs();
}
