import { get } from 'svelte/store';

import {
  curDevice,
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  eStrands,
  dStrands,
  aCurListPats
} from './globals.js';

import {
  DRAW_LAYER,
  MAX_BYTE_VALUE,
  cmdStr_PullTrigger   ,
  cmdStr_DeviceName    ,
  cmdStr_Pause         ,
  cmdStr_Resume        ,
  cmdStr_PcentOffset   ,
  cmdStr_PcentExtent   ,
  cmdStr_OR_Bright     ,
  cmdStr_OR_Delay      ,
  cmdStr_OR_Props      ,
  cmdStr_SetXmode      ,
  cmdStr_SetFirst      ,
  cmdStr_PcentBright   ,
  cmdStr_MsecsDelay    ,
  cmdStr_DegreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Direction     ,
  cmdStr_OwritePixs    ,
  cmdStr_TrigForce     ,
  cmdStr_TrigCount     ,
  cmdStr_TrigMinTime   ,
  cmdStr_TrigRangeTime ,
  cmdStr_TrigFromLayer ,
  cmdStr_TrigFromMain  ,
  cmdStr_TrigAtStart   ,
} from './pixcmds.js';

import {
  strandClearAll,
  strandCopyAll,
  strandCopyTop
} from './strands.js';

import {
  convTrackLayerToID,
  makeOrideBits,
  makeEntireCmdStr,
  updateLayerVals,
  updateAllTracks,
  updateTriggerLayers
} from './cmdmake.js';

import {
  sendCmdToDevice,
  sendStrandCmd,
  sendEntirePattern,
  sendPatternToStrand,
  sendStrandSwitch,
  sendLayerCmd
} from './cmdsend.js';

import { parsePattern } from './cmdparse.js';

///////////////////////////////////////////////////////////

export const userSetDevname = (devname) =>
{
  const device = get(curDevice);
  if (device !== null)
  {
    if (devname !== device.curname)
    {
      if (!/[`,/\\]/.test(devname))
      {
        device.newname = devname;
        sendCmdToDevice(cmdStr_DeviceName.concat(devname));
        return true;
      }
      else return false;
    }
  }

  return true;
}

export const userSendPause = (enable) =>
{
  sendStrandCmd(enable ? cmdStr_Pause : cmdStr_Resume);
}

// send command (and optional value) to specific layer
// ignore if the drawing layer for this layer is not active yet
export const userSendToLayer = (track, layer, cmdstr, cmdval) =>
{
  const strand = get(pStrand);
  const pindex = strand.tracks[track].layers[DRAW_LAYER].pluginIndex;

  if (pindex > 0)
  {
    let layerid = convTrackLayerToID(track, layer);
    sendLayerCmd(layerid, cmdstr, cmdval);
  }
}

export const userStrandCombine = (combine) =>
{
  if (!combine) // user turned off combine
  {
    // must disable all but the current one
    for (let i = 0; i < get(nStrands); ++i)
    {
      if (i === get(idStrand))
      {
        get(aStrands)[i].selected = true;
        get(eStrands)[i] = true;
      }
      else
      {
        get(aStrands)[i].selected = false;
        get(eStrands)[i] = false;
      }
    }

    aStrands.set(get(aStrands)); // triggers update
  }
}

export const userStrandSelect = (combine) =>
{
  let cur = get(idStrand);
  for (let s = 0; s < get(nStrands); ++s)
  {
    let wason = get(eStrands)[s];
    let nowon = get(aStrands)[s].selected;

    if (wason !== nowon)
    {
      if (nowon && !combine && (s !== cur))
      {
        // user selected a different strand
        get(aStrands)[cur].selected = false;
        idStrand.set(s);
        pStrand.set(get(aStrands)[s]);
        sendStrandSwitch(s);
        get(eStrands)[cur] = false;
        get(eStrands)[s] = true;
      }
      else if (nowon && combine && (s !== cur))
      {
        get(eStrands)[cur] = true;
        strandCopyAll();

        // mirror current strand by sending current pattern to newly selected strand
        sendPatternToStrand(s);
      }
      else if (!nowon && combine && (s === cur))
      {
        // disabled the current strand, so set to first enabled one
        for (let ss = 0; ss < get(nStrands); ++ss)
        {
          if (get(aStrands)[ss].selected)
          {
            idStrand.set(s);
            pStrand.set(get(aStrands)[s]);
            sendStrandSwitch(ss);
            break;
          }
        }
        get(eStrands)[s] = false;
      }
      else if (nowon && (s === cur))
      {
        // must resend entire current pattern
        // after having all strands disabled
        sendPatternToStrand(s);
      }
      else
      {
        // else just update current enables, but do nothing
        // when just disabling one when others still enabled
        get(eStrands)[s] = get(aStrands)[s].selected;
      }
    }
  }
}

// user just selected pattern to use
// return false if pattern parse failed
export const userSetPattern = () =>
{
  const index = get(pStrand).curPatternIdx;

  if (get(dStrands)[get(idStrand)].curPatternIdx !== index)
  {
    get(dStrands)[get(idStrand)].curPatternIdx = index;

    const patitem = get(aCurListPats)[index];
    const pattern = patitem.cmd;
  
    //console.log(`SetPattern: ${patitem.text} index=${index}`); // DEBUG

    strandClearAll();

    if (parsePattern(pattern)) // sets vars for current strand
    {
      strandCopyAll();
      makeEntireCmdStr();
      sendEntirePattern(); // set new pattern
    }
    else return false;
  }
  return true;
}

export const userClearPattern = () =>
{
  //console.log('Clear Pattern'); // DEBUG

  strandClearAll();
  makeEntireCmdStr();

  if (get(pStrand).curPatternIdx === 0)
    sendEntirePattern(); // clear pattern

  // else userSetPattern() will be called
  else get(pStrand).curPatternIdx = 0;

  get(pStrand).showCustom = false;
  get(pStrand).showMenu = true;
}

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
    let delay = get(pStrand).msecsDelay;
    if (get(dStrands)[get(idStrand)].msecsDelay !== delay)
    {
      get(dStrands)[get(idStrand)].msecsDelay = delay;

      strandCopyTop();
      sendStrandCmd(cmdStr_OR_Delay, delay);
    }
  }
  else
  {
    const layer = DRAW_LAYER;
    const delay = get(pStrand).tracks[track].drawProps.msecsDelay;

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.msecsDelay !== delay)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.msecsDelay = delay;

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
  const layer = DRAW_LAYER;
  const oride = get(pStrand).doOverride;

  if (get(dStrands)[get(idStrand)].doOverride !== oride)
  {
    get(dStrands)[get(idStrand)].doOverride = oride;

    sendStrandCmd(cmdStr_SetXmode, oride ? 1 : 0);
    if (!oride) // must resend any props that were overriden
    {
      for (let i = 0; i < get(pStrand).tactives; ++i)
      {
        let props = get(pStrand).tracks[i].drawProps;

        if (props.overHue)
          userSendToLayer(track, layer, cmdStr_DegreeHue, `${props.degreeHue}`);

        if (props.overWhite)
          userSendToLayer(track, layer, cmdStr_PcentWhite, `${props.pcentWhite}`);

        if (props.overCount)
          userSendToLayer(track, layer, cmdStr_PcentCount, `${props.pcentCount}`);
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
    sendStrandCmd(cmdStr_OR_Props, `${hue} ${white} ${count}`);
  }
}

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

export const userSetForce = () =>
{
  // do nothing when user changes force value
}

export const userSendTrigger = () =>
{
  sendStrandCmd(cmdStr_PullTrigger, get(pStrand).forceValue);
}

export const userSetEffect = (track, layer, elist) =>
{
  const strand = get(pStrand);
  const pindex = strand.tracks[track].layers[layer].pluginIndex;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginIndex !== pindex)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginIndex = pindex;

    const bits = elist[pindex].bits;
    strand.tracks[track].layers[layer].pluginBits = bits;
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginBits = bits;

    updateTriggerLayers(); // update trigger sources
    updateAllTracks();     // recreate all tracks

    sendEntirePattern(); // FIXME when device command handling updated
    //userSendToLayer(track, layer, cmdStr_SwitchEffect, `${pindex}`);
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

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.overHue != props.overHue)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.overHue = props.overHue;
      if (!props.overHue)
           userSendToLayer(track, layer, cmdStr_DegreeHue, `${props.degreeHue}`);
      else userSendToLayer(track, layer, cmdStr_DegreeHue, `${strand.degreeHue}`);
    }

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.overWhite != props.overWhite)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.overWhite = props.overWhite;
      if (!props.overWhite)
           userSendToLayer(track, layer, cmdStr_PcentWhite, `${props.pcentWhite}`);
      else userSendToLayer(track, layer, cmdStr_PcentWhite, `${strand.pcentWhite}`);
    }

    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.overCount != props.overCount)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.overCount = props.overCount;
      if (!props.overCount)
           userSendToLayer(track, layer, cmdStr_PcentCount, `${props.pcentCount}`);
      else userSendToLayer(track, layer, cmdStr_PcentCount, `${strand.pcentCount}`);
    }
  }
}

export const userSetOffset = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const offset = strand.tracks[track].drawProps.pcentOffset;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentOffset !== offset)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentOffset = offset;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_PcentOffset, offset);
  }
}

export const userSetLength = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const extent = strand.tracks[track].drawProps.pcentExtent;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentExtent !== extent)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentExtent = extent;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_PcentExtent, extent);
  }
}

export const userSetOwrite = (track) =>
{
  const layer = DRAW_LAYER;
  const orval = get(pStrand).tracks[track].drawProps.orPixelVals;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals !== orval)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals = orval;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_OwritePixs, (orval ? 1 : 0));
  }
}

export const userSetDirect = (track) =>
{
  const layer = DRAW_LAYER;
  const rdir = get(pStrand).tracks[track].drawProps.reverseDir;

  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.reverseDir !== rdir)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.reverseDir = rdir;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_Direction, (rdir ? 0 : 1)); // 1 is default
  }
}

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
  const dolayer = strand.tracks[track].layers[layer].trigOnLayer;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer !== dolayer)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer = dolayer;

    let tracknum = strand.tracks[track].layers[layer].trigTrackNum;
    let layernum = strand.tracks[track].layers[layer].trigLayerNum;

    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTrackNum = tracknum;
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigLayerNum = layernum;

    let tlayer = MAX_BYTE_VALUE; // indicates disabled state
    if (dolayer) tlayer = convTrackLayerToID(tracknum-1, layernum-1);
    
    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigFromLayer, tlayer);
  }
}

// if this is called then onLayer has already been enabled
export const userSetTrigNums = (track, layer) =>
{
  const strand = get(pStrand);
  const tracknum = strand.tracks[track].layers[layer].trigTrackNum;
  const layernum = strand.tracks[track].layers[layer].trigLayerNum;

  if ((get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTrackNum !== tracknum) ||
      (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigLayerNum !== layernum))
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTrackNum = tracknum;
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigLayerNum = layernum;

    const tlayer = convTrackLayerToID(tracknum-1, layernum-1);

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigFromLayer, tlayer);
  }
}

export const userSetTrigAuto = (track, layer) =>
{
  if (layer === undefined) layer = DRAW_LAYER;

  const doauto = get(pStrand).tracks[track].layers[layer].trigAutomatic;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAutomatic !== doauto)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAutomatic = doauto;

    updateLayerVals(track, layer);

    if (doauto)
    {
      let dmax = get(pStrand).tracks[track].layers[layer].trigDelayRange;
      userSendToLayer(track, layer, cmdStr_TrigRangeTime, dmax);
    }
    else userSendToLayer(track, layer, cmdStr_TrigRangeTime, undefined); // no value = disable
  }
}

export const userSetTrigRandom = (track, layer) =>
{
  const strand = get(pStrand);
  const dorep = strand.tracks[track].layers[layer].trigDoRepeat;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat !== dorep)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = dorep;

    if (dorep)
    {
      updateLayerVals(track, layer);
      userSendToLayer(track, layer, cmdStr_TrigCount); // no value is set for random
    }
    else if (!userSetTrigCount(track, layer))
    {
      const count = strand.tracks[track].layers[layer].trigRepCount;

      updateLayerVals(track, layer);
      userSendToLayer(track, layer, cmdStr_TrigCount, count);
    }
  }
}

// return true if did set new value, else false
export const userSetTrigCount = (track, layer) =>
{
  const count = get(pStrand).tracks[track].layers[layer].trigRepCount;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount !== count)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount = count;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigCount, count);

    return true;
  }
  return false;
}

export const userSetTrigDmin = (track, layer) =>
{
  const dmin = get(pStrand).tracks[track].layers[layer].trigDelayMin;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayMin !== dmin)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayMin = dmin;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigMinTime, dmin);
  }
}

// return true if did set new value, else false
export const userSetTrigDrange = (track, layer) =>
{
  const dmax = get(pStrand).tracks[track].layers[layer].trigDelayRange;

  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayRange !== dmax)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayRange = dmax;

    updateLayerVals(track, layer);
    userSendToLayer(track, layer, cmdStr_TrigRangeTime, dmax);

    return true;
  }
  return false;
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
