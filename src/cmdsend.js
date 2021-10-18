import { get } from 'svelte/store';

import {
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  curDevice
} from './globals.js';

import {
  cmdStr_SaveFlash     ,
  cmdStr_AddrStrand    ,
  cmdStr_AddrLayer     ,
  cmdStr_Clear         ,
} from './pixcmds.js';

import { mqttSend } from './mqtt.js';

///////////////////////////////////////////////////////////

export const sendCmdToDevice = (cmdstr) =>
{
  let device = get(curDevice);

  if (device !== null)
    mqttSend(device.curname, cmdstr);

  else console.warn(`Device null on send: ${cmdstr}`);
}

export const sendStrandSwitch = (s) =>
{
  sendCmdToDevice(cmdStr_AddrStrand.concat(s));
}

// sends current pattern to just the specified strand
// if not currently selected one switch back and forth
export const sendPatternToStrand = (s) =>
{
  let sid = get(idStrand);
  if (sid !== s) sendStrandSwitch(s);
  sendCmdToDevice( get(pStrand).curPatternStr );
  if (sid !== s) sendStrandSwitch(sid);
}

// sends command to all selected strands
// optionally skips the current strand
// optionally stores the pattern on the device
function sendCmdToStrands(cmdstr, dostore=false)
{
  const sid = get(idStrand);
  let didone = false;

  if (get(pStrand).selected)
  {
    if (dostore) sendCmdToDevice(cmdStr_SaveFlash);
    else sendCmdToDevice(cmdstr);
  }

  for (let s = 0; s < get(nStrands); ++s)
  {
    if ((s !== sid) && get(aStrands)[s].selected)
    {
      sendStrandSwitch(s)
      if (dostore) sendCmdToDevice(cmdStr_SaveFlash);
      else sendCmdToDevice(cmdstr);
      didone = true;
    }
  }

  if (didone) sendStrandSwitch(sid)
}

// sends current pattern to all selected strands
// optionally stores the pattern to the device
// clears device pattern stack first if not storing
export const sendEntirePattern = (dostore) =>
{
  const pattern = get(pStrand).curPatternStr;

  if (pattern !== '')
  {
    if (!dostore) sendCmdToStrands(cmdStr_Clear, false);

    sendCmdToStrands(pattern, dostore);
  }
  else sendCmdToStrands(cmdStr_Clear, dostore);

  pStrand.set(get(pStrand)); // triggers update to UI - MUST HAVE THIS
}

// send top level command (and optional value) to all selected strands
export const sendStrandCmd = (cmdstr, cmdval) =>
{
  if (cmdval !== undefined)
       sendCmdToStrands(cmdstr.concat(cmdval));
  else sendCmdToStrands(cmdstr);
}

// send command (and optional value) to specific layer for all selected strands
export const sendLayerCmd = (id, cmdstr, cmdval) =>
{
  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

  sendCmdToStrands(`${cmdStr_AddrLayer}${id} ${cmdstr}`);
}
