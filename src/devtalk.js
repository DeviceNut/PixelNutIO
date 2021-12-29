import { get } from 'svelte/store';

import {
  SECS_NOTIFY_TIMEOUT,
  SECS_REPLY_TIMEOUT,
  PAGEMODE_DEVICES,
  curPageMode,
  curDevice,
  deviceList,
  isConnected,
  msgTitle,
  msgDesc  
 } from './globals.js';

 // Device Query/Responses:
 export const queryStr_GetInfo    = "?";        // returns device info in JSON format
 export const respStr_Rebooted    = "<Reboot>"  // indicates device just rebooted
 export const respStr_StartInfo   = "?<"        // indicates start of device info
 export const respStr_FinishInfo  = ">?"        // indicates end of device info

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

  tstamp: 0,            // timestamp(secs) of last notify

  failed: false,        // device communication failed
  ready: false,         // true if ready for controlling
                        // (all info retrieved successfully)
  active: false,        // true if being controlled now
                        // (only one device at a time)

  dinfo: {},            // holds raw JSON device output
  report: {}            // parsed device info object
};

export let deviceError = (text, title=null, device=null) =>
{
  if (title === null) title = 'Program Error';

  console.error(text == '' ? title : text);

  deviceStop(device);

  // setup error message title/text
  msgTitle.set(title);
  msgDesc.set(text);
}

// create timer for receiving a reply to a device query
let timer_reply = 0;
let reply_query = '';
let reply_device = null;

function timeout_reply()
{
  console.log(`No response from: ${reply_query}`);

  deviceError('', `Device "${reply_device.curname}" failed to answer query.`, reply_device);
}

function deviceQueryBegin(device, fsend)
{
  console.log('Requesting device info...');

  device.ready = false;
  device.active = false;
  device.failed = false;

  reply_device = device;
  fsend(device.curname, queryStr_GetInfo);

  timer_reply = setTimeout(timeout_reply, (1000 * SECS_REPLY_TIMEOUT));
}

function deviceStart(device)
{
  console.log(`Device ready: "${device.curname}"`)

  device.ready  = true;
  device.tstamp = curTimeSecs();

  deviceList.set(get(deviceList)); // trigger UI update
}

function deviceStop(device=null)
{
  // if device is currently being controlled,
  // return to the device discovery page

  console.log('devstop=', device);
  let curdev = get(curDevice);
  if (curdev !== null)
  {
    if (get(curPageMode) !== PAGEMODE_DEVICES)
      curPageMode.set(PAGEMODE_DEVICES);

    curdev.active = false;
    curDevice.set(null);

    //console.log(`Device stopped: ${curdev.curname}`);
  }

  if (device !== null)
  {
    deviceError(`Device failed: ${device.curname}`);

    device.failed = true;
    deviceList.set(get(deviceList)); // trigger UI update
  }
}

function curTimeSecs()
{
  return Math.floor(Date.now() / 1000); // convert to seconds
}

// create timer for receiving a connection notification
let timer_notify = 0;
function notify_check()
{
  let curlist = get(deviceList);
  if (curlist.length > 0)
  {
    let newlist = [];
    let tstamp = curTimeSecs();
    for (const device of curlist)
    {
      //console.log(`Checking: ${device.curname}`);
  
      // if device hasn't failed already and hasn't sent
      // a notification recently, mark as not present
      if (!device.failed &&
         ((device.tstamp + SECS_NOTIFY_TIMEOUT) < tstamp))
      {
        console.warn(`Device lost: ${device.curname}`);

        // if device is currently being controlled,
        // return to the device discovery page
        if (device.active) deviceStop();
      }
      else newlist.push(device);
    }

    deviceList.set(newlist);
  }

  timer_notify = setTimeout(notify_check, (1000 * SECS_NOTIFY_TIMEOUT));
}

export const onConnection = (enabled) =>
{
  if (enabled) notify_check();
  else
  {
    if (timer_notify)
    {
      clearTimeout(timer_notify);
      timer_notify = 0;
    } 

    deviceStop();
    deviceList.set([]);
  }

  isConnected.set(enabled);
}

export const onNotification = (msg, fsend) =>
{
  const info = msg.split(',');
  const name = info[0];

  //console.log(`Device="${name}" IP=${info[1]}`);

  for (const device of get(deviceList))
  {
    if (device.curname === name)
    {
      if (!device.failed) device.tstamp = curTimeSecs();

      return; // don't add this device
    }
    else if (device.newname === name)
    {
      console.log(`Renaming device: "${name}"`);

      device.curname = name;
      device.newname = '';
      device.tstamp = curTimeSecs();

      return; // don't add this device
    }
  }

  console.log(`Adding device: "${name}"`);

  let device = {...deviceState};
  device.curname = name;
  device.tstamp = curTimeSecs();
  get(deviceList).push(device);

  deviceList.set(get(deviceList)); // trigger UI update

  deviceQueryBegin(device, fsend);
}

export const onDeviceReply = (msg, fsend) =>
{
  //console.log(`Device reply: ${msg}`)

  if (timer_reply)
  {
    clearTimeout(timer_reply);
    timer_reply = 0;
  } 

  const reply = msg.split('\n');
  const name = reply[0];
  reply.shift();

  let device = null;
  const dlist = get(deviceList);
  for (const d of dlist)
  {
    //console.log('device: ', d);
    if (d.curname === name)
    {
      device = d;
      break;
    }
  }

  if (reply[0] === respStr_Rebooted)
  {
    console.log(`>> Received reboot from: ${name}`);
    if ((device != null) && device.active)
    {
      deviceStop();
      msgTitle.set('Device Rebooted');
      msgDesc.set('The device you were connected to just rebooted.');
      deviceQueryBegin(device, fsend); // restart query process
    }
    // else cannot interrupt query in progress
  }
  else if (device === null)
  {
    console.warn(`Ignoring reply from other device: ${name}`);
  }
  else if (device.ready)
  {
    console.warn(`Ignoring reply from current device: ${name}`);
  }
  else if (reply[0] === respStr_StartInfo)
  {
    console.log('Starting device info...');
    device.dinfo = '';
  }
  else if (reply[0] === respStr_FinishInfo)
  {
    console.log('...Ending device info');
    deviceStart(device);
    console.log(device.dinfo);
    console.log(JSON.parse(device.dinfo));
  }
  else
  {
    console.log(`<< ${reply[0]}`);
    device.dinfo += reply[0];
  }
}
