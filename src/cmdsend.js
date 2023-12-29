import { get } from 'svelte/store';

import {
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  curDevice
} from './globals.js';

import {
  cmdStr_FlashPatStr,
  cmdStr_FlashPatName,
  cmdStr_ExecFromFlash,
  cmdStr_ClearPattern,
  cmdStr_AddrStrand,
  cmdStr_AddrLayer
} from './devcmds.js';

import {
  convTrackLayerToIndex,
} from './strands.js';

///////////////////////////////////////////////////////////

export const sendCmdToDevice = (cmdstr) =>
{
  let device = get(curDevice);

  if (device !== null)
    device.send(device.curname, cmdstr);

  else console.warn(`Device null on send: ${cmdstr}`);
}

export const sendStrandSwitch = (s) =>
{
  sendCmdToDevice(cmdStr_AddrStrand.concat(s));
}

// stores both the current pattern string and name
// to the device flash, and then starts it
function sendStoreExecPattern(doexec)
{
  const strand = get(pStrand);
  const patstr = strand.curPatternCmd;
  let patname = strand.curPatternName;

  if (patstr !== '')
  {
    sendCmdToDevice(cmdStr_FlashPatName + patname);
    sendCmdToDevice(cmdStr_FlashPatStr  + patstr);

    if (doexec) sendCmdToDevice(cmdStr_ExecFromFlash);
  }
  else sendCmdToDevice(cmdStr_ClearPattern);

  strand.modified = false; // strand has now been saved
}

// sends current pattern to just the specified strand
// if not currently selected one switch back and forth
export const sendPatternToStrand = (s) =>
{
  let sid = get(idStrand);
  if (sid !== s) sendStrandSwitch(s);
  sendStoreExecPattern(true);
  if (sid !== s) sendStrandSwitch(sid);
}

// stores current name/pattern to the device flash and then
// optionally executes that pattern, for all selected strands
export const sendStrandPattern = (doexec=true) =>
{
  const sid = get(idStrand);
  let didswitch = false;
  let lastid = sid;

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      if ((s != sid) || didswitch)
      {
        sendStrandSwitch(s)
        didswitch = true;
        lastid = s;
      }

      sendStoreExecPattern(doexec);
    }
  }

  if (didswitch && (lastid != sid))
    sendStrandSwitch(sid)
}

// stores current name to the device flash for all selected strands
export const sendStrandName = () =>
{
  const sid = get(idStrand);
  let didswitch = false;
  let lastid = sid;

  const strand = get(pStrand);
  let patname = strand.curPatternName;

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      if ((s != sid) || didswitch)
      {
        sendStrandSwitch(s)
        didswitch = true;
        lastid = s;
      }

      sendCmdToDevice(cmdStr_FlashPatName + patname);
    }
  }

  if (didswitch && (lastid != sid))
    sendStrandSwitch(sid)
}

// sends command to all selected strands
function sendCmdToAllStrands(cmdstr)
{
  const sid = get(idStrand);
  let didswitch = false;
  let lastid = sid;

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      if ((s != sid) || didswitch)
      {
        sendStrandSwitch(s)
        didswitch = true;
        lastid = s;
      }

      sendCmdToDevice(cmdstr);
    }
  }

  if (didswitch && (lastid != sid))
    sendStrandSwitch(sid)
}

// send command (and optional value) to all selected strands
export const sendStrandCmd = (cmdstr, cmdval) =>
{
  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

    sendCmdToAllStrands(cmdstr);
}

// send layer-specific command/(value) to all selected strands
export const sendLayerCmd = (track, layer, cmdstr, cmdval) =>
{
  if (get(pStrand).tracks[track].layers[layer].isnewstr) // pattern already sent
  {
    let devindex = convTrackLayerToIndex(track, layer);
    if (devindex == null) return; // error pending
  
    if (cmdval !== undefined)
      cmdstr = cmdstr.concat(cmdval);
  
      sendCmdToAllStrands(`${cmdStr_AddrLayer}${devindex} ${cmdstr}`);
  }
  /*
  else
  {
    // for debug:
    let devindex = convTrackLayerToIndex(track, layer);
    if (devindex != null)
      console.log(`-- ${cmdStr_AddrLayer}${devindex} ${cmdstr+(cmdval===undefined?'':cmdval)}`);
  }
  //*/
}

// always layer-specific command/(value) to all selected strands
export const sendLayerCmdForce = (track, layer, cmdstr, cmdval) =>
{
  let devindex = convTrackLayerToIndex(track, layer);
  if (devindex == null) return; // error pending

  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

    sendCmdToAllStrands(`${cmdStr_AddrLayer}${devindex} ${cmdstr}`);
}
