import { get } from 'svelte/store';

import {
  SECS_RESPONSE_TIMEOUT,
  MAX_DEVICE_FAIL_COUNT,
  deviceList,
  msgTitle,
  msgDesc,
  curTimeSecs
} from './globals.js';

import {
  deviceAdd,
  deviceError,
} from './device.js';

import { devStart } from './devstart.js';

// Device Query/Responses:
const queryStr_GetInfo    = "?";        // returns device info in JSON format
const respStr_Rebooted    = "<Reboot>"  // indicates device just rebooted
const respStr_CmdFailed   = "<CmdFail>" // indicates device command failed
const respStr_StartInfo   = "?<"        // indicates start of device info
const respStr_FinishInfo  = ">?"        // indicates end of device info
const strlen_CmdFailed    = respStr_CmdFailed.length;
                                        // device states:
const QSTATE_NONE         = 0;          //  not querying device now
const QSTATE_RESTART      = 1;          //  restart query on next notify
const QSTATE_WAIT_RESP    = 2;          //  waiting for response (to command sent from here)
const QSTATE_WAIT_DATA    = 3;          //  waiting for more data

function NewDevice(name, sendfun)
{
  const device = deviceAdd(name);
  console.log('NewDevice:', device);

  // add specific to this protocol members:

  device.qstate = QSTATE_RESTART;
  device.tstamp = curTimeSecs(); // last notify/response

  device.failcount = 0; // number of protocol failures
  device.dinfo = {}; // holds raw JSON device output

  device.query = sendQuery;
  device.start = devStart;
  device.send = sendfun;

  return device;
}

export const sendQuery = (device) =>
{
  //console.log(`sendQuery: "${device.curname}"`)

  device.qstate = QSTATE_WAIT_RESP;
  device.send(queryStr_GetInfo, device.curname);
}

// create timer for receiving a connection notification
// if device doesn't respond in time, stop and remove it
let timeObj = 0;
//let oldts = curTimeSecs();
function checkTimeout()
{
  let curlist = get(deviceList);
  if (curlist.length > 0)
  {
    let newlist = [];
    let tstamp = curTimeSecs();

    /*
    let diff = (tstamp - oldts);
    if (diff > SECS_RESPONSE_TIMEOUT)
      console.log(`${tstamp} TimerDiff = ${diff}`);
    oldts = tstamp;
    */
    for (const device of curlist)
    {
      //console.log(`Device Check: "${device.curname}""`);

      //if ((tstamp - device.tstamp) > 2)
      //  console.log(`Device Check? secs=${(tstamp - device.tstamp)}`);

      if (!device.ignore &&
          ((device.tstamp + SECS_RESPONSE_TIMEOUT) < tstamp))
      {
        console.warn(`Device Lost: "${device.curname}"`);
        //console.log(`  secs: ${tstamp} ${device.tstamp}`)

        if (device.active)
        {
          // trigger error message title/text
          msgDesc.set('The device you were using just disconnected.');
          msgTitle.set('Device Disconnect');

          device.reset(device);
        }
      }
      else newlist.push(device);
    }

    deviceList.set(newlist);
  }

  timeObj = setTimeout(checkTimeout, (1000 * SECS_RESPONSE_TIMEOUT));
}

// if lose connection, clear devices
export const onConnection = (enabled) =>
{
  if (enabled) checkTimeout();
  else
  {
    //console.log('Removing all devices');
    deviceList.set([]);

    if (timeObj)
    {
      clearTimeout(timeObj);
      timeObj = 0;
    } 
  }
}

export const onNotification = (msg, sendfun) =>
{
  const info = msg.split(',');
  const name = info[0];

  //console.log(`Device Notify: "${name}" IP=${info[1]}`);

  for (const device of get(deviceList))
  {
    /*
    let tstamp = curTimeSecs();
    if ((tstamp - device.tstamp) > 2)
      console.log(`Missing notifications? secs=${(tstamp - device.tstamp)}`);
    */
    device.tstamp = curTimeSecs();

    if (device.curname === name)
    {
      if (!device.ignore)
      {
        if (device.qstate === QSTATE_RESTART)
        sendQuery(device);
      }
      return; // don't add
    }
    else if (device.newname === name)
    {
      console.log(`Device Rename: "${name}"`);

      device.curname = name;
      device.newname = '';

      return; // don't add
    }
  }

  let device = NewDevice(name, sendfun);

  sendQuery(device);
}

export const onDeviceReply = (msg, sendfun) =>
{
  //console.log(`Device Reply: ${msg}`)

  const reply = msg.split('\n');
  const name = reply[0];
  reply.shift();

  let device = null;
  const dlist = get(deviceList);
  for (const d of dlist)
  {
    if (d.curname === name)
    {
      device = d;
      break;
    }
  }

  if (device === null)
  {
    device = NewDevice(name, sendfun);
    // don't query: might already be doing so
  }

  if (device.ignore) return;

  device.tstamp = curTimeSecs();

  if (reply[0] === respStr_Rebooted)
  {
    console.log(`Device Reboot: "${name}"`);

    if (device.active)
    {
      // trigger error message title/text
      msgDesc.set('The device you were using just restarted.');
      msgTitle.set('Device Restart');

      device.reset(device);
    }
    else if (device.ready)
    {
      device.ready = false;
      device.qstate = QSTATE_RESTART;
    }
  }
  else if (reply[0].slice(0,strlen_CmdFailed) === respStr_CmdFailed)
  {
    let errstr = reply[0].slice(respStr_CmdFailed.length);
    deviceError(`Device failed command: ${errstr}`, 'Device Error');
  }
  else if (reply[0] === respStr_StartInfo)
  {
    if (device.qstate !== QSTATE_WAIT_RESP)
         console.log('Recognize query response');
    else console.log('Receiving query response...');

    device.qstate = QSTATE_WAIT_DATA;
    device.dinfo = '';
  }
  else if ((device.qstate === QSTATE_WAIT_DATA) &&
            (reply[0] === respStr_FinishInfo))
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
      //console.log(device.report);
    }
    catch(e)
    {
      console.warn(`Device Parse Error: "${device.curname}" JSON=${device.dinfo}`);

      if (++device.failcount >= MAX_DEVICE_FAIL_COUNT)
      {
        console.error(`Device Failed, Ignoring: "${device.curname}"`);
        device.ignore = true;
      }
      else device.qstate = QSTATE_RESTART;
    }
    
    // triggers update to UI - MUST HAVE THIS
    deviceList.set(get(deviceList));
  }
  else if (device.qstate === QSTATE_WAIT_DATA)
  {
    //console.log(`<< ${reply[0]}`);
    device.dinfo += reply[0];
  }
  else console.warn(`Device Ignore: "${name}" reply=${reply[0]}`);
}
