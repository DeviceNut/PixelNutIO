import { writable } from 'svelte/store'

export let titleDevices   = 'PixelNut! Devices';
export let titleHelpDocs  = 'PixelNut! Docs';

export let defDeviceName  = 'PixelNut!';

export const PAGEMODE_DEVICES   = 0;
export const PAGEMODE_CONTROLS  = 1;
export const PAGEMODE_HELPDOCS  = 2;

export const MIN_TRACKS         = 4;    // minimum tracks for built-in patterns
export const MIN_TRACK_LAYERS   = 4;    // minimum layers for each track

export let curPageMode    = writable(PAGEMODE_DEVICES);
export let prevPageMode   = writable(PAGEMODE_DEVICES);
export let isConnected    = writable(false);  // true if currently connected to broker

export let deviceList     = writable([]);     // list of discovered devices
export let curDevice      = writable(null);   // "points" to current device

export let nStrands       = writable(0);      // number of physical strands
export let eStrands       = writable([]);     // array of current strand enables
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let dStrands       = writable([]);     // used to hold current device values
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let pStrand        = writable([]);     // "points" to current strand in aStrands

export let nTracks        = writable(0);      // total number of tracks
export let tLayers        = writable(0);      // total layers for each track

export let aDevicePats    = writable([]);     // list of all device custom patterns
export let aDeviceDesc    = writable([]);     //  and list of help strings for them
export let aStoredPats    = writable([]);     // list of all stored custom patterns
export let aStoredDesc    = writable([]);     //  and list of help strings for them
export let aBuiltinPats   = writable([]);     // list of all built-in patterns
export let aBuiltinDesc   = writable([]);     //  and list of help strings for them
export let aCurListPats   = writable([]);     // "points" to current patterns list
export let aCurListDesc   = writable([]);     // "points" to current descriptions list

export let updateSources  = writable(false);  // true to force update of sources list
export let updatePatterns = writable(false);  // true to force update of patterns list
export let storedPattern  = writable(false);  // true to set pattern to last stored one

export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffDrawDesc   = writable([]);     // list of all draw effect descriptions
export let aEffectsFilter = writable([]);     // list of all filter effects
export let aEffFilterDesc = writable([]);     // list of all filter effect descriptions
export let aTriggers      = writable([]);     // list of track/layers that cause triggers
