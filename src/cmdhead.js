import { get } from 'svelte/store';

import { curDevice } from './globals.js';

import {
  sendCmdToDevice,
  sendStrandCmd,
} from './cmdsend.js';

///////////////////////////////////////////////////////////

export const userSetDevname = (devname) =>
{
  const device = get(curDevice);
  if (device !== null)
  {
    if (devname !== device.curname)
    {
      if (!/[`,/\\]/.test(devname))
      {
        device.newname = devname;
        sendCmdToDevice(cmdStr_DeviceName.concat(devname));
        return true;
      }
      else return false;
    }
  }

  return true;
}

export const userSendPause = (enable) =>
{
  sendStrandCmd(enable ? cmdStr_Pause : cmdStr_Resume);
}
