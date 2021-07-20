import { get } from 'svelte/store';

import {
  DRAW_LAYER,
  MAX_FORCE,
  overBit_DegreeHue    ,
  overBit_PcentWhite   ,
  overBit_PcentCount   ,
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
  aEffectsDraw,
  aEffectsFilter,
  mainEnabled,
  bitsOverride,
  bitsEffects,
  refreshCmdStr
} from './globals.js';
  
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
  
// convert track,layer to device layerID
export const convTrackLayerToID = (track, layer) =>
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

// convert device layerID to track,layer object
export const getTrackLayerFromID = (layerid) =>
{
  let track = 0;

  for (let i = 0; i < get(pStrand).tactives; ++i)
  {
    if (layerid < get(pStrand).tracks[i].lactives)
      break;

    layerid -= get(pStrand).tracks[i].lactives;
    ++track;
  }

  return { track:track, layer:layerid };
}

// combine all layer cmds into command output string
export const makeEntireCmdStr = () =>
{
  // combine all layers into single string
  let cmdstr = '';
  let ridebits = 0;
  let splugbits = 0;

  let strand = get(pStrand);

  for (let i = 0; i < strand.tactives; ++i)
  {
    let track = strand.tracks[i];
    let drawplugin = false;
    let tplugbits = 0;

    let ismute = false; // DEBUG

    // must have effect and not be mute be enabled

    for (let j = 0; j < track.lactives; ++j)
    {
      let layer = track.layers[j];

      // must have effect and not be mute to get output
      // (note that draw layer does not have mute)
      if (j == DRAW_LAYER)
      {
        drawplugin = (layer.pluginIndex > 0) && !layer.mute;

        // must reset drawing bits to base effect bits before add in other layers
        layer.pluginBits = get(aEffectsDraw)[layer.pluginIndex].bits;
        tplugbits = layer.pluginBits;

        if (drawplugin)
        {
          cmdstr = cmdstr.concat(`${layer.cmdstr}`);
          ridebits |= makeOrideBits(strand, i);
          splugbits |= layer.pluginBits;
        }
        else ismute = true; // DEBUG
      }
      else if (drawplugin && (layer.pluginIndex > 0) && !layer.mute)
      {
        cmdstr = cmdstr.concat(`${layer.cmdstr}`);
        splugbits |= layer.pluginBits;
        tplugbits |= layer.pluginBits;
      }

      else ismute = true; // DEBUG
      console.log(`  ${i}:${j} ${layer.cmdstr} ${ismute?'*':''}`) // DEBUG
    }

    // drawing plugin bits includes bits from all layers
    track.layers[DRAW_LAYER].pluginBits = tplugbits;
  }

  if (cmdstr != '')
  {
    cmdstr = cmdstr.concat(`${cmdStr_Go}`);
    mainEnabled.set(true);
  }
  else mainEnabled.set(false);

  get(pStrand).patternStr = cmdstr;
  //get(pStrand).backupStr = cmdstr;

  bitsOverride.set(ridebits);
  bitsEffects.set(splugbits);
  //console.log(`pluginbits=${splugbits.toString(16)}`);

  refreshCmdStr.set(true); // hack to force refresh
}

// create partial command string for one layer in a track,
export const makeLayerCmdStr = (track, layer) =>
{
  let player = get(pStrand).tracks[track].layers[layer];
  let cmdstr = '';
  let plugvalue;

  if (layer == 0) // drawing layer
  {
    plugvalue = get(aEffectsDraw)[player.pluginIndex].id;
    if (plugvalue >= 0)
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

      cmdstr = cmdstr.concat(`${cmdStr_Effect}${plugvalue} `);

      if (pdraw.reverseDir != false)
        cmdstr = cmdstr.concat(`${cmdStr_Direction}0 `);

      if (pdraw.orPixelVals != false)
        cmdstr = cmdstr.concat(`${cmdStr_OwritePixs}1 `);

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
    }
  }
  else
  {
    plugvalue = get(aEffectsFilter)[player.pluginIndex].id;
    if (plugvalue >= 0) cmdstr = cmdstr.concat(`${cmdStr_Effect}${plugvalue} `);
  }

  if (plugvalue >= 0)
  {
    if (player.trigDoManual)
    cmdstr = cmdstr.concat(`${cmdStr_TrigManual} `);

    if (player.trigDoLayer)
    {
      let tracknum = player.trigTrackNum;
      let layernum = player.trigLayerNum;
      let tlayer = convTrackLayerToID(tracknum-1, layernum-1);
      cmdstr = cmdstr.concat(`${cmdStr_TrigLayer}${tlayer} `);
    }

    if (player.forceRandom)
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce} `);

    else if (player.forceValue != MAX_FORCE/2) // default
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce}${player.forceValue} `);

    if (player.trigTypeStr == 'auto')
    {
      if (!player.trigDoRepeat)
        cmdstr = cmdstr.concat(`${cmdStr_TrigCount}${player.trigRepCount} `);

      if (player.trigDelayMin != 1)
        cmdstr = cmdstr.concat(`${cmdStr_TrigMinTime}${player.trigDelayMin} `);

      cmdstr = cmdstr.concat(`${cmdStr_TriggerRange}${player.trigDelayRange} `);
    }
    else if (player.trigTypeStr == 'once')
    {
      cmdstr = cmdstr.concat(`${cmdStr_TriggerRange} `);
    }
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
