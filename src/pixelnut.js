export const DRAW_LAYER           = 0;      // drawing layer is always first layer of the track
export const MAX_BYTE_VALUE       = 255;    // used for some default values
export const MAX_FORCE            = 1000;   // maximum force value

export const overBit_DegreeHue    = 1;      // overwrite degreeHue
export const overBit_PcentWhite   = 2;      // overwrite pcentWhite
export const overBit_PcentCount   = 4;      // overwrite pcentCount

export const cmdStr_GetInfo       = "?";
export const cmdStr_GetSegments   = "?S";
export const cmdStr_GetPatterns   = "?P";

// Device commands:                   // value is:
export const cmdStr_DeviceName    = "@";    // name of device
export const cmdStr_PullTrigger   = "!";    // trigger force
export const cmdStr_Pause         = "[";    // none
export const cmdStr_Resume        = "]";    // none

// Properties associated with pattern // value is:
export const cmdStr_SetBright     = "%";    // percent of max ++
export const cmdStr_SetDelay      = ":";    // msecs of delay ++
export const cmdStr_SetFirst      = "^";    // first pixel to draw ++
export const cmdStr_SetProps      = "=";    // hue white count ++
export const cmdStr_SetXmode      = "_";    // 0=disable 1=enable override ++

// Determines what is addressed       // value is:
export const cmdStr_AddrStrand    = "#";    // strand index
export const cmdStr_AddrLayer     = "M";    // layer index

// Commands that form patterns        // value is:
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
export const cmdStr_Bright        = "B";    // percent of max
export const cmdStr_Delay         = "D";    // msecs of delay
export const cmdStr_degreeHue     = "H";    // hue degree (0..359)
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
///////////////////////////////////////////////////////////////////////

export const strandInfo =
{
                      // fixed capabilities:
  pixels: 0,          // number of pixels
  layers: 0,          // max possible layers
  tracks: 0,          // max possible tracks
                      // current state:
  bright: 0,          // brightness percent
  delay: 0,           // delay milliseconds
  pattern: ''         // pattern string
};

export const deviceInfo =
{
  name: '',           // used as topic to talk to device
  tstamp: 0,          // timestamp(secs) of last notify
  active: false,      // true if recently received notify
  report:             // reported capabilities & state
  {
    strands: 0,       // pixel strand count (>= 1)
    maxlen: 0,        // max length for cmds/patterns
    info: [],         // list of 'strandInfo'
  }
};

function curTimeSecs()
{
  return Math.floor(Date.now() / 1000); // convert to seconds
}

function FindDevice(devlist, name)
{
  for (const device of devlist)
    if (device.name === name)
      return device;

  return null;
}

function ParseReply(device, reply)
{
  let line, strs, strand;

  line = reply[0];
  reply.shift();

  strs = line.split(' ');
  if (strs.length < 2) return false;

  device.report.strands = strs[0];
  device.report.maxlen = strs[1];

  if (device.report.strands < 1) return false;
  if (reply.length !== (device.report.strands * 2))
    return false;

  strandlist = [];

  for (var i = 0; i < device.report.strands; ++i)
  {
    line = reply[0];
    reply.shift();

    strs = line.split(' ');
    if (strs.length < 5) return false;

    strand = {...strandInfo};
    strand.pixels = strs[0];
    strand.layers = strs[1];
    strand.tracks = strs[2];
    strand.bright = strs[3];
    strand.delay  = strs[4];

    strand.pattern = reply[0];
    reply.shift();

    strandlist.push(strand);
  }

  device.active = true;
  device.tstamp = curTimeSecs();
  device.report.info = strandlist.slice(0);

  return true;
}

