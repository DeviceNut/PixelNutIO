import { get } from 'svelte/store';

import {
  PAGEMODE_DEVICES,
  curPageMode,
  curDevice,
  MIN_TRACKS,
  MIN_TRACK_LAYERS,
  deviceList,
  isConnected
 } from './globals.js';

import { mqttSend } from './mqtt.js';

// Query commands:
export const cmdStr_GetDevInfo    = "?";    // returns info on device
export const cmdStr_GetPatInfo    = "?P";   // returns info on custom patterns
export const cmdStr_GetPlugInfo   = "?G";   // returns info on custom plugins

export const strandState =
{
  pixels: 0,          // number of pixels
  bright: 0,          // brightness percent
  delay: 0,           // delay percent
  force: 0,           // force (0-MAX_FORCE)
  first: 1,           // first pixel to draw (from 1)
  direct: 0,          // direction flag 0/1

                      // extern mode:
  xt_mode: 0,         //  enabled=1
  xt_hue: 0,          //  hue property (0-359)
  xt_white: 0,        //  white property (percent)
  xt_count: 0,        //  count property (percent)

  patnum: 0,          // pattern number (not used?)
  pattern: ''         // pattern string
};

export const deviceInfo =
{
  name: '',           // used as topic to talk to device
  tstamp: 0,          // timestamp(secs) of last notify
  query: 0,           // state of query commands (QUERY_xxx)
  ready: false,       // true if ready for controlling
                      // (all info retrieved successfully)
  active: false,      // true if being controlled now
                      // (only one device at a time)
  report:             // reported capabilities & state
  {
    scount: 0,        // strand count (>= 1)
    maxlen: 0,        // max length for cmds/patterns
    numtracks: 0,     // number of tracks available
    numlayers: 0,     // number of layers available
    strands: [],      // list of 'strandState'
  }
};

const QUERY_DEVICE        = 1;  // waiting for device info reply
const QUERY_PATTERNS      = 2;  // waiting for patterns info reply
const QUERY_PLUGINS       = 3;  // waiting for plugins info reply

const SECS_NOTIFY_TIMEOUT = 7;  // secs since last notify to clear active status

function deviceStop()
{
  let curdev = get(curDevice);
  if (curdev != null)
  {
    if (get(curPageMode) != PAGEMODE_DEVICES)
      curPageMode.set(PAGEMODE_DEVICES);

    curdev.active = false;
    curDevice.set(null);
  }
}

function curTimeSecs()
{
  return Math.floor(Date.now() / 1000); // convert to seconds
}

let checker = 0;
function startcheck()
{
  let curlist = get(deviceList);
  if (curlist.length > 0)
  {
    let newlist = [];
    let tstamp = curTimeSecs();
    for (const device of curlist)
    {
      //console.log(`Checking: ${device.name}`);
  
      // if device still present but hasn't sent a
      // notification recently, mark as not present
      if ((device.tstamp + SECS_NOTIFY_TIMEOUT) < tstamp)
      {
        console.log(`Device lost: ${device.name}`)

        // if device is currently being controlled,
        // return to the device discovery page
        if (device.active) deviceStop();
      }
      else newlist.push(device);
    }

    deviceList.set(newlist);
  }

  checker = setTimeout(startcheck, (1000 * SECS_NOTIFY_TIMEOUT));
}

export const onConnection = (enabled) =>
{
  if (enabled) startcheck();
  else
  {
    if (checker)
    {
      clearTimeout(checker);
      checker = 0;
    } 

    deviceList.set([]);

    deviceStop();
  }

  isConnected.set(enabled);
}

export const onNotification = (msg) =>
{
  const info = msg.split(',');
  const name = info[0];

  //console.log(`Device="${name}" IP=${info[1]}`);

  for (const device of get(deviceList))
  {
    if (device.name === name)
    {
      device.tstamp = curTimeSecs();
      return; // update time, done
    }
  }

  console.log(`Adding device: "${name}"`);

  let device = {...deviceInfo};
  device.name = name;
  device.tstamp = curTimeSecs();
  get(deviceList).push(device);

  console.log('Requesting device info...');

  mqttSend(name, cmdStr_GetDevInfo);
  device.query = QUERY_DEVICE;
}

export const onCommandReply = (msg) =>
{
  console.log(`Device reply: ${msg}`)

  const reply = msg.split('\n');
  const name = reply[0];

  let device = null;
  const dlist = get(deviceList);
  for (const d of dlist)
  {
    console.log('device: ', d);
    if (d.name === name)
    {
      device = d;
      break;
    }
  }

  if (device != null)
  {
    switch (device.query)
    {
      case QUERY_DEVICE:
      {
        reply.shift();
        if (parseDeviceInfo(device, reply))
        {
          device.ready = true;
          console.log(`Device ready: "${device.name}"`)
          deviceList.set(get(deviceList)); // trigger UI update

          //mqttSend(name, cmdStr_GetPatInfo); TODO
        }
        else deviceStop();
        break;
      }
      case QUERY_PATTERNS: // TODO
      {
        reply.shift();
        if (parsePatternInfo(device, reply))
        {
          mqttSend(name, cmdStr_GetPlugInfo);
        }
        else deviceStop();
        break;
      }
      case QUERY_PLUGINS: // TODO
      {
        reply.shift();
        if (parsePluginInfo(device, reply))
        {
          device.ready = true;
          console.log(`Device ready: "${device.name}"`)
          deviceList.set(get(deviceList)); // trigger UI update
        }
        else deviceStop();
        break;
      }
      default:
      {
        console.error(`Unexpected query state: ${device.query} for reply: ${msg}`)
        break;        
      }
    }
  
  }
  else console.error(`No device found: "${name}"`);
}

function parseDeviceInfo(device, reply)
{
  let line, strs, strand;

  line = reply[0];
  reply.shift();

  strs = line.split(' ');
  if (strs.length < 4)
  {
    console.error(`Unexpected parm count (line 2): "${strs.length}"`);
    return false;
  }

  device.report.scount = strs[0];
  device.report.maxlen = strs[1];
  device.report.numlayers = strs[2];
  device.report.numtracks = strs[3];

  if (device.report.scount < 1)
  {
    console.error(`Bad strand count: "${scount}"`);
    return false;
  }

  if (device.report.numtracks < MIN_TRACKS)
  {
    console.error(`Not enough tracks: ${device.report.numtracks}`);
    return false;
  }

  if (device.report.numlayers < (MIN_TRACKS * MIN_TRACK_LAYERS))
  {
    console.error(`Not enough tracks: ${device.report.numlayers}`);
    return false;
  }

  // 3 parm lines per strand
  if (reply.length !== (device.report.scount * 3))
  {
    console.error(`Unexpected strand line count: "${reply.length}"`);
    return false;
  }

  device.report.strands = [];

  for (var i = 0; i < device.report.scount; ++i)
  {
    line = reply[0];
    reply.shift();

    strs = line.split(' ');
    if (strs.length < 5)
    {
      console.error(`Unexpected parm count (s1): "${strs.length}"`);
      return false;
    }

    strand = {...strandState};

    strand.pixels = parseInt(strs[0]);
    strand.bright = parseInt(strs[1]);
    strand.delay  = parseInt(strs[2]);
    strand.first  = parseInt(strs[3]);
    strand.direct = parseInt(strs[4]);

    line = reply[0];
    reply.shift();

    strs = line.split(' ');
    if (strs.length < 6)
    {
      console.error(`Unexpected parm count (s2): "${strs.length}"`);
      return false;
    }

    strand.xt_mode  = parseInt(strs[0]);
    strand.xt_hue   = parseInt(strs[1]);
    strand.xt_white = parseInt(strs[2]);
    strand.xt_count = parseInt(strs[3]);
    strand.force    = parseInt(strs[4]);
    strand.patnum   = parseInt(strs[5]);

    strand.pattern = reply[0];
    reply.shift();

    // TODO: search for match with this pattern

    device.report.strands.push(strand);
  }

  return true;
}

function parsePatternInfo(device, reply)
{
  return true;
}

function parsePluginInfo(device, reply)
{
  return true;
}
