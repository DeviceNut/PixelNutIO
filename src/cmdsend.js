import { get } from 'svelte/store';

import {
  convTrackLayerToIndex,
} from './strands.js';

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

// stores both the current pattern string and name
// to the device flash, and then starts it
function sendStoreExecPattern()
{
  const patstr = get(pStrand).curPatternCmd;
  let patname = get(pStrand).curPatternName;

  if (patstr !== '')
  {
    sendCmdToDevice(cmdStr_FlashPatStr  + patstr);
    sendCmdToDevice(cmdStr_FlashPatName + patname);
    sendCmdToDevice(cmdStr_ExecFromFlash);
  }
  else sendCmdToDevice(cmdStr_ClearPattern);
}

// sends current pattern to just the specified strand
// if not currently selected one switch back and forth
export const sendPatternToStrand = (s) =>
{
  let sid = get(idStrand);
  if (sid !== s) sendStrandSwitch(s);
  sendStoreExecPattern();
  if (sid !== s) sendStrandSwitch(sid);
}

// sends command/pattern to all selected strands
// if no string is passed:
//   stores/executes current name/pattern
// else: just sends command
// stores the pattern/name to the device flash,
// and then executes that pattern
export const sendStrandPattern = (cmdstr=null) =>
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

      if (!cmdstr)
           sendStoreExecPattern();
      else sendCmdToDevice(cmdstr);
    }
  }

  if (didswitch && (lastid != sid))
    sendStrandSwitch(sid)
}

// send top level command (and optional value)
// to all selected strands
export const sendStrandCmd = (cmdstr, cmdval) =>
{
  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

  sendStrandPattern(cmdstr);
}

// send layer-specific command/(value) to all selected strands
// returns true if actually sent the command
export const sendLayerCmd = (track, layer, cmdstr, cmdval) =>
{
  //console.log(`${track}.${layer}: ${cmdstr+(cmdval===undefined?'':cmdval)}`);

  if (!get(pStrand).tracks[track].layers[layer].isnewstr) // pattern already sent
  {
    console.log(`-- ${cmdStr_AddrLayer}${devindex} ${cmdstr+(cmdval===undefined?'':cmdval)}`);
    return false;
  }

  let devindex = convTrackLayerToIndex(track, layer);
  if (devindex == null) return false; // error pending

  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

  sendStrandPattern(`${cmdStr_AddrLayer}${devindex} ${cmdstr}`);
  return true;
}

// always layer-specific command/(value) to all selected strands
export const sendLayerCmdForce = (track, layer, cmdstr, cmdval) =>
{
  let devindex = convTrackLayerToIndex(track, layer);
  if (devindex == null) return; // error pending

  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

  sendStrandPattern(`${cmdStr_AddrLayer}${devindex} ${cmdstr}`);
}
