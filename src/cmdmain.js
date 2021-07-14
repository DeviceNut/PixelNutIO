import { get } from 'svelte/store';

import { pStrand } from './globals.js';
import { createStrandData } from './patterns.js';

import {
    overBits_DegreeHue   ,
    overBits_PcentWhite  ,
    overBits_PixCount    ,
    cmdStr_PullTrigger   ,
    cmdStr_Pause         ,
    cmdStr_Resume        ,
    cmdStr_AddrLayer     ,
} from './pixelnut.js';
  
  // triggers reactivity for all display elements
const updateDisplay = () =>
{
  pStrand.set(get(pStrand));
}

const writeDevice = (cmdstr) =>
{
  console.log('>>', cmdstr);
}

export const sendCmd = (cmdstr) =>
{
  // TODO: send command string to all selected strands

  writeDevice(cmdstr);
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

export const cmdClearPattern = () =>
{
  // clears patterns to custom mode
  curPatternStr.set('');
  curPatternID.set(0);

  // clears entire current strand data
  createStrandData(get(idStrand));

  updateDisplay(); // triggers update
}

export const cmdSendPause = (enable) =>
{
  if (enable)
       writeDevice(cmdStr_Pause);
  else writeDevice(cmdStr_Resume);
}

export const cmdSendTrigger = () =>
{
  sendCmdVal(cmdStr_PullTrigger, get(pStrand).forceValue);
}

// Utility functions

export const makeOrideBits = (track) =>
{
  let bits = 0;

  if (get(pStrand).tracks[track].drawProps.overHue)
    bits |= overBits_DegreeHue;

  if (get(pStrand).tracks[track].drawProps.overWhite)
    bits |= overBits_PcentWhite;

  if (get(pStrand).tracks[track].drawProps.overCount)
    bits |= overBits_PixCount;

  return bits;
}

// calculate what pixelnut engine layerid is
export const calcLayerID = (track, layer) =>
{
  let layerid = 0;

  if (track >= get(pStrand).tactives)
  {
    console.error(`No track=${track+1}`);
    track = get(pStrand).tactives-1;
  }

  for (let i = 0; i < track; ++i)
    layerid += get(pStrand).tracks[i].lactives;

  if (layer >= get(pStrand).tracks[track].lactives)
  {
    console.error(`No layer=${layer+1}`);
    layer = get(pStrand).tracks[track].lactives-1;
  }

  return layerid + layer;
}

