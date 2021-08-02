import { writable } from 'svelte/store'

export let titleDevices   = 'PixelNut! Devices';
export let titleHelpDocs  = 'PixelNut! Docs';

export let defDeviceName  = 'PixelNut!';

export const PAGEMODE_DEVICES   = 0;
export const PAGEMODE_CONTROLS  = 1;
export const PAGEMODE_HELPDOCS  = 2;

export let curPageMode    = writable(PAGEMODE_DEVICES);
export let prevPageMode   = writable(PAGEMODE_DEVICES);

export let deviceList     = writable([]);     // list of discovered devices
export let curDevice      = writable({});     // "points" to current device

export let nStrands       = writable(0);      // number of physical strands
export let eStrands       = writable([]);     // array of current strand enables
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let dStrands       = writable([]);     // used to hold current device values
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let pStrand        = writable([]);     // "points" to current strand in aStrands

export let nTracks        = writable(0);      // total number of tracks
export let tLayers        = writable(0);      // total layers for each track

export let aBuiltinPats   = writable([]);     // list of all built-in patterns
export let aBuiltinDesc   = writable([]);     //  and list of help strings for them
export let aCustomPats    = writable([]);     // list of all saved custom patterns
export let aCustomDesc    = writable([]);     //  and list of help strings for them

export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffDrawDesc   = writable([]);     // list of all draw effect descriptions
export let aEffectsFilter = writable([]);     // list of all filter effects
export let aEffFilterDesc = writable([]);     // list of all filter effect descriptions
export let aTriggers      = writable([]);     // list of track/layers that cause triggers
