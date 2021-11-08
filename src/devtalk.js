import { get } from 'svelte/store';

import {
  SECS_NOTIFY_TIMEOUT,
  SECS_REPLY_TIMEOUT,
  MIN_TRACKS,
  MIN_TRACK_LAYERS,
  PAGEMODE_DEVICES,
  curPageMode,
  curDevice,
  deviceList,
  isConnected,
  aDevicePats,
  aDeviceDesc,
  aEffectsDraw,
  aEffDrawDesc,
  aEffectsFilter,
  aEffFilterDesc,
  msgTitle,
  msgDesc
 } from './globals.js';

 import { pluginBit_REDRAW } from './presets.js';

// Device Responses:
 export const respStr_Rebooted    = "<Reboot>"  // indicates device just rebooted
 export const respStr_VersionStr  = "P!!"       // specifies response format version
 
 // Query commands:
export const cmdStr_GetDevInfo    = "?";        // returns info on device
export const cmdStr_GetStrands    = "?S";       // returns info on each strand
export const cmdStr_GetPatterns   = "?P";       // returns info on device patterns
export const cmdStr_GetPlugins    = "?G";       // returns info on device plugins

const QUERY_NONE          = 0;  // invalid state
const QUERY_DEVICE        = 1;  // waiting for device reply
const QUERY_STRANDS       = 2;  // waiting for strand replies
const QUERY_PATTERNS      = 3;  // waiting for pattern replies
const QUERY_PLUGINS       = 4;  // waiting for plugin replies
const CHECK_PATTERNS      = 5;  // check if need to retrieve patterns
const CHECK_PLUGINS       = 6;  // check if need to retrieve plugins

                                // stage of queries:
const QSTAGE_NONE         = 0;  // invalid state
const QSTAGE_INFO         = 1;  // waiting for info
const QSTAGE_NAME         = 2;  // waiting for name
const QSTAGE_DESC         = 3;  // waiting for description
const QSTAGE_CMD          = 4;  // waiting for command str
const QSTAGE_DONE         = 5;  // final state

export const strandState =
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

  patstr: '',           // pattern string
  patname: ''           // pattern name
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
  qstage: QSTAGE_NONE,  // stage of each retrieval
  qcount: 0,            // messages left to receive

  qname: '',            // holds pattern/plugin name
  qdesc: '',            // holds pattern/plugin desc
  qcmd:  '',            // holds pattern/plugin str

  effects_items: [],    // custom effect item list array
  effects_descs: [],    // custom effect description array

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

function sendQuery(device, fsend, query)
{
  reply_device = device;
  reply_query = query;
  fsend(device.curname, query);

  timer_reply = setTimeout(timeout_reply, (1000 * SECS_REPLY_TIMEOUT));
}

function deviceQueryBegin(device, fsend)
{
  console.log('Requesting device info...'); // DEBUG

  device.ready = false;
  device.active = false;
  device.failed = false;
  device.query = QUERY_DEVICE;
  device.qstage = QSTAGE_NONE;

  sendQuery(device, fsend, cmdStr_GetDevInfo);
}

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

    //console.log(`Device stopped: ${curdev.curname}`); // DEBUG
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

  //console.log(`Device="${name}" IP=${info[1]}`); // DEBUG

  for (const device of get(deviceList))
  {
    if (device.curname === name)
    {
      if (!device.failed) device.tstamp = curTimeSecs();

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

  deviceQueryBegin(device, fsend);
}

export const onDeviceReply = (msg, fsend) =>
{
  console.log(`Device reply: ${msg}`) // DEBUG

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
    //console.log('device: ', d); // DEBUG
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
  else
  {
    while(true) // used with continue to change query
    {
      switch (device.query)
      {
        case QUERY_DEVICE:
        {
          //console.log('device reply: ', reply);
          if (reply[0] === respStr_VersionStr)
          {
            reply.shift();
            if (readDeviceInfo(device, reply))
            {
              sendQuery(device, fsend, cmdStr_GetStrands);
  
              device.query = QUERY_STRANDS;
              device.qstage = QSTAGE_INFO;
              device.qcount = 0;
            }
          }
          break;
        }
        case QUERY_STRANDS:
        {
          //console.log('strands reply: ', reply);
          if (readStrandInfo(device, reply))
          {
            if (device.qstage === QSTAGE_DONE) // finished one strand
            {
              if (++device.qcount >= device.report.nstrands)
              {
                device.query = CHECK_PATTERNS;
                continue;
              }
              else device.qstage = QSTAGE_INFO; // setup for next strand
            }
            // else keep parsing responses
          }
          break;
        }
        case CHECK_PATTERNS:
        {
          if (device.report.npatterns > 0)
          {
            sendQuery(device, fsend, cmdStr_GetPatterns);
  
            device.query = QUERY_PATTERNS;
            device.qstage = QSTAGE_NAME;
            device.qcount = 0;
  
            // init device patterns/descriptions
            const obj = { id:'0', text:'<none>', cmd:'' };
            aDevicePats.set([obj]);
            aDeviceDesc.set([[]]);
          }
          else
          {
            device.query = CHECK_PLUGINS;
            continue;
          }
          break;
        }
        case QUERY_PATTERNS:
        {
          //console.log('patterns reply: ', reply);
          if (readPatternInfo(device, reply))
          {
            if (device.qstage === QSTAGE_DONE) // finished one pattern
            {
              const obj = { id:device.qcount, text:device.qname, cmd:device.qcmd };
              get(aDevicePats).push(obj);
              get(aDeviceDesc).push([device.qdesc]);
    
              if (++device.qcount >= device.report.npatterns)
              {
                device.query = CHECK_PLUGINS;
                continue;
              }
              else device.qstage = QSTAGE_NAME; // setup for next pattern
            }
            // else keep parsing responses
          }
          break;
        }
        case CHECK_PLUGINS:
        {
          if (device.report.nplugins > 0)
          {
            sendQuery(device, fsend, cmdStr_GetPlugins);
  
            device.query = QUERY_PLUGINS;
            device.qstage = QSTAGE_NAME;
            device.qcount = 0;
          }
          else deviceStart(device);
          break;
        }
        case QUERY_PLUGINS: // TODO
        {
          //console.log('plugins reply: ', reply);
          if (readPluginInfo(device, reply))
          {
            if (device.qstage === QSTAGE_DONE) // finished one pattern
            {
              const strs = device.qcmd.split(' ');
              if (strs.length < 2)
              {
                deviceError(`Unexpected plugin cmd: "${device.qcmd}"`);
                break;
              }
              const pvalue = parseInt(strs[0]);
              const bvalue = parseInt(strs[1], 16);
              const obj = { id:pvalue, bits:bvalue, text:device.qname };

              device.effects_items.push(obj);
              device.effects_descs.push(device.qdesc);
              console.log(device.effects_items); // DEBUG

              if (++device.qcount >= device.report.nplugins)
                deviceStart(device);

              else device.qstage = QSTAGE_NAME; // setup for next plugin
            }
            // else keep parsing responses
          }
          break;
        }
        default:
        {
          deviceError(`Unexpected query state: ${device.query} for reply: ${msg}`)
          break;        
        }
      }

      break; // exit from while()
    }
  }
}

function readDeviceInfo(device, reply)
{
  let line, strs;

  line = reply[0];
  reply.shift();

  strs = line.split(' ');
  if (strs.length < 6)
  {
    deviceError(`Unexpected parm count (line 2): ${strs.length}`);
    return false;
  }

  device.report.nstrands  = strs[0];
  device.report.maxstrlen = strs[1];
  device.report.numlayers = strs[2];
  device.report.numtracks = strs[3];
  device.report.npatterns = strs[4];
  device.report.nplugins  = strs[5];

  if (device.report.nstrands < 1)
  {
    deviceError(`Bad strand count: "${device.report.nstrands}"`);
    return false;
  }

  if (device.report.numtracks < MIN_TRACKS)
  {
    deviceError(`Not enough tracks: ${device.report.numtracks}`);
    return false;
  }

  if (device.report.numlayers < (MIN_TRACKS * MIN_TRACK_LAYERS))
  {
    deviceError(`Not enough layers: ${device.report.numlayers}`);
    return false;
  }

  return true;
}

// 2 parm lines + 1 pattern, per strand
function readStrandInfo(device, reply)
{
  let line, strs, strand;

  switch (device.qstage)
  {
    case QSTAGE_INFO:
    {
      if (reply.length < 2)
      {
        deviceError(`Unexpected strand line count: ${reply.length}`);
        return false;
      }

      if (device.qcount === 0)
        device.report.strands = [];

      line = reply[0];
      reply.shift();
  
      strs = line.split(' ');
      if (strs.length < 4)
      {
        deviceError(`Unexpected parm count (s1): ${strs.length}`);
        return false;
      }
  
      strand = {...strandState};
  
      strand.pixels = parseInt(strs[0]);
      strand.bright = parseInt(strs[1]);
      strand.delay  = parseInt(strs[2]);
      strand.first  = parseInt(strs[3]);
  
      line = reply[0];
      reply.shift();
  
      strs = line.split(' ');
      if (strs.length < 5)
      {
        deviceError(`Unexpected parm count (s2): ${strs.length}`);
        return false;
      }
  
      strand.xt_mode  = parseInt(strs[0]) === 1; // must convert to boolean
      strand.xt_hue   = parseInt(strs[1]);
      strand.xt_white = parseInt(strs[2]);
      strand.xt_count = parseInt(strs[3]);
      strand.force    = parseInt(strs[4]);

      device.report.strands.push(strand);

      device.qstage = QSTAGE_CMD;
      break;
    }
    case QSTAGE_CMD:
    {
      device.report.strands[device.qcount].patstr = reply[0];
      reply.shift();
  
      device.qstage = QSTAGE_NAME;
      break;
    }
    case QSTAGE_NAME:
    {
      device.report.strands[device.qcount].patname = reply[0];
      reply.shift();
  
      device.qstage = QSTAGE_DONE; // indicates finished
      break;
    }
    default:
    {
      deviceError(`Unexpected strand stage: ${device.qstage}`);
      return false;
    }
  }

  return true;
}

function readPatternInfo(device, reply)
{
  const line = reply[0];
  reply.shift();

  switch (device.qstage)
  {
    case QSTAGE_NAME:
    {
      device.qname = line;
      device.qstage = QSTAGE_DESC;
      break;
    }
    case QSTAGE_DESC:
    {
      device.desc = line;
      device.qstage = QSTAGE_CMD;
      break;
    }
    case QSTAGE_CMD:
    {
      device.qcmd = line;
      device.qstage = QSTAGE_DONE; // indicates finished
      break;
    }
    default:
    {
      deviceError(`Unexpected pattern stage: ${device.qstage}`);
      return false;
    }
  }

  return true;
}

function readPluginInfo(device, reply)
{
  const line = reply[0];
  reply.shift();

  switch (device.qstage)
  {
    case QSTAGE_NAME:
    {
      device.qname = line;
      device.qstage = QSTAGE_DESC;
      break;
    }
    case QSTAGE_DESC:
    {
      device.desc = line;
      device.qstage = QSTAGE_CMD;
      break;
    }
    case QSTAGE_CMD:
    {
      device.qcmd = line;
      device.qstage = QSTAGE_DONE; // indicates finished
      break;
    }
    default:
    {
      deviceError(`Unexpected plugin stage: ${device.qstage}`);
      return false;
    }
  }

  return true;
}
