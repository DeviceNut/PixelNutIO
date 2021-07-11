import {writable} from 'svelte/store'

export let nStrands = writable(0);        // number of physical strands
export let eStrands = writable([]);       // array of strand enables (booleans)
export let xTracks  = writable(0);        // max number of tracks
export let xLayers  = writable(0);        // max number of layers
export let nTracks  = writable(0);        // number of tracks instantiated
export let nLayers  = writable([]);       // number of layers instantiated for each track
export let iTracks  = writable([[]]);     // array of layer ids by track index
export let iLayers  = writable([{}]);     // maps layer id to {track#, layer#}

export let aPatterns    = writable([]);   // list of all patterns
export let aDrawEffects = writable([]);   // list of all drawing effects
export let aPreEffects  = writable([]);   // list of all predraw effects

export let curPatternID = writable(0);    // 0=custom, else pattern index

aPatterns.set([
  { id: '0', text: '<custom>', cmd:  '' },
]);
