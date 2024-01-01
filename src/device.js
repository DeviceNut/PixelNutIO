import { get } from 'svelte/store';

import {
  curDevice,
  deviceList,
  msgTitle,
  msgDesc,
  makeCopyOf,
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

  // information about the pattern:
  // CANNOT change these names, part of new protocol
  patname: '',          // name
  patdesc: '',          // description
  patstr:  '',          // command string
  patbits: '',          // feature bits
};

// state of each device found
const deviceState =
{
  curname: '',          // used as topic to talk to device
  newname: '',          // used when renaming the device

  ready: false,         // true to stop spinner on UI
  ignore: false,        // true to ignore this device
  active: false,        // true after user selected

  doshow: false,        // info panel on Devices page
  doquery: false,       // true to re-query on return

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

  query: null,            // queries devices for info (device)
  start: null,            // inits devices for control (device)
  stop: null,             // disconnects/ignores device (device)
  send: null,             // sends string to device (str, name)
};

export let deviceAdd = (name) =>
{
  console.log(`Device Add: "${name}"`);

  let device = makeCopyOf(deviceState);
  device.curname = name;

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
  if (!device) device = get(curDevice);
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
