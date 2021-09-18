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

function sendCmdToDevice(cmdstr)
{
  let device = get(curDevice);
  mqttSend(device.curname, cmdstr);
}

export const sendStrandSwitch = (s) =>
{
  sendCmdToDevice(cmdStr_AddrStrand.concat(s));
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
    sendCmdToDevice(cmdstr);
    if (dostore) sendCmdToDevice(cmdStr_SaveFlash);
    if (dostore) sendCmdToDevice('0'); // causes pattern to be executed not just stored
  }

  for (let s = 0; s < get(nStrands); ++s)
  {
    if ((s !== sid) && get(aStrands)[s].selected)
    {
      sendStrandSwitch(s)
      if (dostore) sendCmdToDevice(cmdStr_SaveFlash);
      sendCmdToDevice(cmdstr);
      if (dostore) sendCmdToDevice(cmdStr_SaveFlash);
      if (dostore) sendCmdToDevice('0'); // causes pattern to be executed not just stored
      didone = true;
    }
  }

  if (didone) sendStrandSwitch(sid)
}

// sends current pattern to just the specified strand
// if not currently selected one switch back and forth
// note that this stores and triggers the pattern as well
export const sendPatternToStrand = (s) =>
{
  let sid = get(idStrand);
  let pattern = get(pStrand).curPatternStr;

  if (sid != s) sendStrandSwitch(s);

  sendCmdToDevice(cmdStr_SaveFlash);
  sendCmdToDevice(pattern);
  sendCmdToDevice(cmdStr_SaveFlash);
  sendCmdToDevice('0'); // causes pattern to be executed not just stored

  if (sid != s) sendStrandSwitch(sid);
}

// sends current pattern to all selected strands
// always clears the device pattern stack first
// optionally stores the pattern to the device
// if dostore is false don't update modify flag
// else if undefined (not passed) then do set it
export const sendEntirePattern = (dostore) =>
{
  let cmdstr = cmdStr_Clear;
  const pattern = get(pStrand).curPatternStr;

  if (pattern !== '') cmdstr = cmdstr.concat(' ').concat(pattern);
  sendCmdToStrands(cmdstr, dostore);

  if (dostore !== false)
  {
    get(pStrand).modifyPattern = !dostore; // did modify if not stored
    pStrand.set(get(pStrand)); // triggers update to UI - MUST HAVE THIS
  }
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

  get(pStrand).modifyPattern = true;
  // don't need to force update here, while you do above ??
}
