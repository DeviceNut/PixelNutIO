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
  cmdStr_PcentBright   ,
  cmdStr_MsecsDelay    ,
  cmdStr_DegreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Direction     ,
  cmdStr_OwritePixs    ,
  cmdStr_TrigFromLayer ,
  cmdStr_TrigFromMain  ,
  cmdStr_TrigForce     ,
  cmdStr_TrigCount     ,
  cmdStr_TrigMinTime   ,
  cmdStr_TriggerRange  ,
  cmdStr_Go            
  } from './pixcmds.js';

import {
  pStrand,
  aEffectsDraw,
  aEffectsFilter,
  aTriggers
} from './globals.js';
  
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
  
// convert track,layer to device layerID
export const convTrackLayerToID = (track, layer) =>
{
  let layerid = 0;
  let strand = get(pStrand);

  if (track >= strand.tactives)
  {
    console.error(`No track=${track+1}`);
    track = get(pStrand).tactives-1;
  }

  if (layer >= strand.tracks[track].lactives)
  {
    console.error(`No layer=${layer+1}`);
    layer = strand.tracks[track].lactives-1;
  }

  for (let i = 0; i < track; ++i)
  {
    for (let j = 0; j < strand.tracks[i].lactives; ++j)
    {
      if ((strand.tracks[i].layers[j].pluginIndex > 0) &&
          !strand.tracks[i].layers[j].mute)
        ++layerid
    }
  }
  for (let j = 0; j < layer; ++j)
  {
    if ((strand.tracks[track].layers[j].pluginIndex > 0) &&
        !strand.tracks[track].layers[j].mute)
      ++layerid
  }

  //console.log('conv: ', track, layer, ' => ', layerid); // DEBUG
  return layerid;
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

    //let ismute = false; // DEBUG

    // must have effect and not be mute be enabled

    for (let j = 0; j < track.lactives; ++j)
    {
      let layer = track.layers[j];

      // must have effect and not be mute to get output
      // (note that draw layer does not have mute)
      if (j === DRAW_LAYER)
      {
        drawplugin = (layer.pluginIndex > 0) && !layer.mute;
        tplugbits |= layer.pluginBits;

        if (drawplugin)
        {
          cmdstr = cmdstr.concat(`${layer.cmdstr}`);
          ridebits |= makeOrideBits(strand, i);
          splugbits |= layer.pluginBits;
        }
        //else ismute = true; // DEBUG
      }
      else if (drawplugin && (layer.pluginIndex > 0) && !layer.mute)
      {
        cmdstr = cmdstr.concat(`${layer.cmdstr}`);
        splugbits |= layer.pluginBits;
        tplugbits |= layer.pluginBits;
      }

      //else ismute = true; // DEBUG
      //console.log(`  ${i}:${j} ${layer.cmdstr} ${ismute?'*':''}`) // DEBUG
    }

    // track plugin bits includes bits from all layers
    track.trackBits = tplugbits;
  }

  if (cmdstr !== '') cmdstr = cmdstr.concat(`${cmdStr_Go}`);

  get(pStrand).curPatternStr = cmdstr;
  get(pStrand).bitsOverride = ridebits;
  get(pStrand).bitsEffects = splugbits;

  //console.log(`oridebits=${ridebits.toString(16)}`); // DEBUG
  //console.log(`splugbits=${splugbits.toString(16)}`); // DEBUG

  pStrand.set(get(pStrand)); // triggers update to UI - MUST HAVE THIS
}

// create partial command string for one layer in a track
export const makeLayerCmdStr = (track, layer) =>
{
  let player = get(pStrand).tracks[track].layers[layer];
  let cmdstr = '';

  if (player.pluginIndex > 0)
  {
    if (layer === 0) // drawing layer
    {
      let plugvalue = get(aEffectsDraw)[player.pluginIndex].id;
      let pdraw = get(pStrand).tracks[track].drawProps;
      let start = pdraw.pcentStart;
      let finish = pdraw.pcentFinish;

      if (start !== 0)
        cmdstr = cmdstr.concat(`${cmdStr_PcentStart}${start} `);

      if (finish !== 100)
      {
        let length = finish - start;
        cmdstr = cmdstr.concat(`${cmdStr_PcentLength}${length} `);
      }

      cmdstr = cmdstr.concat(`${cmdStr_Effect}${plugvalue} `);

      if (pdraw.reverseDir !== false)
        cmdstr = cmdstr.concat(`${cmdStr_Direction}0 `);

      if (pdraw.orPixelVals !== false)
        cmdstr = cmdstr.concat(`${cmdStr_OwritePixs}1 `);

      if (pdraw.pcentBright !== 100)
        cmdstr = cmdstr.concat(`${cmdStr_PcentBright}${pdraw.pcentBright} `);

      if (pdraw.msecsDelay !== 0)
        cmdstr = cmdstr.concat(`${cmdStr_MsecsDelay}${pdraw.msecsDelay} `);

      if (pdraw.degreeHue !== 0)
        cmdstr = cmdstr.concat(`${cmdStr_DegreeHue}${pdraw.degreeHue} `);

      if (pdraw.pcentWhite !== 0)
        cmdstr = cmdstr.concat(`${cmdStr_PcentWhite}${pdraw.pcentWhite} `);

      if (pdraw.pcentCount !== 0)
        cmdstr = cmdstr.concat(`${cmdStr_PcentCount}${pdraw.pcentCount} `);

      let bits = makeOrideBits(get(pStrand), track);
      if (bits !== 0)
        cmdstr = cmdstr.concat(`${cmdStr_OrideBits}${bits} `);
    }
    else
    {
      let plugvalue = get(aEffectsFilter)[player.pluginIndex].id;
      cmdstr = cmdstr.concat(`${cmdStr_Effect}${plugvalue} `);
    }

    if (player.trigFromMain)
    cmdstr = cmdstr.concat(`${cmdStr_TrigFromMain} `);

    if (player.trigDoLayer)
    {
      let tracknum = player.trigTrackNum;
      let layernum = player.trigLayerNum;
      let tlayer = convTrackLayerToID(tracknum-1, layernum-1);
      cmdstr = cmdstr.concat(`${cmdStr_TrigFromLayer}${tlayer} `);
    }

    if (player.forceRandom)
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce} `);

    else if (player.forceValue !== MAX_FORCE/2) // default
      cmdstr = cmdstr.concat(`${cmdStr_TrigForce}${player.forceValue} `);

    if (player.trigTypeStr === 'auto')
    {
      if (!player.trigDoRepeat)
        cmdstr = cmdstr.concat(`${cmdStr_TrigCount}${player.trigRepCount} `);

      if (player.trigDelayMin !== 1)
        cmdstr = cmdstr.concat(`${cmdStr_TrigMinTime}${player.trigDelayMin} `);

      cmdstr = cmdstr.concat(`${cmdStr_TriggerRange}${player.trigDelayRange} `);
    }
    else if (player.trigTypeStr === 'once')
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

export const makeTrigSourceList = () =>
{
  let strand = get(pStrand);
  let items = [];
  let count = 0;

  // create list of track/layers that send triggers
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      if (strand.tracks[track].layers[layer].pluginBits & pluginBit_SENDFORCE)
      {
        let index = strand.tracks[track].layers[layer].pluginIndex;
        let name = (layer === 0) ? get(aEffectsDraw)[index].text : get(aEffectsFilter)[index].text;

        ++count;
        items.push({ id: `${count}`, tnum:track+1, lnum:layer+1, 
                     text: `Track(${track+1}) Layer(${layer+1}) - ${name}` });
      } 
    }
  }
  if (count === 0) items.push({ id: 0, text: 'none'});

  aTriggers.set(items);
}
