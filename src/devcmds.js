
export const DRAW_LAYER           = 0;      // drawing layer is always first layer of the track
export const MAX_BYTE_VALUE       = 255;    // used for some default values
export const MAX_FORCE_VALUE      = 1000;   // maximum force value

                                            // default values:
export const DEF_HUE_DEGREE       = 275;    // hue degree (purple)
export const DEF_PCENT_BRIGHT     = 100;    // percent brightness
export const DEF_PCENT_DELAY      = 50;     // percent delay of max
export const DEF_PCENT_COUNT      = 50;     // percent pixel count
export const DEF_FORCE_VALUE      = (MAX_FORCE_VALUE/2); // force value
                                            // all other are 0

export const overBit_DegreeHue    = 1;      // overwrite degreeHue
export const overBit_PcentWhite   = 2;      // overwrite pcentWhite
export const overBit_PcentCount   = 4;      // overwrite pcentCount

// Device commands:                         // value is:
export const cmdStr_DeviceName    = "@";    // new name of device
export const cmdStr_PullTrigger   = "!";    // trigger force applied
export const cmdStr_Pause         = "[";    // none: pauses operation
export const cmdStr_Resume        = "]";    // none: resumes operation
export const cmdStr_ReadCurPat    = "<";    // none: returns current pattern (unused)
export const cmdStr_FlashCurPat   = ">";    // none: flash current pattern (unused)
export const cmdStr_FlashPatStr   = "=";    // pattern string to flash
export const cmdStr_FlashPatName  = "~";    // pattern name to flash
export const cmdStr_ExecFromFlash = "$";    // clear and exec pattern from flash

// Override properties:                     // value is: (affects all strands)
export const cmdStr_OR_Bright     = "%";    // brightness percent of max
export const cmdStr_OR_Delay      = "&";    // delay percent to apply
export const cmdStr_OR_Props      = "+";    // hue white count
export const cmdStr_SetOride      = "-";    // 0=disable 1=enable override
export const cmdStr_SetFirst      = "^";    // first pixel to draw

// Determines what is addressed             // value is:
export const cmdStr_AddrStrand    = "#";    // strand index
export const cmdStr_AddrLayer     = "L";    // layer index

// Commands that must be preceded by "L" command (value is):
export const cmdStr_LayerMute     = "M";    // mute layer: none/0=off, 1=on
export const cmdStr_SelectEffect  = "S";    // plugin number to switch (none to swap)
export const cmdStr_AppRemEffect  = "Z";    // plugin number to append (none to remove)

// Commands that affect/form patterns       // value is:
export const cmdStr_SetEffect     = "E";    // plugin number
export const cmdStr_PixXoffset    = "X";    // pixel count of extent offset (unused)
export const cmdStr_PixXlength    = "Y";    // pixel count of extent length (unused)
export const cmdStr_PcentXoffset  = "J";    // percent of pixels for extent offset
export const cmdStr_PcentXlength  = "K";    // percent of pixels for extent length
export const cmdStr_PcentBright   = "B";    // percent of max
export const cmdStr_MsecsDelay    = "D";    // msecs of delay
export const cmdStr_DegreeHue     = "H";    // hue degree (0..359)
export const cmdStr_PcentWhite    = "W";    // percent whiteness
export const cmdStr_PcentCount    = "C";    // percent of draw length
export const cmdStr_OrideBits     = "Q";    // property override bits
export const cmdStr_Backwards     = "U";    // def/0=forwards, 1=backwards
export const cmdStr_CombinePixs   = "V";    // def/0=ORpixs, 1=overwrite pixels
export const cmdStr_TrigForce     = "F";    // trigger force (none=random, else value)
export const cmdStr_TrigAtStart   = "T";    // def/0=off, none=trigger once when starting
export const cmdStr_TrigFromMain  = "I";    // def/0=off, none=trigger from main controls
export const cmdStr_TrigByEffect  = "A";    // layer index that will trigger this one
export const cmdStr_TrigRepeating = "R";    // def/0=off, none=forever, else value=count
export const cmdStr_TrigOffset    = "O";    // offset secs before range (def/none/0=default)
export const cmdStr_TrigRange     = "N";    // range of random secs (def/none/0=default)

// Commands that causes an action (no paramenters):
export const cmdStr_Clear         = "P";    // clears all effects
export const cmdStr_Go            = "G";    // display all effects

// Note: commands not starting with alpha char must be at the start of the line
////////////////////////////////////////////////////////////////////////////////
