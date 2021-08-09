import { get } from 'svelte/store';
import { MIN_TRACKS, MIN_TRACK_LAYERS, deviceList } from './globals.js';

export const DRAW_LAYER           = 0;      // drawing layer is always first layer of the track
export const MAX_BYTE_VALUE       = 255;    // used for some default values
export const MAX_FORCE            = 1000;   // maximum force value

export const overBit_DegreeHue    = 1;      // overwrite degreeHue
export const overBit_PcentWhite   = 2;      // overwrite pcentWhite
export const overBit_PcentCount   = 4;      // overwrite pcentCount

// Query commands:
export const cmdStr_GetInfo       = "?";    // returns info on device
export const cmdStr_GetPatterns   = "?P";   // returns info on custom patterns
export const cmdStr_GetPlugins    = "?G";   // returns info on custom plugins

// Device commands:                         // value is:
export const cmdStr_DeviceName    = "@";    // name of device
export const cmdStr_PullTrigger   = "!";    // trigger force
export const cmdStr_Pause         = "[";    // none
export const cmdStr_Resume        = "]";    // none
export const cmdStr_SaveFlash     = ".";    // none (begins/ends saving to flash)

// Override properties:                     // value is:
export const cmdStr_OR_Bright     = "%";    // percent of max ++
export const cmdStr_OR_Delay      = ":";    // msecs of delay ++
export const cmdStr_OR_Props      = "=";    // hue white count ++
export const cmdStr_SetXmode      = "_";    // 0=disable 1=enable override ++
export const cmdStr_SetFirst      = "^";    // first pixel to draw ++

// Determines what is addressed             // value is:
export const cmdStr_AddrStrand    = "#";    // strand index
export const cmdStr_AddrLayer     = "M";    // layer index

// Commands that form patterns              // value is:
export const cmdStr_Clear         = "P";    // none
export const cmdStr_PcentStart    = "J";    // percent of pixels **
export const cmdStr_PcentLength   = "K";    // percent of pixels **

////////////////////////////////////////////// not used
export const cmdStr_PcentFirst    = "L";    // percent of pixel length ++
export const cmdStr_PixStart      = "X";    // pixel index **
export const cmdStr_PixCount      = "Y";    // pixel index **
export const cmdStr_PixFirst      = "Z";    // pixel index ++
//////////////////////////////////////////////

export const cmdStr_Effect        = "E";    // plugin number
export const cmdStr_PcentBright   = "B";    // percent of max
export const cmdStr_MsecsDelay    = "D";    // msecs of delay
export const cmdStr_DegreeHue     = "H";    // hue degree (0..359)
export const cmdStr_PcentWhite    = "W";    // percent whiteness
export const cmdStr_PcentCount    = "C";    // percent of draw length
export const cmdStr_OrideBits     = "Q";    // property override bits
export const cmdStr_Direction     = "U";    // 0=down, 1=up (default)
export const cmdStr_OwritePixs    = "V";    // 0=OR, 1=overwrite pixels
export const cmdStr_TrigFromLayer = "A";    // layer index that will trigger this one
export const cmdStr_TrigFromMain  = "I";    // none (sets triggerring from main controls)
export const cmdStr_TrigForce     = "F";    // force used in triggering (no value if random)
export const cmdStr_TrigCount     = "N";    // trigger count (none or 0 means forever)
export const cmdStr_TrigMinTime   = "O";    // min time before next auto trigger (secs)
export const cmdStr_TriggerRange  = "T";    // auto trigger range time (secs) (no value if not auto)
export const cmdStr_Go            = "G";    // causes all effects to be displayed

// ++ these affect all tracks in the strand
// ** these take effect only when plugin is created
// Note: commands no starting with alpha char must be on separate line
///////////////////////////////////////////////////////////////////////

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
  active: false,      // true if recently received notify
  ready: false,       // true if received/parsed device info
  report:             // reported capabilities & state
  {
    scount: 0,        // strand count (>= 1)
    maxlen: 0,        // max length for cmds/patterns
    numtracks: 0,     // number of tracks available
    numlayers: 0,     // number of layers available
    strands: [],      // list of 'strandState'
  }
};

const SECS_NOTIFY_TIMEOUT = 7; // secs since last notify to clear active status

function curTimeSecs()
{
  return Math.floor(Date.now() / 1000); // convert to seconds
}

let checker = 0;
function startcheck()
{
  let tstamp = curTimeSecs();
  for (const device of get(deviceList))
  {
    //console.log(`Checking: ${device.name}`);

    if (device.active && ((device.tstamp + SECS_NOTIFY_TIMEOUT) < tstamp))
    {
      device.active = false;
      device.ready = false;
      console.log(`Device lost: ${device.name}`)
    }
  }

  checker = setTimeout(startcheck, (1000 * SECS_NOTIFY_TIMEOUT));
}

export const doConnect = () =>
{
  startcheck();
}

export const doDisconnect = () =>
{
  if (checker)
  {
    clearTimeout(checker);
    checker = 0;
  } 
  deviceList.set([]);
}

export const findDevice = (name, doadd=false) =>
{
  for (const device of get(deviceList))
    if (device.name === name)
    {
      device.tstamp = curTimeSecs();
      let isnew = !device.active;
      if (isnew) device.active = true;
      return {isnew:isnew, device:device};
    }

  if (!doadd) return {isnew:false, device:null};

  console.log(`Device added: "${name}"`);

  let device = {...deviceInfo};
  device.name = name;
  device.active = true;
  device.tstamp = curTimeSecs();
  get(deviceList).push(device);

  return {isnew:true, device:device};
}

export const parseInfo = (device, reply) =>
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

  device.tstamp = curTimeSecs();
  device.ready = true;

  console.log(`Device ready: "${device.name}"`)
  deviceList.set(get(deviceList)); // trigger UI update

  return true;
}
