import { get } from 'svelte/store';

import {
  pStrand,
  aPatterns,
  curPatternID, curPatternStr,
} from './globals.js';

import {
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

import { calcLayerID, sendCmd } from './cmdmain.js'
import { makeCmdStrs } from './cmdmake.js';
import { parsePattern } from './cmdparse.js';

// copy all top level values from current strand
// to all the other currently selected strands
function copyStrandTop()
{
}

// copy values in entire layer from current strand
// to all the other currently selected strands
function copyStrandLayer(track, layer)
{

  if (layer == 0) // also copy drawprops
  {

  }
}

// copy all values for one strand to another
function copyStrand()
{
  copyStrandTop();

  for (let track = 0; track < get(pStrand).tactives; ++track)
    for (let layer = 0; layer < get(pStrand).tracks[track].lactives; ++layer)
      copyStrandLayer(track, layer);
}

function checkCmdStr(track, layer)
{
  let dosend = (get(curPatternStr) == '');


  if (dosend) sendCmd(get(curPatternStr));
}

// Commands from PanelCustom:

// user just selected pattern from list (id is set)
// assume that the current pattern has been cleared
export const userSetPatternID = () =>
{
  let cmdstr = get(aPatterns)[get(curPatternID)].cmd;
  if (cmdstr != '')
  {
    if (parsePattern(cmdstr)) // sets vars for current strand
    {
      // display new pattern on all selected strands
      curPatternStr.set(cmdstr);
      copyStrand();
      sendCmd(cmdstr);
    }
    // shouldn't happen: all pre-builts are valid
    else console.error('Parse Failed: ', cmdstr);
  }
}

// Commands from PanelMain:

// user just edited pattern string
export const userSetPatternStr = () =>
{
  let cmdstr = get(curPatternStr);

  if (parsePattern(cmdstr)) // sets vars for current strand
  {
    copyStrand();
    sendCmd(cmdstr);
  }
  else curPatternStr.set('<invalid command string>');
}

export const userSetBright = (track) =>
{
  if (track == undefined)
  {
    copyStrandTop();
    sendCmdVal(cmdStr_SetBright, get(pStrand).pcentBright);
  }
  else
  {
    let layerid = calcLayerID(track, DRAW_LAYER);
    let value = get(pStrand).tracks[track].drawProps.pcentBright;

    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);
    sendLayerCmd(layerid, cmdStr_SetBright, value);
  }
}

export const userSetDelay = (track) =>
{
  if (track == undefined)
  {
    copyStrandTop();
    sendCmdVal(cmdStr_SetDelay, get(pStrand).msecsDelay);
  }
  else
  {
    let layerid = calcLayerID(track, DRAW_LAYER);
    let value = get(pStrand).tracks[track].drawProps.msecsDelay;

    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);
    sendLayerCmd(layerid, cmdStr_SetDelay, value);
  }
}

export const userSetRotate = () =>
{
  copyStrandTop();
  sendCmdVal(cmdStr_SetFirst, get(pStrand).firstPixel);
}

export const userSetOverMode = (enable) =>
{
  sendCmdVal(cmdStr_SetXmode, enable ? 1 : 0);
}

export const userSetProps = (track) =>
{
  if (track == undefined)
  {
    copyStrandTop();
    let hue = get(pStrand).degreeHue;
    let white = get(pStrand).pcentWhite;
    let count = get(pStrand).pcentCount;
    let valstr = `${hue} ${white} ${count}`
    sendCmdVal(cmdStr_SetProps, valstr);
  }
  else
  {
    let layerid = calcLayerID(track, DRAW_LAYER);
    let hue = get(pStrand).tracks[track].drawProps.degreeHue;
    let white = get(pStrand).tracks[track].drawProps.pcentWhite;
    let count = get(pStrand).tracks[track].drawProps.pcentCount;
    let valstr = `${hue} ${white} ${count}`

    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);
    sendLayerCmd(layerid, cmdStr_SetProps, valstr);
  }
}

// Commands from ControlsDrawing:

export const userSetDrawEffect = (track) =>
{
  let pid = get(pStrand).tracks[track].layers[0].pluginIndex;
  if (pid > 0)
  {
    // must recreate entire command string when an effect is changed
    makeCmdStrs(track, DRAW_LAYER);
    sendCmd(get(curPatternStr));
  }
}

export const userSetOverrides = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let bits = makeOrideBits(track);

  makeCmdStrs(track, DRAW_LAYER);
  copyStrandLayer(track, DRAW_LAYER);
  sendLayerCmd(layerid, cmdStr_OrideBits, bits);
}

export const userSetStart = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let start = get(pStrand).tracks[track].drawProps.pcentStart;
  let finish = get(pStrand).tracks[track].drawProps.pcentFinish;

  let length = finish - start;
  if (length >= 0)
  {
    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);
    sendLayerCmds(layerid, cmdStr_PcentStart, start, cmdStr_PcentLength, length);
    return false;
  }
  else
  {
    get(pStrand).tracks[track].drawProps.pcentFinish = start;
    return true; // cause reactive change and call to SetFinish()
  }
}

export const userSetFinish = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let start = get(pStrand).tracks[track].drawProps.pcentStart;
  let finish = get(pStrand).tracks[track].drawProps.pcentFinish;

  let length = finish - start;
  if (length >= 0)
  {
    makeCmdStrs(track, DRAW_LAYER);
    copyStrandLayer(track, DRAW_LAYER);
    sendLayerCmds(layerid, cmdStr_PcentStart, start, cmdStr_PcentLength, length);
    return false;
  }
  else
  {
    get(pStrand).tracks[track].drawProps.pcentStart = finish;
    return true; // cause reactive change and call to SetStart()
  } 
}

export const userSetOwrite = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let value = get(pStrand).tracks[track].drawProps.orPixelValues;

  makeCmdStrs(track, DRAW_LAYER);
  copyStrandLayer(track, DRAW_LAYER);
  sendLayerCmd(layerid, cmdStr_OwritePixs, (value ? 1 : 0));
}

export const userSetDirect = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let value = get(pStrand).tracks[track].drawProps.reverseDir;

  makeCmdStrs(track, DRAW_LAYER);
  copyStrandLayer(track, DRAW_LAYER);
  sendLayerCmd(layerid, cmdStr_Direction, (value ? 0 : 1)); // 1 is default
}

// Commands from ControlsFilter:

export const userSetFilterEffect = (track, layer) =>
{
  let pid = get(pStrand).tracks[track].layers[layer].pluginIndex;
  if (pid > 0)
  {
    // must recreate entire command string when an effect is changed
    makeCmdStrs(track, layer);
    sendCmd(get(curPatternStr));
  }
}

export const userSetTrigManual = (track, layer) =>
{
  // TODO: if not new firmware then must send
  //       entire command string if turning off

  let layerid = calcLayerID(track, layer);
  let domanual = get(pStrand).tracks[track].layers[layer].trigDoManual;
  
  makeCmdStrs(track, layer);
  // don't need to send value if enabling (1 is default)
  sendLayerCmd(layerid, cmdStr_TrigManual, (domanual ? undefined : 0));
}

export const userSetTrigLayer = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let dolayer = get(pStrand).tracks[track].layers[layer].trigDoLayer;
  let tracknum = get(pStrand).tracks[track].layers[layer].trigTrackNum;
  let layernum = get(pStrand).tracks[track].layers[layer].trigLayerNum;

  let tlayer = MAX_BYTE_VALUE; // indicates disabled state
  if (dolayer) tlayer = calcLayerID(tracknum-1, layernum-1);
  
  makeCmdStrs(track, layer);
  sendLayerCmd(layerid, cmdStr_TrigLayer, tlayer);
  return true;
}

// must recreate entire command string if no-triggering is chosen
export const userSetTrigType = (track, layer) =>
{
  let tstr = get(pStrand).tracks[track].layers[layer].trigTypeStr;
  if (tstr == 'none')
  {
    makeCmdStrs(track, layer);
    sendCmd(get(curPatternStr));
  }
  else if (tstr == 'once')
  {
    let layerid = calcLayerID(track, layer);
    makeCmdStrs(track, layer);
    sendLayerCmd(layerid, cmdStr_TriggerRange); // no value is set for once
  }
  else if (tstr == 'auto') userSetTrigDrange(track, layer);
}

export const userSetTrigRandom = (track, layer) =>
{
  let enabled = get(pStrand).tracks[track].layers[layer].trigDoRepeat;
  if (enabled)
  {
    let layerid = calcLayerID(track, layer);
    makeCmdStrs(track, layer);
    sendLayerCmd(layerid, cmdStr_TrigCount); // no value is set for random
  }
  else userSetTrigCount(track, layer);
}

export const userSetTrigCount = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let count = get(pStrand).tracks[track].layers[layer].trigRepCount;

  makeCmdStrs(track, layer);
  sendLayerCmd(layerid, cmdStr_TrigCount, count);
}

export const userSetTrigDmin = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let dmin = get(pStrand).tracks[track].layers[layer].trigDelayMin;

  makeCmdStrs(track, layer);
  sendLayerCmd(layerid, cmdStr_TrigMinTime, dmin);
}

export const userSetTrigDrange = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let range = get(pStrand).tracks[track].layers[layer].trigDelayRange;

  makeCmdStrs(track, layer);
  sendLayerCmd(layerid, cmdStr_TriggerRange, range);
}

export const userSetForceValue = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);

  makeCmdStrs(track, layer);

  if (!get(pStrand).tracks[track].layers[layer].forceRandom)
  {
    let value = get(pStrand).tracks[track].layers[layer].forceValue;
    sendLayerCmd(layerid, cmdStr_TrigForce, value);
  }
  else sendLayerCmd(layerid, cmdStr_TrigForce);
}
