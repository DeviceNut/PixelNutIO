import { get, writable } from 'svelte/store'

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
export let eStrands       = writable(1);      // number of strands currently selected
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let pStrand        = writable([]);     // "points" to current strand

export let nPixels        = writable([]);     // array of pixel counts by strand
export let maxPixels      = writable(0);      // max pixel count across strands

export let nTracks        = writable(0);      // total number of tracks
export let tLayers        = writable(0);      // total layers for each track

export let sTracks        = writable([]);     // array of track solos (booleans)
export let mTracks        = writable([]);     // array of track mutes (booleans)

export let sLayers        = writable([[]]);   // double array of layer solos by track
export let mLayers        = writable([[]]);   // double array of layer mutes by track

export let aPatterns      = writable([]);     // list of all patterns
export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffectsPre    = writable([]);     // list of all predraw effects

export let customMode     = writable(false);  // true if customizing pattern
export let customClear    = writable(true);   // true when custom pattern is clear
export let curPatternID   = writable(0);      // else current pattern index
export let curPatternStr  = writable('');     // current pattern string

export let globalsInit = (max_strands, max_tracks, max_layers, max_pixels) =>
{
  nStrands.set(max_strands);
  nTracks.set(max_tracks);
  tLayers.set(max_layers/max_tracks);

  let nlist = [];
  let maxcount = 0;
  for (let i = 0; i < max_strands; ++i)
  {
    nlist.push(max_pixels[i]);
    if (maxcount < max_pixels[i])
        maxcount = max_pixels[i];
  }
  nPixels.set(nlist);
  maxPixels.set(maxcount);


  let list = [];  // create list of booleans
  for (let i = 0; i < get(nTracks); ++i) list.push(false);
  let list2 = [...list]; // make copy of this list
  mTracks.set(list);     // all track starts off by being
  sTracks.set(list2);    // not muted and solo disabled

  list = [];  // create list of solo/mute enables
  for (let j = 0; j < get(tLayers); ++j) list.push(false);

  let alist1 = []; // create array of solo lists
  let alist2 = []; // create array of mute lists
  for (let i = 0; i < get(tLayers); ++i)
  {
    let newlist = [...list]; // make copy of list
    alist1.push(newlist);
    newlist = [...list];
    alist2.push(newlist);
  }

  sLayers.set(alist1); // all track starts off by being
  mLayers.set(alist2); // not muted and solo disabled
}