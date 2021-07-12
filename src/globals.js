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

export let nStrands       = writable(0);      // number of physical strands
export let eStrands       = writable([]);     // array of strand enables (booleans)
export let nPixels        = writable([]);     // array of pixel counts by strand
export let maxPixels      = writable(0);      // max pixel count across strands

export let nTracks        = writable(0);      // total number of tracks
export let aTracks        = writable(0);      // number of active tracks
export let sTracks        = writable([]);     // array of track solos (booleans)
export let mTracks        = writable([]);     // array of track mutes (booleans)

export let tLayers        = writable(0);      // total layers for each track
export let aLayers        = writable([]);     // array of active layer counts per track
export let sLayers        = writable([[]]);   // double array of layer solos by track
export let mLayers        = writable([[]]);   // double array of layer mutes by track

export let aPatterns      = writable([]);     // list of all patterns
export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffectsPre    = writable([]);     // list of all predraw effects

export let customMode     = writable(false);  // true if customizing pattern
export let customClear    = writable(true);   // true when custom pattern is clear
export let curPatternID   = writable(0);      // else current pattern index
export let curStrandID    = writable(0);      // current strand index
export let curPatternStr  = writable('');     // current pattern string

export let globalsInit = (max_strands, max_tracks, max_layers, max_pixels) =>
{
  nStrands.set(max_strands);
  curStrandID.set(0);
  let elist = [];
  let nlist = [];
  let maxcount = 0;
  for (let i = 0; i < $nStrands; ++i)
  {
    elist.push(false);
    nlist.push(max_pixels[i]);
    if (maxcount < max_pixels[i])
        maxcount = max_pixels[i];
  }
  elist[$curStrandID] = true;
  eStrands.set(elist);
  nPixels.set(nlist);
  maxPixels.set(maxcount);

  nTracks.set(max_tracks);
  tLayers.set(max_layers/max_tracks);

  aTracks.set(1); // track #1 always active
  let list = [];  // create list of booleans
  for (let i = 0; i < $nTracks; ++i) list.push(false);
  let list2 = [...list]; // make copy of this list
  mTracks.set(list);     // all track starts off by being
  sTracks.set(list2);    // not muted and solo disabled

  list = [];  // create list of active layers
  for (let i = 0; i < $nTracks; ++i) list.push(1);
  aLayers.set(list);  // layer #1 always active

  list = [];  // create list of solo/mute enables
  for (let j = 0; j < $tLayers; ++j) list.push(false);

  let alist1 = []; // create array of solo lists
  let alist2 = []; // create array of mute lists
  for (let i = 0; i < $tLayers; ++i)
  {
    let newlist = [...list]; // make copy of list
    alist1.push(newlist);
    newlist = [...list];
    alist2.push(newlist);
  }

  sLayers.set(alist1); // all track starts off by being
  mLayers.set(alist2); // not muted and solo disabled
}