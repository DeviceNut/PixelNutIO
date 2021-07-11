import {writable} from 'svelte/store'

// 1) To simplify track/layer access, a fixed number of layers are assigned to each track.
// 2) Whenever tracks or layers are added or removed a new pattern has to be generated.
// 3) The device's pixel engine keeps a stack of layers indexed by a layer id, the value
//    of which is used for assigning trigger targets, and since that depends on the number
//    of active tracks/layers, it needs to be re-calculated each time a pattern is generated.
// 4) Active tracks/layers are the ones displayed that can be modified. The user can change
//    these with the Add/Del buttons, up to the limits of the device.
// 5) Tracks/layers can be individually enabled/disabled (except for the first layer of each track)
//    with the Solo/Mute buttons.

export let nStrands = writable(0);          // number of physical strands
export let eStrands = writable([]);         // array of strand enables (booleans)

export let xTracks  = writable(0);          // total number of tracks
export let nTracks  = writable(0);          // number of active tracks
export let sTracks  = writable([]);         // array of track solos (booleans)
export let mTracks  = writable([]);         // array of track mutes (booleans)

export let xLayers  = writable(0);          // total number of layers (all tracks)
export let tLayers  = writable(0);          // total layers for each track (xLayers/xTracks)
export let nLayers  = writable([]);         // array of active layer counts per track
export let sLayers  = writable([[]]);       // double array of layer solos by track
export let mLayers  = writable([[]]);       // double array of layer mutes by track

export let aPatterns      = writable([]);   // list of all patterns
export let aEffectsDraw   = writable([]);   // list of all drawing effects
export let aEffectsPre    = writable([]);   // list of all predraw effects

export let customMode     = writable(true); // true if customizing pattern FIXME
export let customClear    = writable(true); // true when custom pattern is clear
export let curPatternID   = writable(0);    // else current pattern index
export let curStrandID    = writable(0);    // current strand index
export let curPatternStr  = writable('');   // current pattern string

