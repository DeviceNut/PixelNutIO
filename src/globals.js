import { get, writable } from 'svelte/store';

export const defDeviceName  = 'PixelNut!';
export const titleDevices   = 'PixelNut! Devices';
export const titleHelpDocs  = 'PixelNut! Docs';

export const SECS_RESPONSE_TIMEOUT  = 9;      // secs since last device notify/response
export const MAX_DEVICE_FAIL_COUNT  = 3;      // ignore device if fail this many times

export const MSECS_WAIT_CONNECTION  = 5000;   // msecs to wait for device connection
export const MSECS_CHECK_TIMEOUT    = 750;    // interval between connection check

export const HELPTEXT_HEIGHT        = 45;     // height of help text panel

export const PAGEMODE_DEVICES       = 1;      // list of devices to connect to
export const PAGEMODE_CONTROLS      = 2;      // controls for specific device
export const PAGEMODE_HELPDOCS      = 3;      // controls help documentation

export const MIN_TRACKS             = 4;      // minimum number of tracks
export const MIN_LAYERS             = 4;      // minimum number of layers
export const MINLEN_MAXPATTERN      = 100;    // min value for max pattern length

export let curPageMode    = writable(PAGEMODE_DEVICES);
export let prevPageMode   = writable(PAGEMODE_DEVICES);

export let mqttBrokerIP   = writable('');     // MQTT broker IP (server if not debug)
export let mqttConnFail   = writable(false);  // true if broker connection failed
export let mqttConnected  = writable(false);  // true if connected to that broker
                                              // true for development, else false

export let deviceList     = writable([]);     // list of discovered devices
export let curDevice      = writable(null);   // "points" to current device

export let helpMenuOpen   = writable(true);   // true to display help menu
export let helpActiveID   = writable(0);      // currently selected menu choice
export let helpOpenItems  = writable([]);     // list of currently expanded items
export let helpCurText    = writable('');     // text to display for selected item

export let nStrands       = writable(0);      // number of physical strands
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let eStrands       = writable([]);     // array of current strand enables
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let strandCombine  = writable(false);  // true to combine strands
export let pStrand        = writable([]);     // "points" to current strand in aStrands

export let nTracks        = writable(0);      // total number of tracks
export let nLayers        = writable(0);      // total layers for each track
export let maxLenPattern  = writable(0);      // max length of pattern by device

export let msgTitle       = writable('');     // non-empty to cause user message popup
export let msgDesc        = writable('');     // description text for that message

                                              // for stored-in-browser:
export let aStoredPatt    = writable([]);     // list of pattern strings
export let aStoredDesc    = writable([]);     // list of help strings

                                              // for stored-in-device:
export let aDevicePatt    = writable([]);     // list of pattern strings
export let aDeviceDesc    = writable([]);     // list of help strings

                                              // created each time device is started:
export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffDrawDesc   = writable([]);     // list of all draw effect descriptions
export let aEffectsFilter = writable([]);     // list of all filter effects
export let aEffFilterDesc = writable([]);     // list of all filter effect descriptions

export let patsMenuOpen   = writable(false);  // true to display pattern select menu
export let patsMenuItems  = writable([]);     // array of menu items for current device
export let patsSelectedID = writable([]);     // list of selected items
export let patsOpenItems  = writable([]);     // list of expanded items

export let allowUpdates   = writable(true);   // false to prevent UI updates

export const findEffectFromPlugin = (plugnum) =>
{
  for (const [i, f] of get(aEffectsDraw).entries())
    if (f.id === plugnum)
      return { filter:false, id:f.id, bits:f.bits, name:f.text, index:i };

  for (const [i, f] of get(aEffectsFilter).entries())
    if (f.id === plugnum)
      return { filter:true, id:f.id, bits:f.bits, name:f.text, index:i };

  return undefined;
}

export const findEffectFromIndex = (filter, index) =>
{
  let f;
  if (filter) f = get(aEffectsFilter)[index];
  else        f = get(aEffectsDraw)[index];
  return { filter:filter, id:f.id, bits:f.bits, name:f.text, index:index };
}
