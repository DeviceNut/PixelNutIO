import { get } from 'svelte/store';

import {
  pStrand,
  findEffectFromIndex
} from './globals.js';

import {
  strandCopyTop,
  convTrackLayerToIndex,
} from './strands.js';

import {
  DRAW_LAYER            ,
  pluginBit_ORIDE_HUE   ,
  pluginBit_ORIDE_WHITE ,
  pluginBit_ORIDE_COUNT ,
  pluginBit_ORIDE_DELAY ,
  pluginBit_ORIDE_DIR   ,
  pluginBit_ORIDE_EXT   ,
  cmdStr_PullTrigger    ,
  cmdStr_OR_Bright      ,
  cmdStr_OR_Delay       ,
  cmdStr_OR_Props1      ,
  cmdStr_OR_Props2      ,
  cmdStr_SetOride       ,
  cmdStr_SetFirst       ,
  cmdStr_SelectEffect   ,
  cmdStr_PcentXoffset   ,
  cmdStr_PcentXlength   ,
  cmdStr_PcentBright    ,
  cmdStr_MsecsDelay     ,
  cmdStr_DegreeHue      ,
  cmdStr_PcentWhite     ,
  cmdStr_PcentCount     ,
  cmdStr_OrideBits      ,
  cmdStr_CombinePixs    ,
  cmdStr_Backwards      ,
  cmdStr_NoRepeating    ,
  cmdStr_TrigAtStart    ,
  cmdStr_TrigByEffect   ,
  cmdStr_TrigFromMain   ,
  cmdStr_TrigRepeating  ,
  cmdStr_TrigOffset     ,
  cmdStr_TrigRange      ,
  cmdStr_TrigForce
} from './devcmds.js';

import {
  makeOrideBits,
  updateLayerVals,
  updateAllTracks,
  updateTriggerLayers
} from './cmdmake.js';

import {
  sendStrandCmd,
  sendLayerCmd
} from './cmdsend.js';

///////////////////////////////////////////////////////////

export const resetEffectBits = (track, props, bits) =>
{
  //console.log(`Reset Effect: track=${track} bits=${bits.toString(16)}`);

  if (bits & pluginBit_ORIDE_HUE)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_DegreeHue, props.degreeHue);

  if (bits & pluginBit_ORIDE_WHITE)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentWhite, props.pcentWhite);

  if (bits & pluginBit_ORIDE_COUNT)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentCount, props.pcentCount);

  if (bits & pluginBit_ORIDE_DELAY)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_MsecsDelay, props.pcentDelay);

  if (bits & pluginBit_ORIDE_DIR)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_Backwards, props.dirBackwards ? 1 : undefined);

  if (bits & pluginBit_ORIDE_EXT)
  {
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentXoffset, props.pcentXoffset);
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentXlength, props.pcentXlength);
  }
}

// switch to new effect on this layer, specified by layer's pluginObj.index
export const userSetEffect = (track, layer) =>
{
  const strand = get(pStrand);
  const player = strand.tracks[track].layers[layer];

  //console.log(`seteffect: track=${track} layer=${layer} index: old=${pshadow.pluginObj.index} new=${player.pluginObj.index}`);

  {
    const pobj = findEffectFromIndex(player.pluginObj.filter, player.pluginObj.index);
    const before = player.pluginObj.bits;
    const after = pobj.bits;
    player.pluginObj = pobj;

    updateTriggerLayers();
    updateAllTracks();

    sendLayerCmd(track, layer, cmdStr_SelectEffect, `${pobj.id}`);

    const bits = before & ~after; // override bits being cleared
    const props = get(pStrand).tracks[track].drawProps;

    resetEffectBits(track, props, bits);
  }
}

export const userDoRestart = (track, layer) =>
{
  const pval = get(pStrand).tracks[track].layers[layer].pluginObj.id;
  sendLayerCmd(track, layer, cmdStr_SelectEffect, `${pval}`);
}

// Main Controls:

export const userSetBright = (track) =>
{
  if (track === undefined)
  {
    let bright = get(pStrand).pcentBright;

    strandCopyTop();
    sendStrandCmd(cmdStr_OR_Bright, bright);
  }
  else
  {
    const layer = DRAW_LAYER;
    const bright = get(pStrand).tracks[track].drawProps.pcentBright;

    updateLayerVals(track, layer);
    sendLayerCmd(track, layer, cmdStr_PcentBright, bright);
  }
}

export const userSetDelay = (track) =>
{
  if (track === undefined)
  {
    let delay = get(pStrand).pcentDelay;

    strandCopyTop();
    sendStrandCmd(cmdStr_OR_Delay, delay);
  }
  else
  {
    const layer = DRAW_LAYER;
    const delay = get(pStrand).tracks[track].drawProps.pcentDelay;

    updateLayerVals(track, layer);
    sendLayerCmd(track, layer, cmdStr_MsecsDelay, delay);
  }
}

export const userSetRotate = () =>
{
  const firstp = get(pStrand).pixelOffset;

  strandCopyTop();
  sendStrandCmd(cmdStr_SetFirst, firstp);
}

export const userSetOverMode = () =>
{
  const strand = get(pStrand);
  const oride = strand.doOverride;

  if (oride !== strand.doOrideSave)
  {
    strand.doOrideSave = oride;
    sendStrandCmd(cmdStr_SetOride, oride ? 1 : 0);

    if (!oride) // must resend any props that were overriden
    {
      for (let i = 0; i < get(pStrand).tactives; ++i)
      {
        let props = get(pStrand).tracks[i].drawProps;

        if (props.overHue)
          sendLayerCmd(i, DRAW_LAYER, cmdStr_DegreeHue, `${props.degreeHue}`);

        if (props.overWhite)
          sendLayerCmd(i, DRAW_LAYER, cmdStr_PcentWhite, `${props.pcentWhite}`);

        if (props.overCount)
          sendLayerCmd(i, DRAW_LAYER, cmdStr_PcentCount, `${props.pcentCount}`);
      }
    }
  }
}

export const userSetProps = () =>
{
  const strand = get(pStrand);

  let hue   = strand.degreeHue;
  let white = strand.pcentWhite;
  let count = strand.pcentCount;

  strandCopyTop();
  sendStrandCmd(cmdStr_OR_Props1, `${hue} ${white} ${count}${cmdStr_OR_Props2}`);
}

export const userSendTrigger = () =>
{
  sendStrandCmd(cmdStr_PullTrigger, get(pStrand).forceValue);
}

// Track Controls:

export const userSetOffset = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const offset = strand.tracks[track].drawProps.pcentXoffset;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_PcentXoffset, offset);
}

export const userSetLength = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const extent = strand.tracks[track].drawProps.pcentXlength;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_PcentXlength, extent);
}

export const userSetOrPixs = (track) =>
{
  const layer = DRAW_LAYER;
  const enable = get(pStrand).tracks[track].drawProps.orPixelVals;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_CombinePixs, (enable ? 1 : 0));
}

export const userSetBackwards = (track) =>
{
  const layer = DRAW_LAYER;
  const enable = get(pStrand).tracks[track].drawProps.dirBackwards;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_Backwards, (enable ? 1 : 0));
}

export const userSetNoRepeat = (track) =>
{
  const layer = DRAW_LAYER;
  const enable = get(pStrand).tracks[track].drawProps.noRepeating;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_NoRepeating, (enable ? 1 : 0));
}

// Track Properties:

export const userSetHue = (track) =>
{
  const layer = DRAW_LAYER;
  const hue = get(pStrand).tracks[track].drawProps.degreeHue;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_DegreeHue, `${hue}`);
}

export const userSetWhite = (track) =>
{
  const layer = DRAW_LAYER;
  const white = get(pStrand).tracks[track].drawProps.pcentWhite;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_PcentWhite, `${white}`);
}

export const userSetCount = (track) =>
{
  const layer = DRAW_LAYER;
  const count = get(pStrand).tracks[track].drawProps.pcentCount;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_PcentCount, `${count}`);
}

export const userSetOverrides = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const bits = makeOrideBits(strand, track);
  const props = strand.tracks[track].drawProps;

  updateLayerVals(track, layer);

  sendLayerCmd(track, layer, cmdStr_OrideBits, bits);

  if (!props.overHue)
        sendLayerCmd(track, layer, cmdStr_DegreeHue, `${props.degreeHue}`);
  else sendLayerCmd(track, layer, cmdStr_DegreeHue, `${strand.degreeHue}`);

  if (!props.overWhite)
        sendLayerCmd(track, layer, cmdStr_PcentWhite, `${props.pcentWhite}`);
  else sendLayerCmd(track, layer, cmdStr_PcentWhite, `${strand.pcentWhite}`);

  if (!props.overCount)
        sendLayerCmd(track, layer, cmdStr_PcentCount, `${props.pcentCount}`);
  else sendLayerCmd(track, layer, cmdStr_PcentCount, `${strand.pcentCount}`);
}

// Trigger Settings:

export const userSetTrigStart = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const dostart = get(pStrand).tracks[track].layers[layer].trigAtStart;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigAtStart, (dostart ? undefined : 0));
  // don't need to send value if enabling (1 is default)
}

export const userSetTrigMain = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const domain = get(pStrand).tracks[track].layers[layer].trigFromMain;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_TrigFromMain, (domain ? undefined : 0));
  // don't need to send value if enabling (1 is default)
}

export const userSetTrigLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const enable = strand.tracks[track].layers[layer].trigOnLayer;
  const index = strand.tracks[track].layers[layer].trigSrcListDex;

  //console.log(`triglayer: enable=${enable} index=${index}`);

  if (!enable && (index > 0)) // if disabling and was selected then reset selection
  {
    // always reset selection when disable
    strand.tracks[track].layers[layer].trigSrcListDex = 0;

    updateLayerVals(track, layer);
    sendLayerCmd(track, layer, cmdStr_TrigByEffect, undefined); // disable in device
  }
}

// if this is called then onLayer has already been enabled
export const userSetTrigSource = (track, layer) =>
{
  const strand = get(pStrand);
  const index = strand.tracks[track].layers[layer].trigSrcListDex;

  //console.log(`trigsource: index=${index}`);

  updateLayerVals(track, layer);

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
