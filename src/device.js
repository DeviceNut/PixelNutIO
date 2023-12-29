import { get, writable } from 'svelte/store';

import {
  curDevice,
  deviceList,
  msgTitle,
  msgDesc,
  curTimeSecs,
} from './globals.js';

// format of each custom device pattern:
export const custPattern =
{
  name: '',             // user name for pattern
  desc: '',             // description string
  pcmd: ''              // command string
};

// format of each custom device plugin:
export const custPlugin =
{
  name: '',             // user name for plugin
  desc: '',             // description string
  bits: 0x00,           // pluginBit_ values
  id: 0,                // globally unique ID
};

// format of each device strand info:
export const strandInfo =
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

  patname: '',          // pattern name
  patstr: '',           // pattern string
};

// state of each device found
const deviceState =
{
  curname: '',          // used as topic to talk to device
  newname: '',          // used when renaming the device

  tstamp: 0,            // secs of last notify/response

  failcount: 0,         // number of protocol failures
  ignore: false,        // true to ignore this device

  ready: false,         // true to stop spinner on UI
  active: false,        // true after user selected

  doshow: false,        // info panel on Devices page
  doquery: false,       // true to re-query on open

  orgcode: false,       // true if original BLE code

  report: {             // device info from query
    nstrands: 0,          // strand count (>= 1)
    npatterns: 0,         // custom device patterns
    nplugins: 0,          // custom device plugins
  
    maxstrlen: 0,         // max length for cmds/patterns
    numtracks: 0,         // number of tracks available
    numlayers: 0,         // number of layers available
  
    strands: [],          // list of strandInfo
    patterns: [],         // list of custPattern
    plugins: [],          // list of custPlugin
  },

  sendfun: null           // send function (name,str)
};

export let deviceAdd = (name, sendfun) =>
{
  console.log(`Device Add: "${name}"`);

  let device = {...deviceState};
  device.curname = name;
  device.tstamp = curTimeSecs();
  device.send = sendfun;

  get(deviceList).push(device);
  return device;
}

export let deviceError = (text, title=null) =>
{
  if (title === null) title = 'Program Error';

  console.error(text == '' ? title : text);

  // trigger error message title/text
  msgDesc.set(text);
  msgTitle.set(title);

  let device = get(curDevice);
  if (device && device.active)
    deviceReset(device);
}

export let deviceReset = (device) =>
{
  console.log(`Device Reset: "${device.curname}`);

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
  curDevice.set(null);
}
