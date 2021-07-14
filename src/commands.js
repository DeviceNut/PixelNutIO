import { get } from 'svelte/store';

import {
  nStrands, aStrands, idStrand, eStrands, pStrand,
  nPixels, nTracks, tLayers,
  aPatterns, aEffectsDraw, aEffectsFilter,
  curPatternID, curPatternStr,
} from './globals.js';

import { makeCmdStr, parsePattern } from './patterns.js';

export const MAX_FORCE      = 1000;   // maximum force value

const pluginBit_DIRECTION   = 0x08;   // changing direction changes effect
const pluginBit_TRIGGER     = 0x10;   // triggering changes the effect
const pluginBit_USEFORCE    = 0x20;   // trigger force is used in effect
const pluginBit_NEGFORCE    = 0x40;   // negative trigger force is used
const pluginBit_SENDFORCE   = 0x80;   // sends trigger force to other plugins

const overBits_DegreeHue    = 1;      // overwrite degreeHue
const overBits_PcentWhite   = 2;      // overwrite pcentWhite
const overBits_PixCount     = 4;      // overwrite pixCount

const cmdStr_GetInfo        = "?";
const cmdStr_GetSegments    = "?S";
const cmdStr_GetPatterns    = "?P";

const cmdStr_SetBright      = "%";
const cmdStr_SetDelay       = ":";
const cmdStr_SetFirst       = "^";
const cmdStr_SetStart       = "J";
const cmdStr_SetFinish      = "K";
const cmdStr_SetProps       = "=";
const cmdStr_SetXmode       = "_";
const cmdStr_SetName        = "@";
const cmdStr_Trigger        = "!";
const cmdStr_Pause          = "[";
const cmdStr_Resume         = "]";
const cmdStr_SetStrand      = "#";
const cmdStr_Clear          = "P ";

const cmdStr_Effect         = "E";
const cmdStr_Modify         = "M";

function cmdError(track, layer)
{
  console.error(`Bad track:layer = ${track}:${layer}`);
}

function calcLayerID(track, layer)
{
  // calculate what pixelnut engine layerid is, or -1 if none
  if ((track == undefined) || (layer == undefined)) return -1;

  if ((track <= 0) || (layer <= 0))
  {
    cmdError(track, layer);
    return -1;
  }

  let layerid = 0;

  for (let i = 0; i < track; ++i)
    layerid += get(aStrands)[get(idStrand)].tracks[i].lactives;

  return layerid + layer;
}

function copyStrandTop(track, layer)
{
  // copy all top level values from current strand
  // to all the other currently selected strands
}

function copyStrandLayer(track, layer)
{
  // copy values in entire layer from current strand
  // to all the other currently selected strands

  if (layer == 1) // also copy drawprops
  {

  }
}

// send command string to all selected strands
function doSend(cmdstr)
{
  // TODO: all strands
  console.log(cmdstr);
}

function sendCmd(cmdstr, cmdval)
{
  if (cmdval != undefined)
       doSend(cmdstr.concat(cmdval, ' '));
  else doSend(cmdstr);
}

function sendLayerCmd(id, cmdstr, cmdval)
{
  if (cmdval != undefined)
    cmdstr = cmdstr.concat(cmdval);

  if (id >= 0)
  {
    let str = '';
    str = str.concat(`${cmdStr_Modify}${id} `);
    str = str.concat(`${cmdstr} `);
    str = str.concat(`${cmdStr_Modify}`);
    doSend(str);
  }
  else doSend(cmdstr);
}

// user just selected drawing effect
// must regenerate entire pattern cmd
export const newDrawEffect = (track) =>
{
}

// user just selected predraw effect
// must regenerate entire pattern cmd
export const newFilterEffect = (track, layer) =>
{
}

// user just selected prebuilt pattern
export const cmdNewPattern = () =>
{
  let list = get(aPatterns);
  let cmdstr = list[get(curPatternID)].cmd;
  if (cmdstr)
  {
    // must clear first, then set new pattern
    doSend(cmdStr_Clear.concat(cmdstr));

    curPatternStr.set(cmdstr);
    parsePattern(cmdstr);
  }
}

export const cmdSendPause = (enable) =>
{
  if (enable)
       doSend(cmdStr_Pause);
  else doSend(cmdStr_Resume);
}

export const cmdSetBright = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  if (layerid >= 0)
  {
    let value = get(pStrand).tracks[track].drawProps.pcentBright;
    sendLayerCmd(layerid, cmdStr_SetBright, value);
    copyStrandLayer(track, layer);
    makeCmdStr(track, 1);
  }
  else
  {
    let value = get(pStrand).pcentBright;
    sendCmd(cmdStr_SetBright, value);
    copyStrandTop();
  }
}

export const cmdSetDelay = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  if (layerid >= 0)
  {
    let value = get(pStrand).tracks[track].drawProps.msecsDelay;
    sendLayerCmd(layerid, cmdStr_SetDelay, value);
    copyStrandLayer(track, layer);
    makeCmdStr(track, 1);
  }
  else
  {
    let value = get(pStrand).msecsDelay;
    sendCmd(cmdStr_SetDelay, value);
    copyStrandTop();
  }
}

export const cmdSetRotate = () =>
{
  let value = get(pStrand).firstPixel;
  sendCmd(cmdStr_SetFirst, value);
  copyStrandTop();
}

export const cmdSetOverMode = (enable) =>
{
  sendCmd(cmdStr_SetXmode, enable ? 1 : 0);
}

export const cmdSetProps = (track) =>
{
  let layerid = calcLayerID(track, 1);
  if (layerid >= 0)
  {
    let hue = get(pStrand).tracks[track].drawProps.degreeHue;
    let white = get(pStrand).tracks[track].drawProps.pcentWhite;
    let count = get(pStrand).tracks[track].drawProps.pcentCount;
    let valstr = `${hue} ${white} ${count}`
    sendLayerCmd(layerid, cmdStr_SetProps, valstr);
    copyStrandLayer(track, 1);
    makeCmdStr(track, 1);
  }
  else
  {
    let hue = get(pStrand).degreeHue;
    let white = get(pStrand).pcentWhite;
    let count = get(pStrand).pcentCount;
    let valstr = `${hue} ${white} ${count}`
    sendCmd(cmdStr_SetProps, valstr);
    copyStrandTop();
  }
}

export const cmdSetStart = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  if (layerid >= 0)
  {
    let value = get(pStrand).tracks[track].drawProps.pixStart;
    sendLayerCmd(layerid, cmdStr_SetStart, value);
    copyStrandLayer(track, layer);
    makeCmdStr(track, 1);
  }
  else cmdError(track, layer);
}

export const cmdSetFinish = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  if (layerid >= 0)
  {
    let value = get(pStrand).tracks[track].drawProps.pixEnd;
    sendLayerCmd(layerid, cmdStr_SetFinish, value);
    copyStrandLayer(track, layer);
    makeCmdStr(track, 1);
  }
  else cmdError(track, layer);
}

export const cmdTrigger = () =>
{
  sendCmd(cmdStr_Trigger, get(pStrand).forceValue);
}

export const cmdSetTriggerExt = (track, layer) =>
{

    makeCmdStr(track, layer);
}