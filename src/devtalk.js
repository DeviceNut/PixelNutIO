import { get } from 'svelte/store';

import {
  SECS_RESPONSE_TIMEOUT,
  MAX_DEVICE_FAIL_COUNT,
  curDevice,
  deviceList,
  msgTitle,
  msgDesc,
  curTimeSecs
 } from './globals.js';

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
const QSTATE_WAIT_RESP    = 2;          //  waiting for response
const QSTATE_WAIT_DATA    = 3;          //  waiting for more data

/*
// format of each custom device pattern object:
{
  name: '',             // user name for pattern
  desc: '',             // description string
  pcmd: ''              // command string
}

// format of each custom device plugin object:
{
  name: '',             // user name for plugin
  desc: ''              // description string
  bits: 0x00,           // pluginBit_ values
  id: 0,                // globally unique ID
}

// format of strand info object sent from device:
{
  pixels: 0,            // number of pixels
  bright: 0,            // brightness percent
  delay: 0,             // delay msecs +/- MAX_DELAY
  first: 1,             // first pixel to draw (from 1)
                        // extern mode:
  xt_mode: false,       //  enabled=1
  xt_hue: 0,            //  hue property (0-359)
  xt_white: 0,          //  white property (percent)
  xt_count: 0,          //  count property (percent)

  patname: ''           // pattern name
  patstr: '',           // pattern string
}

// format of info object sent from device:
{
  nstrands: 0,          // strand count (>= 1)
  npatterns: 0,         // custom device patterns
  nplugins: 0,          // custom device plugins

  maxstrlen: 0,         // max length for cmds/patterns
  numtracks: 0,         // number of tracks available
  numlayers: 0,         // number of layers available

  strands: [],          // list of strand info
  patterns: [],         // list of pattern info
  plugins: [],          // list of plugin info
}
*/

// state of each device found
export const deviceState =
{
  curname: '',          // used as topic to talk to device
  newname: '',          // used when renaming the device

  tstamp: 0,            // secs of last notify/response
  qstate: QSTATE_NONE,  // query state of this device

  failcount: 0,         // number of protocol failures
  ignore: false,        // true to ignore this device

  ready: false,         // true to stop spinner on UI
  active: false,        // true after user selected

  dinfo: {},            // holds raw JSON device output
  report: {}            // parsed device info object
};

export let deviceQuery = (device, fsend) =>
{
  //console.log(`Device Query: "${device.curname}"`)

  device.qstate = QSTATE_WAIT_RESP;
  fsend(device.curname, queryStr_GetInfo);
}

export let deviceError = (text, title=null) =>
{
  if (title === null) title = 'Program Error';

  console.error(text == '' ? title : text);

  // trigger error message title/text
  msgDesc.set(text);
  msgTitle.set(title);

  deviceReset(true);
}

// reset currently active device
function deviceReset(remove)
{
  let device = get(curDevice);
  if (device && device.active)
  {
    console.log(`Device Reset: "${device.curname}`);

    curDevice.set(null);

    if (remove)
    {
      let newlist = [];

      for (const d of get(deviceList))
      {
        if (d.curname === device.curname)
        {
          console.log(`Device Remove: "${device.curname}`);
        }
        else newlist.push(device);
      }

      deviceList.set(newlist);
    }
  }
}

function deviceAdd(name)
{
  console.log(`Device Add: "${name}"`);

  let device = {...deviceState};
  device.curname = name;
  device.tstamp = curTimeSecs();
  device.qstate = QSTATE_RESTART;
  get(deviceList).push(device);

  return device;
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

          deviceReset(false);
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
  //oldts = curTimeSecs();

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

export const onNotification = (msg, fsend) =>
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
          deviceQuery(device, fsend);
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

  let device = deviceAdd(name);

  deviceQuery(device, fsend);
}

export const onDeviceReply = (msg, fsend) =>
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
    device = deviceAdd(name);
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

      deviceReset(true);
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
  else if ((device.qstate === QSTATE_WAIT_RESP) && (reply[0] === respStr_StartInfo))
  {
    //console.log('Starting device info...');
    device.qstate = QSTATE_WAIT_DATA;
    device.dinfo = '';
  }
  else if ((device.qstate === QSTATE_WAIT_DATA) && (reply[0] === respStr_FinishInfo))
  {
    //console.log('...Ending device info');
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
