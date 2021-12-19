import { get } from 'svelte/store';

import {
  idStrand,
  pStrand,
  dStrands,
} from './globals.js';

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
  cmdStr_Backwards      ,
  cmdStr_CombinePixs    ,
  cmdStr_TrigAtStart    ,
  cmdStr_TrigByEffect   ,
  cmdStr_TrigFromMain   ,
  cmdStr_TrigRepeating  ,
  cmdStr_TrigOffset     ,
  cmdStr_TrigRange      ,
  cmdStr_TrigForce      ,
  cmdStr_Go
} from './devcmds.js';

import {
  strandCopyTop,
  convTrackLayerToIndex,
} from './strands.js';

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

// send command (and optional value) to specific layer
export const userSendToLayer = (track, layer, cmdstr, cmdval) =>
{
  let devindex = convTrackLayerToIndex(track, layer);
  if (devindex == null) return; // error pending

  sendLayerCmd(devindex, cmdstr, cmdval);
}

function updateTrackOverrides(track, bits)
{
  const props = get(pStrand).tracks[track].drawProps;

  if (bits & pluginBit_ORIDE_HUE)
    userSendToLayer(track, DRAW_LAYER, cmdStr_DegreeHue, props.degreeHue);

  if (bits & pluginBit_ORIDE_WHITE)
    userSendToLayer(track, DRAW_LAYER, cmdStr_PcentWhite, props.pcentWhite);

  if (bits & pluginBit_ORIDE_COUNT)
    userSendToLayer(track, DRAW_LAYER, cmdStr_PcentCount, props.pcentCount);

  if (bits & pluginBit_ORIDE_DELAY)
    userSendToLayer(track, DRAW_LAYER, cmdStr_MsecsDelay, props.pcentDelay);

  if (bits & pluginBit_ORIDE_DIR)
    userSendToLayer(track, DRAW_LAYER, cmdStr_Backwards, props.dirBackwards);

  if (bits & pluginBit_ORIDE_EXT)
  {
    userSendToLayer(track, DRAW_LAYER, cmdStr_PcentXoffset, props.pcentXoffset);
    userSendToLayer(track, DRAW_LAYER, cmdStr_PcentXlength, props.pcentXlength);
  }
}

export const userSetEffect = (track, layer, elist) =>
{
  const strand = get(pStrand);
  const pindex = strand.tracks[track].layers[layer].pluginIndex;
  const prevstr = strand.tracks[track].layers[layer].cmdstr;
  const lshadow = get(dStrands)[get(idStrand)].tracks[track].layers[layer];

  if ((prevstr == '') || (lshadow.pluginIndex !== pindex))
  {
    const before = elist[lshadow.pluginIndex].bits;
    lshadow.pluginIndex = pindex;

    const after = elist[pindex].bits;
    strand.tracks[track].layers[layer].pluginBits = after;
    lshadow.pluginBits = after;

    updateTriggerLayers(); // update trigger sources
    updateAllTracks();     // recreate all tracks

    if (prevstr == '') // if no previous effect: create new effect
    {
      sendStrandCmd(strand.tracks[track].layers[layer].cmdstr);
      sendStrandCmd(cmdStr_Go);
    }
    else // else switch to new effect on this layer
    {
      let devindex = convTrackLayerToIndex(track, layer);
      if (devindex == null) return; // error pending

      sendLayerCmd(devindex, cmdStr_SelectEffect, `${elist[pindex].id}`);
    }

    const bits = before & ~after; // override bits being cleared
    updateTrackOverrides(track, bits);
  }
}

export const userDoRestart = (track, layer, elist) =>
{
  let devindex = convTrackLayerToIndex(track, layer);
  if (devindex == null) return; // error pending

  const pindex = get(pStrand).tracks[track].layers[layer].pluginIndex;
  const pval = elist[pindex].id;

  sendLayerCmd(devindex, cmdStr_SelectEffect, `${pval}`);
}


export const userSetOrPixs = (track) =>
{
  const layer = DRAW_LAYER;
  const enable = get(pStrand).tracks[track].drawProps.orPixelVals;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals !== enable)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals = enable;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_CombinePixs, (enable ? 1 : 0));
  }
}

// Main Controls:

export const userSetBright = (track) =>
{
  if (track === undefined)
  {
    let bright = get(pStrand).pcentBright;
    if (get(dStrands)[get(idStrand)].pcentBright !== bright)
    {
      get(dStrands)[get(idStrand)].pcentBright = bright;

      strandCopyTop();
      sendStrandCmd(cmdStr_OR_Bright, bright);
    }
  }
  else
  {
    const layer = DRAW_LAYER;
    const bright = get(pStrand).tracks[track].drawProps.pcentBright;

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright !== bright)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright = bright;

      updateLayerVals(track, layer);
      userSendToLayer(track, layer, cmdStr_PcentBright, bright);
    }
  }
}

export const userSetDelay = (track) =>
{
  if (track === undefined)
  {
    let delay = get(pStrand).pcentDelay;
    if (get(dStrands)[get(idStrand)].pcentDelay !== delay)
    {
      get(dStrands)[get(idStrand)].pcentDelay = delay;

      strandCopyTop();
      sendStrandCmd(cmdStr_OR_Delay, delay);
    }
  }
  else
  {
    const layer = DRAW_LAYER;
    const delay = get(pStrand).tracks[track].drawProps.pcentDelay;

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentDelay !== delay)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentDelay = delay;

      updateLayerVals(track, layer);
      userSendToLayer(track, layer, cmdStr_MsecsDelay, delay);
    }
  }
}

export const userSetRotate = () =>
{
  const firstp = get(pStrand).pixelOffset;

  if (get(dStrands)[get(idStrand)].pixelOffset !== firstp)
  {
    get(dStrands)[get(idStrand)].pixelOffset = firstp;

    strandCopyTop();
    sendStrandCmd(cmdStr_SetFirst, firstp);
  }
}

export const userSetOverMode = () =>
{
  const oride = get(pStrand).doOverride;

  if (get(dStrands)[get(idStrand)].doOverride !== oride)
  {
    get(dStrands)[get(idStrand)].doOverride = oride;

    sendStrandCmd(cmdStr_SetOride, oride ? 1 : 0);
    if (!oride) // must resend any props that were overriden
    {
      for (let i = 0; i < get(pStrand).tactives; ++i)
      {
        let props = get(pStrand).tracks[i].drawProps;

        if (props.overHue)
          userSendToLayer(i, DRAW_LAYER, cmdStr_DegreeHue, `${props.degreeHue}`);

        if (props.overWhite)
          userSendToLayer(i, DRAW_LAYER, cmdStr_PcentWhite, `${props.pcentWhite}`);

        if (props.overCount)
          userSendToLayer(i, DRAW_LAYER, cmdStr_PcentCount, `${props.pcentCount}`);
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

  if ((get(dStrands)[get(idStrand)].degreeHue  !== hue)   ||
      (get(dStrands)[get(idStrand)].pcentWhite !== white) ||
      (get(dStrands)[get(idStrand)].pcentCount !== count))
  {
    get(dStrands)[get(idStrand)].degreeHue  = hue;
    get(dStrands)[get(idStrand)].pcentWhite = white;
    get(dStrands)[get(idStrand)].pcentCount = count;

    strandCopyTop();
    sendStrandCmd(cmdStr_OR_Props1, `${hue} ${white} ${count}${cmdStr_OR_Props2}`);
  }
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

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXoffset !== offset)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXoffset = offset;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_PcentXoffset, offset);
  }
}

export const userSetLength = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const extent = strand.tracks[track].drawProps.pcentXlength;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXlength !== extent)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXlength = extent;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_PcentXlength, extent);
  }
}

export const userSetBackwards = (track) =>
{
  const layer = DRAW_LAYER;
  const enable = get(pStrand).tracks[track].drawProps.dirBackwards;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.dirBackwards !== enable)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.dirBackwards = enable;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_Backwards, (enable ? 1 : 0));
  }
}

// Track Properties:

export const userSetHue = (track) =>
{
  const layer = DRAW_LAYER;
  const hue = get(pStrand).tracks[track].drawProps.degreeHue;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.degreeHue !== hue)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.degreeHue = hue;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_DegreeHue, `${hue}`);
  }
}

export const userSetWhite = (track) =>
{
  const layer = DRAW_LAYER;
  const white = get(pStrand).tracks[track].drawProps.pcentWhite;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentWhite !== white)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentWhite = white;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_PcentWhite, `${white}`);
  }
}

export const userSetCount = (track) =>
{
  const layer = DRAW_LAYER;
  const count = get(pStrand).tracks[track].drawProps.pcentCount;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentCount !== count)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentCount = count;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_PcentCount, `${count}`);
  }
}

export const userSetOverrides = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const bits = makeOrideBits(strand, track);
  const props = strand.tracks[track].drawProps;

  if (makeOrideBits(get(dStrands)[get(idStrand)], track) !== bits)
  {
    updateLayerVals(track, layer);
  
    userSendToLayer(track, layer, cmdStr_OrideBits, bits);

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.overHue !== props.overHue)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.overHue = props.overHue;
      if (!props.overHue)
           userSendToLayer(track, layer, cmdStr_DegreeHue, `${props.degreeHue}`);
      else userSendToLayer(track, layer, cmdStr_DegreeHue, `${strand.degreeHue}`);
    }

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.overWhite !== props.overWhite)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.overWhite = props.overWhite;
      if (!props.overWhite)
           userSendToLayer(track, layer, cmdStr_PcentWhite, `${props.pcentWhite}`);
      else userSendToLayer(track, layer, cmdStr_PcentWhite, `${strand.pcentWhite}`);
    }

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.overCount !== props.overCount)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.overCount = props.overCount;
      if (!props.overCount)
           userSendToLayer(track, layer, cmdStr_PcentCount, `${props.pcentCount}`);
      else userSendToLayer(track, layer, cmdStr_PcentCount, `${strand.pcentCount}`);
    }
  }
}

// Trigger Settings:

export const userSetTrigStart = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const dostart = get(pStrand).tracks[track].layers[layer].trigAtStart;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAtStart !== dostart)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAtStart = dostart;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigAtStart, (dostart ? undefined : 0));
    // don't need to send value if enabling (1 is default)
  }
}

export const userSetTrigMain = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const domain = get(pStrand).tracks[track].layers[layer].trigFromMain;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigFromMain !== domain)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigFromMain = domain;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigFromMain, (domain ? undefined : 0));
    // don't need to send value if enabling (1 is default)
  }
}

export const userSetTrigLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const enable = strand.tracks[track].layers[layer].trigOnLayer;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer !== enable)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer = enable;

    updateLayerVals(track, layer);

    let devindex; // set to undefined, valid parm to userSendToLayer()
    if (enable && (strand.tracks[track].layers[layer].trigSourceDex > 0))
      devindex = strand.tracks[track].layers[layer].trigDevIndex;

    userSendToLayer(track, layer, cmdStr_TrigByEffect, devindex);
  }
}

// if this is called then onLayer has already been enabled
export const userSetTrigSource = (track, layer) =>
{
  const strand = get(pStrand);
  const index = strand.tracks[track].layers[layer].trigSourceDex;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigSourceDex !== index)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigSourceDex = index;

    updateLayerVals(track, layer);

    let devindex; // set to undefined, valid parm to userSendToLayer()
    if (index > 0)
    {
      const item = strand.trigSources[index];

      const devindex = convTrackLayerToIndex(item.track, item.layer);
      if (devindex == null) return; // error pending

      strand.tracks[track].layers[layer].trigDevIndex = devindex;

      const idval = strand.tracks[item.track].layers[item.layer].uniqueID;
      strand.tracks[track].layers[layer].trigSourceID = idval;
    }

    userSendToLayer(track, layer, cmdStr_TrigByEffect, devindex);
  }
}

export const userSetTrigRepeat = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const trepeat = get(pStrand).tracks[track].layers[layer].trigDoRepeat;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat !== trepeat)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = trepeat;

    updateLayerVals(track, layer);

    if (trepeat)
    {
      let count;
      if (get(pStrand).tracks[track].layers[layer].trigForever) count = undefined;
      else count = get(pStrand).tracks[track].layers[layer].trigRepCount;
      userSendToLayer(track, layer, cmdStr_TrigRepeating, count);
    }
    else userSendToLayer(track, layer, cmdStr_TrigRepeating, 0); // disable
  }
}

export const userSetTrigForever = (track, layer) =>
{
  const strand = get(pStrand);
  const forever = strand.tracks[track].layers[layer].trigForever;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigForever !== forever)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigForever = forever;

    updateLayerVals(track, layer);

    if (get(pStrand).tracks[track].layers[layer].trigDoRepeat)
    {
      let count;
      if (forever) count = 0;
      else count = get(pStrand).tracks[track].layers[layer].trigRepCount;
      userSendToLayer(track, layer, cmdStr_TrigRepeating, count);
    }
  }
}

export const userSetTrigCount = (track, layer) =>
{
  const count = get(pStrand).tracks[track].layers[layer].trigRepCount;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount !== count)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount = count;

    updateLayerVals(track, layer);

    if (get(pStrand).tracks[track].layers[layer].trigDoRepeat)
    {
      // assume forever is not set here
      userSendToLayer(track, layer, cmdStr_TrigRepeating, count);
    }
  }
}

export const userSetTrigOffset = (track, layer) =>
{
  const offset = get(pStrand).tracks[track].layers[layer].trigRepOffset;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepOffset !== offset)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepOffset = offset;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigOffset, offset);
  }
}

export const userSetTrigRange = (track, layer) =>
{
  const range = get(pStrand).tracks[track].layers[layer].trigRepRange;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepRange !== range)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepRange = range;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigRange, range);
  }
}

export const userSetForceType = (track, layer) =>
{
  const isrand = get(pStrand).tracks[track].layers[layer].forceRandom;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom !== isrand)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom = isrand;

    const force = isrand ? undefined : get(pStrand).tracks[track].layers[layer].forceValue;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigForce, force);
  }
}

export const userSetForceValue = (track, layer) =>
{
  const force = get(pStrand).tracks[track].layers[layer].forceValue;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceValue !== force)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceValue = force;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigForce, force);
  }
}
