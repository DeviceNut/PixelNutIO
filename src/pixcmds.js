
export const DRAW_LAYER           = 0;      // drawing layer is always first layer of the track
export const MAX_BYTE_VALUE       = 255;    // used for some default values
export const MAX_FORCE            = 1000;   // maximum force value

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
