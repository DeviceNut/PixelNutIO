import { get } from 'svelte/store';

import {
  nStrands, aStrands, idStrand, eStrands, pStrand,
  nPixels, nTracks, tLayers,
  aPatterns, aEffectsDraw, aEffectsPre,
  curPatternID, curPatternStr,
} from './globals.js';

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
const cmdStr_PopPattern     = "P";

const cmdStr_Effect         = "E";
const cmdStr_Modify         = "M";

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

  for (let i = 0; i < track-1; ++i)
    layerid += get(aStrands)[get(idStrand)].tracks[track-1].lactives;

  return layerid + layer-1;
}

function dosend(str)
{
  console.log(str);
  //console.log(get(aStrands));
}

function sendCmd(cmdstr, cmdval)
{
  if (cmdval != undefined)
       dosend(cmdstr.concat(cmdval, ' '));
  else dosend(cmdstr);
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
    dosend(str);
  }
  else dosend(cmdstr);
}

export const newPatternID = () =>
{
  let list = get(aPatterns);
  let cmdstr = list[get(curPatternID)].cmd;
  if (cmdstr)
  {
    dosend(cmdstr);
    curPatternStr.set(cmdstr);
  }
}

export const cmdSendPause = (enable) =>
{
  if (enable)
       dosend(cmdStr_Pause);
  else dosend(cmdStr_Resume);
}

export const cmdSetBright = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  if (layerid >= 0)
  {
    let value = get(pStrand).tracks[track-1].drawProps.pcentBright;
    sendLayerCmd(layerid, cmdStr_SetBright, value);
    copyStrandLayer(track, layer);
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
    let value = get(pStrand).tracks[track-1].drawProps.msecsDelay;
    sendLayerCmd(layerid, cmdStr_SetDelay, value);
    copyStrandLayer(track, layer);
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

export const cmdSetProps = (track) =>
{
  let layerid = calcLayerID(track, 1);
  if (layerid >= 0)
  {
    let hue = get(pStrand).tracks[track-1].drawProps.degreeHue;
    let white = get(pStrand).tracks[track-1].drawProps.pcentWhite;
    let count = get(pStrand).tracks[track-1].drawProps.pcentCount;
    let valstr = `${hue} ${white} ${count}`
    sendLayerCmd(layerid, cmdStr_SetProps, valstr);
    copyStrandLayer(track, 1);
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
    let value = get(pStrand).tracks[track-1].drawProps.pixStart;
    sendLayerCmd(layerid, cmdStr_SetStart, value);
    copyStrandLayer(track, layer);
  }
  else cmdError(track, layer);
}

export const cmdSetFinish = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  if (layerid >= 0)
  {
    let value = get(pStrand).tracks[track-1].drawProps.pixEnd;
    sendLayerCmd(layerid, cmdStr_SetFinish, value);
    copyStrandLayer(track, layer);
  }
  else cmdError(track, layer);
}
