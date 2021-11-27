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
// to the device flash, and optionally starts it
function sendStoreExecPattern()
{
  const patstr = get(pStrand).curPatternStr;
  let patname = get(pStrand).curPatternName;
  if (patstr === '') patname = '';

  sendCmdToDevice(cmdStr_FlashPatStr  + patstr);
  sendCmdToDevice(cmdStr_FlashPatName + patname);
  sendCmdToDevice(cmdStr_ExecFromFlash);
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
function sendCmdToStrands(cmdstr)
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

// sends current pattern to all selected strands,
// stores the pattern/name to the device flash,
// and then executes that pattern
export const sendStrandPattern = () =>
{
  sendCmdToStrands(null);
}

// send top level command (and optional value)
// to all selected strands
export const sendStrandCmd = (cmdstr, cmdval) =>
{
  if (cmdval) cmdstr = cmdstr.concat(cmdval);

  sendCmdToStrands(cmdstr);
}

// send layer-specific command (and optional value)
// to all selected strands
export const sendLayerCmd = (devindex, cmdstr, cmdval) =>
{
  if (cmdval !== undefined)
    cmdstr = cmdstr.concat(cmdval);

  sendCmdToStrands(`${cmdStr_AddrLayer}${devindex} ${cmdstr}`);
}
