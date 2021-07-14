import { writable } from 'svelte/store'

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
export let eStrands       = writable([]);     // array of current strand enables
export let aStrands       = writable([]);     // contains all strands/tracks/layers
export let dStrands       = writable([]);     // used to hold current device values
export let idStrand       = writable(0);      // current strand index (0...nStrands-1)
export let pStrand        = writable([]);     // "points" to current strand in aStrands

export let nPixels        = writable([]);     // array of pixel counts by strand (not used?) FIXME?
export let maxPixels      = writable(0);      // max pixel count across strands

export let nTracks        = writable(0);      // total number of tracks
export let tLayers        = writable(0);      // total layers for each track

export let aPatterns      = writable([]);     // list of all patterns
export let aEffectsDraw   = writable([]);     // list of all drawing effects
export let aEffectsFilter = writable([]);     // list of all filter effects

export let refreshCmdStr  = writable(false);  // true to refresh command string (HACK)

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
}
