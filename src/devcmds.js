export const DRAW_LAYER           = 0;      // drawing layer is always first layer of the track
export const MAX_BYTE_VALUE       = 255;    // used for some default values
export const MAX_HUE_VALUE        = 255;    // maximum hue value
export const MAX_FORCE_VALUE      = 255;    // maximum force value

export const ENABLEBIT_MUTE       = 1;      // mute on
export const ENABLEBIT_SOLO       = 2;      // solo on

                                            // default values:
export const DEF_HUE_VALUE        = 192;    // hue value for purple
export const DEF_PCENT_BRIGHT     = 50;     // percent brightness
export const DEF_PCENT_DELAY      = 50;     // percent delay of max
export const DEF_PCENT_COUNT      = 50;     // percent pixel count
export const DEF_FORCE_VALUE      = parseInt(MAX_FORCE_VALUE/2); // force value
                                            // all other are 0

// Plugin Bit definitions:
export const pluginBit_COLOR       = 0x0001;  // changing color changes effect
export const pluginBit_COUNT       = 0x0002;  // changing count changes effect
export const pluginBit_DELAY       = 0x0004;  // changing delay changes effect
export const pluginBit_DIRECTION   = 0x0008;  // changing direction changes effect
export const pluginBit_NOREPEATING = 0x0010;  // effect can be non-repeating
export const pluginBit_REPTRIGS    = 0x0020;  // repeat triggers changes effect
export const pluginBit_TRIGFORCE   = 0x0040;  // force used in triggering
export const pluginBit_SENDFORCE   = 0x0080;  // sends force to other plugins
                                              // filter effect overrides:
export const pluginBit_ORIDE_HUE   = 0x0100;  //  hue property
export const pluginBit_ORIDE_WHITE = 0x0200;  //  white property
export const pluginBit_ORIDE_COUNT = 0x0400;  //  count property
export const pluginBit_ORIDE_DELAY = 0x0800;  //  delay property
export const pluginBit_ORIDE_DIR   = 0x1000;  //  direction property
export const pluginBit_ORIDE_EXT   = 0x2000;  //  start/extent properties
export const pluginBit_REDRAW      = 0x8000;  // set if redraw effect, else filter

// Device commands:                         // value is:
export const cmdStr_DeviceName    = "@";    // new name of device
export const cmdStr_PullTrigger   = "!";    // trigger force applied
export const cmdStr_Pause         = "[";    // none: pauses operation
export const cmdStr_Resume        = "]";    // none: resumes operation
export const cmdStr_ClearPattern  = "*";    // none: clears name/pattern
export const cmdStr_FlashPatStr   = "=";    // flash sent pattern string
export const cmdStr_FlashPatName  = "~";    // flash sent pattern name
export const cmdStr_ExecFromFlash = "$";    // clear, exec pattern from flash

// Override properties:                     // value is: (affects all strands)
export const cmdStr_OR_Bright     = "%";    // brightness percent of max
export const cmdStr_OR_Delay      = "&";    // delay percent to apply
export const cmdStr_OR_Props1     = "<";    // hue white count
export const cmdStr_OR_Props2     = ">";    // ending to above
export const cmdStr_SetOride      = "|";    // 0=disable 1=enable override
export const cmdStr_SetFirst      = "^";    // first pixel to draw

// Determines what is addressed             // value is:
export const cmdStr_AddrStrand    = "#";    // strand index
export const cmdStr_AddrLayer     = "L";    // layer index

// Commands that must be preceded by "L" command (value is):
export const cmdStr_LayerMute     = "M";    // mute/solo: 0=off, none/1=on, 2=solo
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
export const cmdStr_ValueHue      = "H";    // hue value (0-MAX_HUE_VALUE)
export const cmdStr_PcentWhite    = "W";    // percent whiteness
export const cmdStr_PcentCount    = "C";    // percent of draw length
export const cmdStr_OrideBits     = "Q";    // property override bits
export const cmdStr_CombinePixs   = "V";    // def/0=ORpixs, none/1=overwrite pixels
export const cmdStr_Backwards     = "U";    // def/0=forwards, none/1=backwards
export const cmdStr_NoRepeating   = "G";    // def/0=continuous, none/1=one-shot
export const cmdStr_TrigForce     = "F";    // trigger force (none=random, else value)
export const cmdStr_TrigAtStart   = "T";    // def/0=off, none=trigger once when starting
export const cmdStr_TrigFromMain  = "I";    // def/0=off, none=trigger from main controls
export const cmdStr_TrigByEffect  = "A";    // layer index that will trigger this one
export const cmdStr_TrigRepeating = "R";    // def/0=off, none=forever, else value=count
export const cmdStr_TrigOffset    = "O";    // offset secs before range (def/none/0=default)
export const cmdStr_TrigRange     = "N";    // range of random secs (def/none/0=default)

// Note: commands not starting with alpha char must be on a separate line
////////////////////////////////////////////////////////////////////////////////

export let defCustomCmd           = 'E0 T';   // default pattern command
export let defDrawEffect          = 0;        // default draw effect
export let defFilterEffect        = 100;      // default filter effect
