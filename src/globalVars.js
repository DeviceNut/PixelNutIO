import {writable} from 'svelte/store'

export let nStrands = writable(0);          // number of physical strands
export let eStrands = writable([]);         // array of strand enables (booleans)
export let xTracks  = writable(0);          // max number of tracks
export let xLayers  = writable(0);          // max number of layers
export let nTracks  = writable(0);          // number of tracks instantiated
export let nLayers  = writable([]);         // number of layers instantiated for each track
export let iTracks  = writable([[]]);       // array of layer ids by track index
export let iLayers  = writable([{}]);       // maps layer id to {track#, layer#}

export let aPatterns    = writable([]);     // list of all patterns
export let aEffectsDraw = writable([]);     // list of all drawing effects
export let aEffectsPre  = writable([]);     // list of all predraw effects

export let customMode   = writable(true);  // true if customizing pattern FIXME
export let customClear  = writable(true);   // true when custom pattern is clear
export let patternID    = writable(0);      // else pattern index
