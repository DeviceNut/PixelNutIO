import { get } from 'svelte/store';

import {
  PAGEMODE_DEVICES,
  curPageMode,
  curDevice,
  MIN_TRACKS,
  MIN_TRACK_LAYERS,
  deviceList,
  isConnected,
  aDevicePats,
  aDeviceDesc
 } from './globals.js';

import { mqttSend } from './mqtt.js';

// Query commands:
export const cmdStr_GetDevInfo    = "?";    // returns info on device
export const cmdStr_GetPatInfo    = "?P";   // returns info on custom patterns
export const cmdStr_GetPlugInfo   = "?G";   // returns info on custom plugins

const QUERY_NONE          = 0;  // invalid state
const QUERY_DEVICE        = 1;  // waiting for device info reply
const QUERY_PATTERNS      = 2;  // waiting for patterns info reply
const QUERY_PLUGINS       = 3;  // waiting for plugins info reply

                                // stage of QUERY_PATTERNS/PLUGINS:
const QSTAGE_NONE         = 0;  // invalid state
const QSTAGE_NAME         = 1;  // waiting for name
const QSTAGE_DESC         = 2;  // waiting for description
const QSTAGE_CMD          = 3;  // waiting for command str

const SECS_NOTIFY_TIMEOUT = 7;  // secs since last notify to clear active status

export const strandState =
{
  pixels: 0,            // number of pixels
  bright: 0,            // brightness percent
  delay: 0,             // delay percent
  force: 0,             // force (0-MAX_FORCE)
  first: 1,             // first pixel to draw (from 1)
  direct: 0,            // direction flag 0/1 (1 is default for up)

                        // extern mode:
  xt_mode: 0,           //  enabled=1
  xt_hue: 0,            //  hue property (0-359)
  xt_white: 0,          //  white property (percent)
  xt_count: 0,          //  count property (percent)

  patnum: 0,            // pattern number (not used?)
  pattern: ''           // pattern string
};

export const deviceInfo =
{
  curname: '',          // used as topic to talk to device
  newname: '',          // used when renaming the device

  tstamp: 0,            // timestamp(secs) of last notify

  failed: false,        // device communication failed
  ready: false,         // true if ready for controlling
                        // (all info retrieved successfully)
  active: false,        // true if being controlled now
                        // (only one device at a time)

  query:  QUERY_NONE,   // state of query commands (QUERY_xxx)
  qcount: 0,            // patterns left to receive (QUERY_PATTERNS)
  qstage: QSTAGE_NONE,  // stage of each pattern retrieval

  qname: '',            // holds pattern/plugin name
  qdesc: '',            // holds pattern/plugin desc
  qcmd:  '',            // holds pattern/plugin cmd

  report:               // reported capabilities & state
  {
    nstrands: 0,        // strand count (>= 1)
    npatterns: 0,       // custom device patterns
    nplugins: 0,        // custom device plugins

    maxstrlen: 0,       // max length for cmds/patterns
    numtracks: 0,       // number of tracks available
    numlayers: 0,       // number of layers available
    strands: [],        // list of 'strandState'
  }
};

function deviceStart(device)
{
  console.log(`Device ready: "${device.curname}"`) // DEBUG

  device.ready  = true;
  device.query  = QUERY_NONE;
  device.qstage = QSTAGE_NONE;
  device.qcount = 0;
  device.tstamp = curTimeSecs();

  deviceList.set(get(deviceList)); // trigger UI update
}

function deviceStop(device=null)
{
  let curdev = get(curDevice);
  if (curdev != null)
  {
    if (get(curPageMode) != PAGEMODE_DEVICES)
      curPageMode.set(PAGEMODE_DEVICES);

    curdev.active = false;
    curDevice.set(null);

    //console.log(`Device stopped: ${curdev.curname}`); // DEBUG
  }

  if (device !== null)
  {
    console.error(`Device failed: ${device.curname}`);

    device.failed = true;
    deviceList.set(get(deviceList)); // trigger UI update
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
      //console.log(`Checking: ${device.curname}`); // DEBUG
  
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

    deviceStop();

    deviceList.set([]);
  }

  isConnected.set(enabled);
}

export const onNotification = (msg) =>
{
  const info = msg.split(',');
  const name = info[0];

  //console.log(`Device="${name}" IP=${info[1]}`); // DEBUG

  for (const device of get(deviceList))
  {
    if (device.curname === name)
    {
      if (device.failed)
      {
        // ignore?
      }
      else device.tstamp = curTimeSecs();

      return; // don't add this device
    }
    else if (device.newname === name)
    {
      console.log(`Renaming device: "${name}"`); // DEBUG

      device.curname = name;
      device.newname = '';
      device.tstamp = curTimeSecs();
      return; // don't add this device
    }
  }

  console.log(`Adding device: "${name}"`); // DEBUG

  let device = {...deviceInfo};
  device.curname = name;
  device.tstamp = curTimeSecs();
  get(deviceList).push(device);
  deviceList.set(get(deviceList)); // trigger UI update

  console.log('Requesting device info...'); // DEBUG

  mqttSend(name, cmdStr_GetDevInfo);
  device.query = QUERY_DEVICE;
}

export const onCommandReply = (msg) =>
{
  console.log(`Device reply: ${msg}`) // DEBUG

  const reply = msg.split('\n');
  const name = reply[0];

  let device = null;
  const dlist = get(deviceList);
  for (const d of dlist)
  {
    //console.log('device: ', d); // DEBUG
    if (d.curname === name)
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
          if (device.report.npatterns > 0)
          {
            mqttSend(name, cmdStr_GetPatInfo);
            device.query = QUERY_PATTERNS;
            device.qstage = QSTAGE_NAME;
            device.qcount = 0;

            // init device patterns/descriptions
            const obj = { id:'0', text:'<none>', cmd:'' };
            aDevicePats.set([obj]);
            aDeviceDesc.set([[]]);
          }
          else deviceStart(device);
        }
        else deviceStop(device);
        break;
      }
      case QUERY_PATTERNS:
      {
        reply.shift();
        if (parsePatternInfo(device, reply))
        {
          if (device.qstage === QSTAGE_NONE)
          {
            const obj = { id:device.qcount, text:device.qname, cmd:device.qcmd };
            get(aDevicePats).push(obj);
            get(aDeviceDesc).push([device.qdesc]);

            if (++device.qcount >= device.report.npatterns)
            {
              if (device.report.nplugins > 0)
              {
                mqttSend(name, cmdStr_GetPlugInfo);
                device.query = QUERY_PLUGINS;
                device.qstage = QSTAGE_NAME;
                device.qcount = 0;
              }
              else deviceStart(device);
            }
            else device.qstage = QSTAGE_NAME;
          }
          // else keep parsing responses
        }
        else deviceStop(device);
        break;
      }
      case QUERY_PLUGINS: // TODO
      {
        reply.shift();
        if (parsePluginInfo(device, reply))
        {
          if (++device.qcount >= device.report.nplugins)
            deviceStart(device);
        }
        else deviceStop(device);
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

  device.report.nstrands  = strs[0];
  device.report.maxstrlen = strs[1];
  device.report.npatterns = strs[2];
  device.report.nplugins  = strs[3];
  device.report.numlayers = strs[4];
  device.report.numtracks = strs[5];

  if (device.report.nstrands < 1)
  {
    console.error(`Bad strand count: "${nstrands}"`);
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
  if (reply.length !== (device.report.nstrands * 3))
  {
    console.error(`Unexpected strand line count: "${reply.length}"`);
    return false;
  }

  device.report.strands = [];

  for (var i = 0; i < device.report.nstrands; ++i)
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

    device.report.strands.push(strand);
  }

  return true;
}

function parsePatternInfo(device, reply)
{
  let line = reply[0];
  reply.shift();

  switch (device.qstage)
  {
    case QSTAGE_NAME:
    {
      //console.log(`name=${line}`); // DEBUG
      device.qname = line;
      device.qstage = QSTAGE_DESC;
      break;
    }
    case QSTAGE_DESC:
    {
      //console.log(`desc=${line}`); // DEBUG
      device.desc = line;
      device.qstage = QSTAGE_CMD;
      break;
    }
    case QSTAGE_CMD:
    {
      //console.log(`cmd=${line}`); // DEBUG
      device.qcmd = line;
      device.qstage = QSTAGE_NONE;
      break;
    }
    default:
    {
      console.error(`Unexpected pattern stage: ${device.qstage}`);
      return false;
    }
  }

  return true;
}

function parsePluginInfo(device, reply)
{
  return false;
}
