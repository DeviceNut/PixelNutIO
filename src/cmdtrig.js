import { get } from 'svelte/store';

import { pStrand } from './globals.js';
import { convTrackLayerToIndex } from './strands.js';

import {
  DRAW_LAYER,
  cmdStr_TrigAtStart,
  cmdStr_TrigByEffect,
  cmdStr_TrigFromMain,
  cmdStr_TrigRepeating,
  cmdStr_TrigOffset,
  cmdStr_TrigRange,
  cmdStr_TrigForce
} from './devcmds.js';

import { updateLayerVals } from './cmdmake.js';
import { sendLayerCmd } from './cmdsend.js';

///////////////////////////////////////////////////////////

export const userSetTrigStart = (track, layer) =>
{
  updateLayerVals(track, layer);

  const enable = get(pStrand).tracks[track].layers[layer].trigAtStart;
  sendLayerCmd(track, layer, cmdStr_TrigAtStart, (enable ? undefined : 0));
  // don't need to send value if enabling (1 is default)
}

export const userSetTrigMain = (track, layer) =>
{
  updateLayerVals(track, layer);

  const enable = get(pStrand).tracks[track].layers[layer].trigFromMain;
  sendLayerCmd(track, layer, cmdStr_TrigFromMain, (enable ? undefined : 0));
  // don't need to send value if enabling (1 is default)
}

export const userSetTrigLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const player = get(pStrand).tracks[track].layers[layer];

  const enable = player.trigOnLayerShow;
  const index = player.trigSrcListDex;

  //console.log(`userSetTrigLayer: enable=${enable} index=${index}`);

  updateLayerVals(track, layer);

  if (!enable && (index > 0)) // if disabling and was selected then reset selection
  {
    // always reset selection when disable
    player.trigSrcListDex = 0;
    sendLayerCmd(track, layer, cmdStr_TrigByEffect, undefined);
  }
}

// if this is called then trigOnLayerShow has already been enabled
export const userSetTrigSource = (track, layer) =>
{
  const strand = get(pStrand);
  const player = get(pStrand).tracks[track].layers[layer];

  const index = player.trigSrcListDex;

  //console.log(`userSetTrigSource: index=${index}`);

  let devindex; // set to undefined, valid parm to sendLayerCmd()
  if (index > 0)
  {
    const item = strand.trigSources[index];
    //console.log(item);

    devindex = convTrackLayerToIndex(item.track, item.layer);
    if (devindex == null) return; // error pending

    player.trigSrcLayerDex = devindex;
    player.trigSrcLayerID = strand.tracks[item.track].layers[item.layer].uniqueID;
  }

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigByEffect, devindex);
}

export const userSetTrigRepeat = (track, layer) =>
{
  updateLayerVals(track, layer);

  const player = get(pStrand).tracks[track].layers[layer];

  if (player.trigDoRepeat)
       sendLayerCmd(track, layer, cmdStr_TrigRepeating, player.trigForever ? undefined : player.trigRepCount);
  else sendLayerCmd(track, layer, cmdStr_TrigRepeating, 0); // disable
}

export const userSetTrigForever = (track, layer) =>
{
  updateLayerVals(track, layer);

  const player = get(pStrand).tracks[track].layers[layer];
  sendLayerCmd(track, layer, cmdStr_TrigRepeating, player.trigForever ? undefined : player.trigRepCount);
}

// assume forever is not set here
export const userSetTrigCount = (track, layer) =>
{
  updateLayerVals(track, layer);

  const count = get(pStrand).tracks[track].layers[layer].trigRepCount;
  sendLayerCmd(track, layer, cmdStr_TrigRepeating, count);
}

export const userSetTrigOffset = (track, layer) =>
{
  updateLayerVals(track, layer);

  const offset = get(pStrand).tracks[track].layers[layer].trigRepOffset;
  sendLayerCmd(track, layer, cmdStr_TrigOffset, offset);
}

export const userSetTrigRange = (track, layer) =>
{
  updateLayerVals(track, layer);

  const range = get(pStrand).tracks[track].layers[layer].trigRepRange;
  sendLayerCmd(track, layer, cmdStr_TrigRange, range);
}

export const userSetForceType = (track, layer) =>
{
  updateLayerVals(track, layer);

  const player = get(pStrand).tracks[track].layers[layer];
  sendLayerCmd(track, layer, cmdStr_TrigForce, player.forceRandom ? undefined : player.forceValue);
}

export const userSetForceValue = (track, layer) =>
{
  updateLayerVals(track, layer);

  const force = get(pStrand).tracks[track].layers[layer].forceValue;
  sendLayerCmd(track, layer, cmdStr_TrigForce, force);
}
