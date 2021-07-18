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
export const cmdStr_TrigLayer     = "A";    // layer index that will trigger this one
export const cmdStr_TrigManual    = "I";    // none (sets manual triggerring)
export const cmdStr_TrigForce     = "F";    // force used in triggering (no value if random)
export const cmdStr_TrigCount     = "N";    // trigger count (none or 0 means forever)
export const cmdStr_TrigMinTime   = "O";    // min time before next auto trigger (secs)
export const cmdStr_TriggerRange  = "T";    // auto trigger range time (secs) (no value if not auto)
export const cmdStr_Go            = "G";    // causes all effects to be displayed

// ++ these affect all tracks in the strand
// ** these take effect only when plugin is created
///////////////////////////////////////////////////////////////////////
