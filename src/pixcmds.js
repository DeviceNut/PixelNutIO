
export const DRAW_LAYER           = 0;      // drawing layer is always first layer of the track
export const MAX_BYTE_VALUE       = 255;    // used for some default values
export const MAX_FORCE_VALUE      = 1000;   // maximum force value
export const MAX_DELAY_VALUE      = 60;     // maximum delay msecs

export const DEF_PCENT_BRIGHT     = 100;    // default percent brightness
export const DEF_PCENT_COUNT      = 50;     // default percent pixel count

export const overBit_DegreeHue    = 1;      // overwrite degreeHue
export const overBit_PcentWhite   = 2;      // overwrite pcentWhite
export const overBit_PcentCount   = 4;      // overwrite pcentCount

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
export const cmdStr_AddrLayer     = "L";    // layer index

// Commands that must be preceded by "L" command:
export const cmdStr_LayerMute     = "Z";    // mute layer: 0=off, 1=on
export const cmdStr_SelectEffect  = "S";    // plugin number (none to delete)

// Commands that affect/form patterns       // value is:
export const cmdStr_SetEffect     = "E";    // plugin number
export const cmdStr_PcentOffset   = "J";    // percent of pixels for starting extent
export const cmdStr_PcentExtent   = "K";    // percent of pixels for extent length
export const cmdStr_PcentBright   = "B";    // percent of max
export const cmdStr_MsecsDelay    = "D";    // msecs of delay
export const cmdStr_DegreeHue     = "H";    // hue degree (0..359)
export const cmdStr_PcentWhite    = "W";    // percent whiteness
export const cmdStr_PcentCount    = "C";    // percent of draw length
export const cmdStr_OrideBits     = "Q";    // property override bits
export const cmdStr_Direction     = "U";    // 0=down, 1=up (default)
export const cmdStr_OwritePixs    = "V";    // 0=off, 1=overwrite pixels
export const cmdStr_TrigForce     = "F";    // force used in triggering (no value if random)
export const cmdStr_TrigCount     = "N";    // trigger count (none or 0 means forever)
export const cmdStr_TrigMinTime   = "O";    // min time before next auto trigger (secs)
export const cmdStr_TrigRangeTime = "R";    // auto trigger range time (secs)
export const cmdStr_TrigAutomatic = "M";    // 0=off, 1=on (uses other trigger options)
export const cmdStr_TrigFromLayer = "A";    // layer index that will trigger this one
export const cmdStr_TrigFromMain  = "I";    // 0=off, 1=trigger from main controls
export const cmdStr_TrigAtStart   = "T";    // 0=off, 1=trigger once when starting

// Commands that causes an action (no paramenters):
export const cmdStr_Clear         = "P";    // clears all effects
export const cmdStr_Go            = "G";    // display all effects

// ++ these affect all tracks in the strand
// Note: not using X,Y commands (start/length of extent in pixels)
// Note: commands not starting with alpha char must be on separate line
///////////////////////////////////////////////////////////////////////
