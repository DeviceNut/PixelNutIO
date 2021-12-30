import { get } from 'svelte/store';

import {
  SECS_RESPONSE_TIMEOUT,
  MAX_DEVICE_FAIL_COUNT,
  PAGEMODE_DEVICES,
  curPageMode,
  curDevice,
  deviceList,
  isConnected,
  msgTitle,
  msgDesc  
 } from './globals.js';

 // Device Query/Responses:
const queryStr_GetInfo    = "?";        // returns device info in JSON format
const respStr_Rebooted    = "<Reboot>"  // indicates device just rebooted
const respStr_StartInfo   = "?<"        // indicates start of device info
const respStr_FinishInfo  = ">?"        // indicates end of device info

                                        // device states:
const DSTATE_NONE         = 0;          //  invalid state
const DSTATE_DO_QUERY     = 1;          //  query on next notify
const DSTATE_WAIT_RESP    = 2;          //  waiting for response
const DSTATE_WAIT_DATA    = 3;          //  waiting for more data
const DSTATE_READY        = 4;          //  ready for control
const DSTATE_ACTIVE       = 5;          //  being controlled

/*
// format of each custom device pattern object:
{
  id: 0,                // index into this list
  text: '',             // user name of pattern
  pcmd: '',             // pattern command string
  desc: []              // pattern description array
}

// format of each custom device effect object:
{
  id: 0,                // global unique effect ID
  bits: 0x00,           // pluginBit_ values
  text: '',             // user name for effect
  desc: ''              // effect description
}

// format of each device strand info object:
{
  pixels: 0,            // number of pixels
  bright: 0,            // brightness percent
  delay: 0,             // delay msecs +/- MAX_DELAY
  force: 0,             // force (0-MAX_FORCE_VALUE)
  first: 1,             // first pixel to draw (from 1)
                        // extern mode:
  xt_mode: false,       //  enabled=1
  xt_hue: 0,            //  hue property (0-359)
  xt_white: 0,          //  white property (percent)
  xt_count: 0,          //  count property (percent)

  patname: ''           // pattern name
  patstr: '',           // pattern string
}

// format of each device info object:
{
  nstrands: 0,          // strand count (>= 1)
  npatterns: 0,         // custom device patterns
  nplugins: 0,          // custom device plugins

  maxstrlen: 0,         // max length for cmds/patterns
  numtracks: 0,         // number of tracks available
  numlayers: 0,         // number of layers available

  strands: [],          // list of strand info
  patterns: [],         // list of pattern info
  effects: [],          // list of effect info
}
*/

// state of each device found
export const deviceState =
{
  curname: '',          // used as topic to talk to device
  newname: '',          // used when renaming the device

  dstate: DSTATE_NONE,  // current state of this device
  failcount: 0,         // number of protocol failures
  ignore: false,        // true to ignore this device
  ready: false,         // true to stop spinner on UI

  tstamp: 0,            // timestamp of last notify/response
  fsend: null,          // function to send message to device

  dinfo: {},            // holds raw JSON device output
  report: {}            // parsed device info object
};

function curTimeSecs()
{
  return Math.floor(Date.now() / 1000); // convert to seconds
}

export let deviceError = (text, title=null) =>
{
  if (title === null) title = 'Program Error';

  console.error(text == '' ? title : text);

  // trigger error message title/text
  msgDesc.set(text);
  msgTitle.set(title);

  deviceReset();

  // set state to send new device query
  device.dstate = DSTATE_DO_QUERY;
  device.ready = false;
}

// reset currently active device and return to the discovery page
function deviceReset()
{
  let device = get(curDevice);
  if (device !== null)
  {
    if (get(curPageMode) !== PAGEMODE_DEVICES)
      curPageMode.set(PAGEMODE_DEVICES);

    curDevice.set(null);

    // triggers update to UI - MUST HAVE THIS
    deviceList.set(get(deviceList));
  }
}

function deviceQuery(device)
{
  console.log(`Device Query: "${device.curname}"`)

  device.dstate = DSTATE_WAIT_RESP;
  device.tstamp = curTimeSecs();

  device.fsend(device.curname, queryStr_GetInfo);
}

// create timer for receiving a connection notification
// if device doesn't respond in time, stop and remove it
let timeObj = 0;
function checkTimeout()
{
  let curlist = get(deviceList);
  if (curlist.length > 0)
  {
    let newlist = [];
    let tstamp = curTimeSecs();
    for (const device of curlist)
    {
      //console.log(`Device Check: "${device.curname}""`);
  
      if (!device.ignore &&
         ((device.tstamp + SECS_RESPONSE_TIMEOUT) < tstamp))
      {
        console.warn(`Device Lost: "${device.curname}"`);

        if (device.dstate === DSTATE_ACTIVE)
          deviceReset();
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
    if (timeObj)
    {
      clearTimeout(timeObj);
      timeObj = 0;
    } 

    deviceList.set([]);
  }

  isConnected.set(enabled);
}

export const onNotification = (msg, fsend) =>
{
  const info = msg.split(',');
  const name = info[0];

  //console.log(`Device Notify: "${name}" IP=${info[1]}`);

  for (const device of get(deviceList))
  {
    if (device.ignore) continue;

    if (device.curname === name)
    {
      if (device.dstate == DSTATE_DO_QUERY)
        deviceQuery(device);

      else device.tstamp = curTimeSecs();
      return; // don't add this device
    }
    else if (device.newname === name)
    {
      console.log(`Device Rename: "${name}"`);

      device.curname = name;
      device.newname = '';

      device.tstamp = curTimeSecs();
      return; // don't add this device
    }
  }

  console.log(`Device Add: "${name}"`);

  let device = {...deviceState};
  device.curname = name;
  device.fsend = fsend;
  get(deviceList).push(device);

  deviceQuery(device);

  // triggers update to UI - MUST HAVE THIS
  deviceList.set(get(deviceList));
}

export const onDeviceReply = (msg) =>
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

  if (device !== null)
  {
    if (device.ignore) return;

    device.tstamp = curTimeSecs();

    if (reply[0] === respStr_Rebooted)
    {
      console.log(`>> Device Reboot: "${name}"`);

      let doquery = false;

      if (device.dstate === DSTATE_ACTIVE)
      {
        // trigger error message title/text
        msgDesc.set('The device you were connected to just rebooted.');
        msgTitle.set('Device Rebooted');

        deviceReset();
        doquery = true;
      }
      else if (device.dstate === DSTATE_READY)
        doquery = true;

      if (doquery)
      {
        // set state to send new device query
        device.dstate = DSTATE_DO_QUERY;
        device.ready = false;
      }
      return;
    }
    else if (device.dstate === DSTATE_WAIT_RESP)
    {
      if (reply[0] === respStr_StartInfo)
      {
        //console.log('Starting device info...');
        device.dstate = DSTATE_WAIT_DATA;
        device.dinfo = '';
        return;
      }
    }
    else if (device.dstate === DSTATE_WAIT_DATA)
    {
      if (reply[0] === respStr_FinishInfo)
      {
        //console.log('...Ending device info');
        try
        {
          device.report = JSON.parse(device.dinfo);
          device.dstate = DSTATE_READY;
          device.ready = true;

          console.log(`Device Ready: "${device.curname}"`)
          console.log(device.report);
        
          // triggers update to UI - MUST HAVE THIS
          deviceList.set(get(deviceList));
        }
        catch (e)
        {
          console.warn(`Device Fail: "${device.curname}" JSON=${device.dinfo}`);

          if (++device.failcount > MAX_DEVICE_FAIL_COUNT)
            device.ignore = true;
        }
      }
      else
      {
        //console.log(`<< ${reply[0]}`);
        device.dinfo += reply[0];
      }
      return;
    }
  }

  console.warn(`>> Device Ignore: "${name}" reply=${reply[0]}`);
}
