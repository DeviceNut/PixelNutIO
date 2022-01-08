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
  if (layer === undefined) layer = DRAW_LAYER;

  const enable = get(pStrand).tracks[track].layers[layer].trigAtStart;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigAtStart, (enable ? undefined : 0));
  // don't need to send value if enabling (1 is default)
}

export const userSetTrigMain = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const enable = get(pStrand).tracks[track].layers[layer].trigFromMain;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigFromMain, (enable ? undefined : 0));
  // don't need to send value if enabling (1 is default)
}

export const userSetTrigLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const enable = strand.tracks[track].layers[layer].trigOnLayerShow;
  const index = strand.tracks[track].layers[layer].trigSrcListDex;

  //console.log(`userSetTrigLayer: enable=${enable} index=${index}`);

  updateLayerVals(track, layer);

  if (!enable && (index > 0)) // if disabling and was selected then reset selection
  {
    // always reset selection when disable
    strand.tracks[track].layers[layer].trigSrcListDex = 0;
    sendLayerCmd(track, layer, cmdStr_TrigByEffect, undefined);
  }
}

// if this is called then trigOnLayerShow has already been enabled
export const userSetTrigSource = (track, layer) =>
{
  const strand = get(pStrand);
  const index = strand.tracks[track].layers[layer].trigSrcListDex;

  //console.log(`userSetTrigSource: index=${index}`);

  let devindex; // set to undefined, valid parm to sendLayerCmd()
  if (index > 0)
  {
    const item = strand.trigSources[index];
    //console.log(item);

    devindex = convTrackLayerToIndex(item.track, item.layer);
    if (devindex == null) return; // error pending

    strand.tracks[track].layers[layer].trigSrcLayerDex = devindex;

    const idval = strand.tracks[item.track].layers[item.layer].uniqueID;
    strand.tracks[track].layers[layer].trigSrcLayerID = idval;
  }

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigByEffect, devindex);
}

export const userSetTrigRepeat = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const trepeat = get(pStrand).tracks[track].layers[layer].trigDoRepeat;

  updateLayerVals(track, layer);

  if (trepeat)
  {
    let count;
    if (get(pStrand).tracks[track].layers[layer].trigForever) count = undefined;
    else count = get(pStrand).tracks[track].layers[layer].trigRepCount;

    sendLayerCmd(track, layer, cmdStr_TrigRepeating, count);
  }
  else sendLayerCmd(track, layer, cmdStr_TrigRepeating, 0); // disable
}

export const userSetTrigForever = (track, layer) =>
{
  const strand = get(pStrand);
  const forever = strand.tracks[track].layers[layer].trigForever;

  updateLayerVals(track, layer);

  if (get(pStrand).tracks[track].layers[layer].trigDoRepeat)
  {
    let count;
    if (forever) count = 0;
    else count = get(pStrand).tracks[track].layers[layer].trigRepCount;
    sendLayerCmd(track, layer, cmdStr_TrigRepeating, count);
  }
}

export const userSetTrigCount = (track, layer) =>
{
  const count = get(pStrand).tracks[track].layers[layer].trigRepCount;

  updateLayerVals(track, layer);

  if (get(pStrand).tracks[track].layers[layer].trigDoRepeat)
  {
    // assume forever is not set here
    sendLayerCmd(track, layer, cmdStr_TrigRepeating, count);
  }
}

export const userSetTrigOffset = (track, layer) =>
{
  const offset = get(pStrand).tracks[track].layers[layer].trigRepOffset;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigOffset, offset);
}

export const userSetTrigRange = (track, layer) =>
{
  const range = get(pStrand).tracks[track].layers[layer].trigRepRange;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigRange, range);
}

export const userSetForceType = (track, layer) =>
{
  const isrand = get(pStrand).tracks[track].layers[layer].forceRandom;

  const force = isrand ? undefined : get(pStrand).tracks[track].layers[layer].forceValue;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigForce, force);
}

export const userSetForceValue = (track, layer) =>
{
  const force = get(pStrand).tracks[track].layers[layer].forceValue;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigForce, force);
}
