import { get } from 'svelte/store';

import {
  DRAW_LAYER,
  cmdStr_PullTrigger   ,
  cmdStr_Pause         ,
  cmdStr_Resume        ,
  cmdStr_AddrStrand    ,
  cmdStr_AddrLayer     ,
  cmdStr_SetBright     ,
  cmdStr_SetDelay      ,
  cmdStr_SetFirst      ,
  cmdStr_SetProps      ,
  cmdStr_SetXmode      ,
  cmdStr_Clear         ,
  cmdStr_PcentStart    ,
  cmdStr_PcentLength   ,
  cmdStr_OrideBits     ,
  cmdStr_Direction     ,
  cmdStr_OwritePixs    ,
  cmdStr_TrigLayer     ,
  cmdStr_TrigManual    ,
  cmdStr_TrigForce     ,
  cmdStr_TrigCount     ,
  cmdStr_TrigMinTime   ,
  cmdStr_TriggerRange  ,
} from './pixelnut.js';

import {
  nStrands, idStrand, pStrand,
  aStrands, eStrands, dStrands,
  aPatterns
} from './globals.js';

import {
  clearStrand,
  copyStrand,
  copyStrandTop,
  copyStrandLayer,

} from './patterns.js'

import {
  makeCmdStrs,
  makeLayerID,
  makeOrideBits,
} from './cmdmake.js'

import { writeDevice } from './device.js'
import { parsePattern } from './cmdparse.js';

export const sendCmd = (cmdstr) =>
{
  const sid = get(idStrand);
  let didone = false;

  if (get(pStrand).selected)
    writeDevice(cmdstr); // send to current strand

  for (let s = 0; s < get(nStrands); ++s)
  {
    if ((s != sid) && get(aStrands)[s].selected)
    {
      writeDevice(cmdStr_AddrStrand.concat(s, ' ', cmdstr));
      didone = true;
    }
  }

  // check if must return to current strand
  if (didone) writeDevice(cmdStr_AddrStrand.concat(sid));
}

export const sendCmdVal = (cmdstr, cmdval) =>
{
  if (cmdval != undefined)
       sendCmd(cmdstr.concat(cmdval, ' '));
  else sendCmd(cmdstr);
}

export const sendLayerCmd = (id, cmdstr, cmdval) =>
{
  if (cmdval != undefined)
    cmdstr = cmdstr.concat(cmdval);

  if (id >= 0)
  {
    let str = `${cmdStr_AddrLayer}${id} `;
    str = str.concat(`${cmdstr} `);
    str = str.concat(`${cmdStr_AddrLayer}`);
    sendCmd(str);
  }
  else sendCmd(cmdstr);
}

export const sendLayerCmds = (id, cmdstr1, cmdval1, cmdstr2, cmdval2) =>
{
  cmdstr1 = cmdstr1.concat(cmdval1);
  cmdstr2 = cmdstr2.concat(cmdval2);

  let str = `${cmdStr_AddrLayer}${id} `;
  str = str.concat(`${cmdstr1} `);
  str = str.concat(`${cmdstr2} `);
  str = str.concat(`${cmdStr_AddrLayer}`);
  sendCmd(str);
}

// Commands from Header:

export const userSendPause = (enable) =>
{
  if (enable) sendCmd(cmdStr_Pause);
  else        sendCmd(cmdStr_Resume);
}

// Commands from Strand Selector

export const userStrandCombine = (combine) =>
{
  if (!combine) // user turned of combine
  {
    // must disable all but the current one
    for (let i = 0; i < get(nStrands); ++i)
      get(aStrands)[i].selected = false;

    get(pStrand).selected = true;
  }
}

function switchStrands(s)
{
  idStrand.set(s);
  pStrand.set(get(aStrands)[s]);
  writeDevice(cmdStr_AddrStrand.concat(s));
}

export const userStrandSelect = (combine) =>
{
  let cur = get(idStrand);
  for (let s = 0; s < get(nStrands); ++s)
  {
    let wason = get(eStrands)[s];
    let nowon = get(aStrands)[s].selected;

    if (wason != nowon)
    {
      if (nowon && !combine && (s != cur))
      {
        // user selected a different strand
        get(aStrands)[cur].selected = false;
        switchStrands(s);
        get(eStrands)[cur] = false;
        get(eStrands)[s] = true;
      }
      else if (nowon && combine && (s != cur))
      {
        // mirror current strand by sending entire current command to newly selected strand
        writeDevice(cmdStr_AddrStrand.concat(s, ' ', cmdStr_Clear, ' ', get(pStrand).patternStr));
      }
      else if (!nowon && combine && (s == cur))
      {
        // disabled the current strand, so set to first enabled one
        for (let ss = 0; ss < get(nStrands); ++ss)
        {
          if (get(aStrands)[ss].selected)
          {
            switchStrands(ss);
            break;
          }
        }
        get(eStrands)[s] = false;
      }
      else if (nowon && (s == cur))
      {
        // must resend entire command string
        // after having all strands disabled
        sendCmd(get(pStrand).patternStr);
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

// Commands from PanelMain:

// user just selected pattern from list (id is set)
// assume that the current pattern has been cleared
export const userSetPatternID = () =>
{
  let cmdstr = get(aPatterns)[get(pStrand).patternID].cmd;
  if (cmdstr != '')
  {
    //FIXME if (parsePattern(cmdstr)) // sets vars for current strand
    {
      // display new pattern on all selected strands
      get(pStrand).patternStr = cmdstr;
      copyStrand();
      sendCmd(cmdstr);
    }
    // shouldn't happen: all pre-builts are valid
    //else console.error('Parse Failed: ', cmdstr);
  }
}

export const userSetBright = (track) =>
{
  if (track == undefined)
  {
    let value = get(pStrand).pcentBright;
    if (get(dStrands)[get(idStrand)].pcentBright != value)
    {
      get(dStrands)[get(idStrand)].pcentBright = value;

      copyStrandTop();
      sendCmdVal(cmdStr_SetBright, value);
    }
  }
  else
  {
    let value = get(pStrand).tracks[track].drawProps.pcentBright;
    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright != value)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright = value;

      get(pStrand).patternStr = '';
      makeCmdStrs(track, DRAW_LAYER);
      copyStrandLayer(track, DRAW_LAYER);
  
      let layerid = makeLayerID(track, DRAW_LAYER);
      sendLayerCmd(layerid, cmdStr_SetBright, value);
    }
  }
}

export const userSetDelay = (track) =>
{
  if (track == undefined)
  {
    let value = get(pStrand).msecsDelay;
    if (get(dStrands)[get(idStrand)].msecsDelay != value)
    {
      get(dStrands)[get(idStrand)].msecsDelay = value;

      copyStrandTop();
      sendCmdVal(cmdStr_SetDelay, value);
    }
  }
  else
  {
    let value = get(pStrand).tracks[track].drawProps.msecsDelay;
    if (get(dStrands)[get(idStrand)].tracks[track].drawProps.msecsDelay != value)
    {
      get(dStrands)[get(idStrand)].tracks[track].drawProps.msecsDelay = value;

      makeCmdStrs(track, DRAW_LAYER);
      copyStrandLayer(track, DRAW_LAYER);

      let layerid = makeLayerID(track, DRAW_LAYER);
      sendLayerCmd(layerid, cmdStr_SetDelay, value);
    }
  }
}

export const userSetRotate = () =>
{
  let value = get(pStrand).firstPixel;
  if (get(dStrands)[get(idStrand)].firstPixel != value)
  {
    get(dStrands)[get(idStrand)].firstPixel = value;

    copyStrandTop();
    sendCmdVal(cmdStr_SetFirst, value);
  }
}

export const userSetOverMode = () =>
{
  let value = get(pStrand).doOverride;
  if (get(dStrands)[get(idStrand)].doOverride != value)
  {
    get(dStrands)[get(idStrand)].doOverride = value;

    sendCmdVal(cmdStr_SetXmode, value ? 1 : 0);
    if (value) userSetProps();
  }
}

export const userSetProps = (track) =>
{
  if (track == undefined)
  {
    let hue = get(pStrand).degreeHue;
    let white = get(pStrand).pcentWhite;
    let count = get(pStrand).pcentCount;

    if ((get(dStrands)[get(idStrand)].hue   != hue)   ||
        (get(dStrands)[get(idStrand)].white != white) ||
        (get(dStrands)[get(idStrand)].count != count))
    {
      get(dStrands)[get(idStrand)].hue = hue;
      get(dStrands)[get(idStrand)].white = white;
      get(dStrands)[get(idStrand)].count = count;

      copyStrandTop();
      sendCmdVal(cmdStr_SetProps, `${hue} ${white} ${count}`);
    }
  }
  else
  {
    let hue = get(pStrand).tracks[track].drawProps.degreeHue;
    let white = get(pStrand).tracks[track].drawProps.pcentWhite;
    let count = get(pStrand).tracks[track].drawProps.pcentCount;

    if ((get(dStrands)[get(idStrand)].tracks[track].drawProps.hue   != hue)   ||
        (get(dStrands)[get(idStrand)].tracks[track].drawProps.white != white) ||
        (get(dStrands)[get(idStrand)].tracks[track].drawProps.count != count))
    {
      makeCmdStrs(track, DRAW_LAYER);
      copyStrandLayer(track, DRAW_LAYER);
  
      let layerid = makeLayerID(track, DRAW_LAYER);
      sendLayerCmd(layerid, cmdStr_SetProps, `${hue} ${white} ${count}`);
    }
  }
}

export const userSetForce = () =>
{
  // do nothing when user changes force value
}

export const userSendTrigger = () =>
{
  sendCmdVal(cmdStr_PullTrigger, get(pStrand).forceValue);
}

// Commands from PanelCustom:

// user just edited pattern string
export const userSetPatternStr = () =>
{
  console.log('setpatstr');
  let cmdstr = get(pStrand).patternStr;

  if (parsePattern(cmdstr)) // sets vars for current strand
  {
    copyStrand();
    sendCmd(cmdstr);
  }
  else get(pStrand).patternStr = '<invalid command string>';
}

export const userClearPattern = () =>
{
  // clears patterns to custom mode
  get(pStrand).patternStr = '';
  get(pStrand).patternID = 0;

  clearStrand();
  copyStrand();

  sendCmd(cmdStr_Clear);
}

// Commands from ControlsDrawing:

export const userSetDrawEffect = (track) =>
{
  let value = get(pStrand).tracks[track].layers[0].pluginIndex;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[0].pluginIndex != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[0].pluginIndex = value;

    if (value > 0)
    {
      // must recreate entire command string when an effect is changed
      makeCmdStrs(track, DRAW_LAYER);
      copyStrandLayer(track, DRAW_LAYER);
      sendCmd(get(pStrand).patternStr);
    }
  }
}

export const userSetOverrides = (track) =>
{
  let bits = makeOrideBits(get(pStrand), track);
  if (makeOrideBits(get(pStrand), track) != bits)
  {
    get(pStrand).tracks[track].drawProps.overHue   = get(pStrand).tracks[track].drawProps.overHue;
    get(pStrand).tracks[track].drawProps.overWhite = get(pStrand).tracks[track].drawProps.overWhite;
    get(pStrand).tracks[track].drawProps.overCount = get(pStrand).tracks[track].drawProps.overCount;

    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);
  
    let layerid = makeLayerID(track, DRAW_LAYER);
    sendLayerCmd(layerid, cmdStr_OrideBits, bits);
  }
}

export const userSetStart = (track) =>
{
  let start = get(pStrand).tracks[track].drawProps.pcentStart;
  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentStart  != start)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentStart = start;

    let length = get(pStrand).tracks[track].drawProps.pcentFinish - start;
    if (length >= 0)
    {
      makeCmdStrs(track, DRAW_LAYER);
      copyStrandLayer(track, DRAW_LAYER);
      sendCmd(get(pStrand).patternStr); // must resend entire string
      return false;
    }
    else
    {
      get(pStrand).tracks[track].drawProps.pcentFinish = start;
      return true; // cause reactive change and call to userSetFinish()
    }
  }
}

export const userSetFinish = (track) =>
{
  let finish = get(pStrand).tracks[track].drawProps.pcentFinish;
  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentFinish != finish)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentFinish = finish;

    let start = get(pStrand).tracks[track].drawProps.pcentStart;
    let length = finish - start;
    if (length >= 0)
    {
      makeCmdStrs(track, DRAW_LAYER);
      copyStrandLayer(track, DRAW_LAYER);
      sendCmd(get(pStrand).patternStr); // must resend entire string
      return false;
    }
    else
    {
      get(pStrand).tracks[track].drawProps.pcentStart = finish;
      return true; // cause reactive change and call to userSetStart()
    } 
  }
}

export const userSetOwrite = (track) =>
{
  let value = get(pStrand).tracks[track].drawProps.orPixelValues;
  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelValues != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelValues = value;

    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);

    let layerid = makeLayerID(track, DRAW_LAYER);
    sendLayerCmd(layerid, cmdStr_OwritePixs, (value ? 1 : 0));
  }
}

export const userSetDirect = (track) =>
{
  let value = get(pStrand).tracks[track].drawProps.reverseDir;
  if (get(dStrands)[get(idStrand)].tracks[track].drawProps.reverseDir != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].drawProps.reverseDir = value;

    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);

    let layerid = makeLayerID(track, DRAW_LAYER);
    sendLayerCmd(layerid, cmdStr_Direction, (value ? 0 : 1)); // 1 is default
  }
}

// Commands from ControlsFilter:

export const userSetFilterEffect = (track, layer) =>
{
  let pid = get(pStrand).tracks[track].layers[layer].pluginIndex;
  if (pid > 0)
  {
    // must recreate entire command string when an effect is changed
    makeCmdStrs(track, layer);
    sendCmd(get(pStrand).patternStr);
  }
}

export const userSetTrigManual = (track, layer) =>
{
  // TODO: if not new firmware then must send
  //       entire command string if turning off

  let value = get(pStrand).tracks[track].layers[layer].trigDoManual;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoManual != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoManual = value;

    makeCmdStrs(track, layer);
    copyStrandLayer(track, layer);

    let layerid = makeLayerID(track, layer);
    // don't need to send value if enabling (1 is default)
    sendLayerCmd(layerid, cmdStr_TrigManual, (value ? undefined : 0));
  }
}

export const userSetTrigLayer = (track, layer) =>
{
  let value = get(pStrand).tracks[track].layers[layer].trigDoLayer;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoLayer != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoLayer = value;

    let tracknum = get(pStrand).tracks[track].layers[layer].trigTrackNum;
    let layernum = get(pStrand).tracks[track].layers[layer].trigLayerNum;

    let tlayer = MAX_BYTE_VALUE; // indicates disabled state
    if (value) tlayer = makeLayerID(tracknum-1, layernum-1);
    
    makeCmdStrs(track, layer);
    copyStrandLayer(track, layer);

    let layerid = makeLayerID(track, layer);
    sendLayerCmd(layerid, cmdStr_TrigLayer, tlayer);
  }
}

// must recreate entire command string if no-triggering is chosen
export const userSetTrigType = (track, layer) =>
{
  let value = get(pStrand).tracks[track].layers[layer].trigTypeStr;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTypeStr != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTypeStr = value;

    if (value == 'none')
    {
      makeCmdStrs(track, layer);
      sendCmd(get(pStrand).patternStr);
    }
    else if (value == 'once')
    {
      makeCmdStrs(track, layer);
      copyStrandLayer(track, layer);

      let layerid = makeLayerID(track, layer);
      sendLayerCmd(layerid, cmdStr_TriggerRange); // no value is set for once
    }
    else if (value == 'auto') userSetTrigDrange(track, layer);
  }
}

export const userSetTrigRandom = (track, layer) =>
{
  let value = get(pStrand).tracks[track].layers[layer].trigDoRepeat;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = value;

    if (value)
    {
      makeCmdStrs(track, layer);
      copyStrandLayer(track, layer);

      let layerid = makeLayerID(track, layer);
      sendLayerCmd(layerid, cmdStr_TrigCount); // no value is set for random
    }
    else userSetTrigCount(track, layer);
  }
}

export const userSetTrigCount = (track, layer) =>
{
  let value = get(pStrand).tracks[track].layers[layer].trigRepCount;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount = value;

    makeCmdStrs(track, layer);
    copyStrandLayer(track, layer);

    let layerid = makeLayerID(track, layer);
    sendLayerCmd(layerid, cmdStr_TrigCount, value);
  }
}

export const userSetTrigDmin = (track, layer) =>
{
  let dmvaluein = get(pStrand).tracks[track].layers[layer].trigDelayMin;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayMin != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayMin = value;

    makeCmdStrs(track, layer);
    copyStrandLayer(track, layer);

    let layerid = makeLayerID(track, layer);
    sendLayerCmd(layerid, cmdStr_TrigMinTime, value);
  }
}

export const userSetTrigDrange = (track, layer) =>
{
  let value = get(pStrand).tracks[track].layers[layer].trigDelayRange;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayRange != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayRange = value;

    makeCmdStrs(track, layer);
    copyStrandLayer(track, layer);

    let layerid = makeLayerID(track, layer);
    sendLayerCmd(layerid, cmdStr_TriggerRange, value);
  }
}

export const userSetForceValue = (track, layer) =>
{
  let value = get(pStrand).tracks[track].layers[layer].forceRandom;
  if (get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom != value)
  {
    get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom = value;

    makeCmdStrs(track, layer);
    copyStrandLayer(track, layer);

    if (!value)
    {
      let layerid = makeLayerID(track, layer);
      let force = get(pStrand).tracks[track].layers[layer].forceValue;
      sendLayerCmd(layerid, cmdStr_TrigForce, force);
    }
    else sendLayerCmd(layerid, cmdStr_TrigForce);
  }
}
