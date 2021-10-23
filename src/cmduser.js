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
  DRAW_LAYER           ,
  MAX_BYTE_VALUE       ,
  cmdStr_PullTrigger   ,
  cmdStr_DeviceName    ,
  cmdStr_Pause         ,
  cmdStr_Resume        ,
  cmdStr_OR_Bright     ,
  cmdStr_OR_Delay      ,
  cmdStr_OR_Props      ,
  cmdStr_SetXmode      ,
  cmdStr_SetFirst      ,
  cmdStr_SelectEffect  ,
  cmdStr_PcentXoffset  ,
  cmdStr_PcentXlength  ,
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
} from './pixcmds.js';

import {
  pluginBit_ORIDE_HUE,
  pluginBit_ORIDE_WHITE,
  pluginBit_ORIDE_COUNT,
  pluginBit_ORIDE_DELAY,
  pluginBit_ORIDE_DIR,
  pluginBit_ORIDE_EXT
} from './presets.js';

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
export const userSendToLayer = (track, layer, cmdstr, cmdval) =>
{
  let layerid = convTrackLayerToID(track, layer);
  sendLayerCmd(layerid, cmdstr, cmdval);
}

// Strand/Pattern selection and handling:

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

    const name = index ? patitem.text : '';
    get(pStrand).curPatternName = name;
    get(dStrands)[get(idStrand)].curPatternName = name;
  
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
  const strand = get(pStrand);

  //console.log('Clear Pattern'); // DEBUG

  strand.curPatternName = '';

  strandClearAll();
  makeEntireCmdStr();

  if (strand.curPatternIdx === 0)
    sendEntirePattern(); // clear pattern

  // else userSetPattern() will be called
  else strand.curPatternIdx = 0;

  strand.showCustom = false;
  strand.showMenu = true;
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

  if ((prevstr == '') || (get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginIndex !== pindex))
  {
    const lshadow = get(dStrands)[get(idStrand)].tracks[track].layers[layer];
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
      const pval = elist[pindex].id;
      let layerid = convTrackLayerToID(track, layer);
      sendLayerCmd(layerid, cmdStr_SelectEffect, `${pval}`);
    }

    const bits = before & ~after; // override bits being cleared
    updateTrackOverrides(track, bits);
  }
}

export const userDoRestart = (track, layer, elist) =>
{
  const pindex = get(pStrand).tracks[track].layers[layer].pluginIndex;
  const pval = elist[pindex].id;
  let layerid = convTrackLayerToID(track, layer);
  sendLayerCmd(layerid, cmdStr_SelectEffect, `${pval}`);
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

    sendStrandCmd(cmdStr_SetXmode, oride ? 1 : 0);
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
    sendStrandCmd(cmdStr_OR_Props, `${hue} ${white} ${count}`);
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

  console.log(`direction: ${rdir} ${get(dStrands)[get(idStrand)].tracks[track].drawProps.dirBackwards}`);

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
    userSendToLayer(track, layer, cmdStr_TrigByEffect, tlayer);
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
    userSendToLayer(track, layer, cmdStr_TrigByEffect, tlayer);
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
      if (get(pStrand).tracks[track].layers[layer].trigForever) count = 0;
      else count = get(pStrand).tracks[track].layers[layer].trigRepCount;
      userSendToLayer(track, layer, cmdStr_TrigRepeating, count);
    }
    else userSendToLayer(track, layer, cmdStr_TrigRepeating, undefined); // disable
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
