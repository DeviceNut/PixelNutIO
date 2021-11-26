import { writable } from 'svelte/store'

export let defDeviceName  = 'PixelNut!';
export let titleDevices   = 'PixelNut! Devices';
export let titleHelpDocs  = 'PixelNut! Docs';

export const MQTT_BROKER_PORT       = 9001;   // MUST be 9001 for websocket
export const MSECS_WAIT_CONNECTION  = 5000;   // total time to wait for MQTT connection
export const MSECS_CHECK_TIMEOUT    = 800;    // interval between check for devices added
export const SECS_NOTIFY_TIMEOUT    = 7;      // secs since last notify for connection timeout
export const SECS_REPLY_TIMEOUT     = 3;      // secs since sent command for reply timeout

export const HELPTEXT_HEIGHT        = 45;     // height of help text panel

export const PAGEMODE_DEVICES       = 0;      // list of devices to connect to
export const PAGEMODE_CONTROLS      = 1;      // controls for specific device
export const PAGEMODE_HELPDOCS      = 2;      // controls help documentation

export const MIN_TRACKS             = 4;      // minimum tracks for built-in patterns
export const MIN_TRACK_LAYERS       = 4;      // minimum layers for each track

export let curPageMode    = writable(PAGEMODE_DEVICES);
export let prevPageMode   = writable(PAGEMODE_DEVICES);

export let mqttBrokerIP   = writable('');     // IP address string of broker
export let mqttBrokerFail = writable(false);  // true if broker connection failed
export let isConnected    = writable(false);  // true if connected to that broker

export let deviceList     = writable([]);     // list of discovered devices
export let curDevice      = writable(null);   // "points" to current device

export let helpMenuOpen   = writable(true);   // true to display help menu
export let helpOpenItems  = writable([]);     // list of currently expanded items
export let helpActiveID   = writable(0);      // currently selected menu choice
export let helpCurText    = writable('');     // text to display for selected item

export let nStrands       = writable(0);      // number of physical strands
export let eStrands       = writable([]);     // array of current strand enables
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let dStrands       = writable([]);     // used to hold current device values
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let pStrand        = writable([]);     // "points" to current strand in aStrands

export let nTracks        = writable(0);      // total number of tracks
export let nLayers        = writable(0);      // total layers for each track
export let maxLenPattern  = writable(0);      // max length of pattern by device

export let patsMenuOpen   = writable(false);  // true to display pattern select menu
export let patsOpenItems  = writable([]);     // list of currently expanded items
export let patsActiveID   = writable(0);      // currently selected menu choice
export let patsCurText    = writable('');     // text to display for selected item

export let aDevicePats    = writable([]);     // list of all device custom patterns
export let aDeviceDesc    = writable([]);     //  and list of help strings for them
export let aStoredPats    = writable([]);     // list of all stored custom patterns
export let aStoredDesc    = writable([]);     //  and list of help strings for them

                                              // created each time device is started:
export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffDrawDesc   = writable([]);     // list of all draw effect descriptions
export let aEffectsFilter = writable([]);     // list of all filter effects
export let aEffFilterDesc = writable([]);     // list of all filter effect descriptions

export let msgTitle       = writable('');     // non-empty to cause user message popup
export let msgDesc        = writable('');     // description text for that message
