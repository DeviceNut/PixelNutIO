import { get } from 'svelte/store';

import {
  deviceList,
  msgTitle,
  msgDesc,
} from './globals.js';

import {
  deviceError,
  deviceReset,
} from './device.js';

// Device Query/Responses:
const queryStr_GetInfo    = "?";        // returns device info in JSON format
const respStr_Rebooted    = "<Reboot>"  // indicates device just rebooted
const respStr_CmdFailed   = "<CmdFail>" // indicates device command failed
const respStr_StartInfo   = "?<"        // indicates start of device info
const respStr_FinishInfo  = ">?"        // indicates end of device info
const strlen_CmdFailed    = respStr_CmdFailed.length;
                                        // device states:
const QSTATE_NONE         = 0;          //  not querying device now
const QSTATE_RESTART      = 1;          //  resend query on next notify
const QSTATE_WAIT_QUERY   = 2;          //  waiting for response to query
const QSTATE_WAIT_DATA    = 3;          //  waiting for more data

export const devQuery = (device) =>
{
  if ((device.qstate === undefined) || (device.qstate === QSTATE_RESTART))
  {
    console.log(`SendQuery: "${device.curname}"`, device.qstate ?? '');

    device.qstate = QSTATE_WAIT_QUERY;
    device.send(queryStr_GetInfo, device.curname);

    // TODO: timeout if not valid response in 10 seconds
  }
}

export const devReply = (device, reply) =>
{
  if (reply === respStr_Rebooted)
  {
    console.log(`Device Reboot: "${device.curname}"`);

    if (device.active)
    {
      // trigger error message title/text
      msgDesc.set('The device you were using just restarted.');
      msgTitle.set('Device Restart');

      deviceReset(device);
      return false;
    }
    else if (device.ready)
    {
      device.ready = false;
      device.qstate = QSTATE_RESTART;
    }
  }
  else if (reply.slice(0,strlen_CmdFailed) === respStr_CmdFailed)
  {
    let errstr = reply.slice(respStr_CmdFailed.length);
    deviceError(`Device failed command: ${errstr}`, 'Device Error');
    return false;
  }
  else if (reply === respStr_StartInfo)
  {
    if (device.qstate !== QSTATE_WAIT_QUERY)
         console.log('Recognize query response');
    else console.log('Receiving query response...');

    device.qstate = QSTATE_WAIT_DATA;
    device.dinfo = '';
  }
  else if ((device.qstate === QSTATE_WAIT_DATA) &&
            (reply === respStr_FinishInfo))
  {
    //console.log('...Ending query response');
    try
    {
      device.report = JSON.parse(device.dinfo);
      device.dinfo = ''; // done with input string

      device.qstate = QSTATE_NONE;
      device.ready = true;

      console.log(`Device Ready: "${device.curname}" `)
      console.log(`Device Version: ${device.report.version}`);
      // console.log(device.report); // DEBUG
    }
    catch(e)
    {
      console.error(`Device Parse Error: "${device.curname}" JSON=${device.dinfo}`);
      device.ignore = true;
      return false;
    }
    
    // triggers update to UI - MUST HAVE THIS
    deviceList.set(get(deviceList));
  }
  else if (device.qstate === QSTATE_WAIT_DATA)
  {
    // console.log(`<< ${reply}`);
    device.dinfo += reply;
  }
  else console.warn(`Device Ignore: "${device.curname}" reply=${reply}`);

  return true;
}
