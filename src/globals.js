import { get, writable } from 'svelte/store';

export const defDeviceName  = 'PixelNut!';
export const titleDevices   = 'PixelNut! Devices';
export const titleHelpDocs  = 'PixelNut! Docs';

export const SECS_RESPONSE_TIMEOUT  = 7;      // secs since last device notify/response
export const MAX_DEVICE_FAIL_COUNT  = 3;      // ignore device if fail this many times

export const MSECS_WAIT_CONNECTION  = 5000;   // msecs to wait for broker dis/connection
export const MSECS_WAIT_DEVICES     = 2000;   // msecs to wait for device detection
export const MSECS_CHECK_TIMEOUT    = 750;    // interval between connection check

export const SECS_DEVSTORE_TOUT     = 10;     // secs user idle before store device pattern
export const MSECS_DEVSTORE_CHECK   = 1000;   // msecs in between check for store timeout

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

export let showOptions    = writable(false);  // true to display options dialog
export let showCustom     = writable(false);  // true to display custom panels
export let userCustom     = writable(false);  // true if user opened custom panels

export let helpMenuOpen   = writable(true);   // true to display help menu
export let helpActiveID   = writable(0);      // currently selected menu choice
export let helpOpenItems  = writable([]);     // list of currently expanded items
export let helpCurText    = writable('');     // text to display for selected item

export let nStrands       = writable(0);      // number of physical strands
export let sStrands       = writable(0);      // number of strands currently selected
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let pStrand        = writable([]);     // "points" to current strand in aStrands
export let dupStrand      = writable(false);  // true to duplicate strands when selected

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

export const curTimeSecs = () =>
{
  return Math.floor(Date.now() / 1000); // convert to seconds
}

const effectInfo = { filter:false, id:0, bits:0, name:'', index:0 };

export const findEffectFromPlugin = (plugnum) =>
{
  for (const [i, f] of get(aEffectsDraw).entries())
    if (f.id === plugnum)
    {
      let obj = {...effectInfo};
      obj.id = f.id;
      obj.bits = f.bits;
      obj.name = f.text;
      obj.index = i;
      return obj;
    }

  for (const [i, f] of get(aEffectsFilter).entries())
    if (f.id === plugnum)
    {
      let obj = {...effectInfo};
      obj.filter = true;
      obj.id = f.id;
      obj.bits = f.bits;
      obj.name = f.text;
      obj.index = i;
      return obj;
    }

  return undefined;
}

export const findEffectFromIndex = (filter, index) =>
{
  let f;
  if (filter) f = get(aEffectsFilter)[index];
  else        f = get(aEffectsDraw)[index];
  return { filter:filter, id:f.id, bits:f.bits, name:f.text, index:index };
}

export const getColor = (name) =>
{
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

export const setColor = (name, color) =>
{
  document.documentElement.style.setProperty(name, color);
}