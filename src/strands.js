import { get } from 'svelte/store';

import {
  nStrands,
  idStrand,
  pStrand,
  eStrands,
  aStrands,
  dStrands,
  nTracks,
  nLayers,
  MENUID_CUSTOM
} from './globals.js';

import {
  DEF_HUE_DEGREE,
  DEF_PCENT_BRIGHT,
  DEF_PCENT_DELAY,
  MAX_FORCE_VALUE,
  DEF_PCENT_COUNT,
  DEF_FORCE_VALUE
} from './devcmds.js';

import { deviceError } from './devtalk.js';

// 1) To simplify track/layer access, a fixed number of layers are assigned to each track.
// 2) Whenever tracks or layers are added or removed a new pattern has to be generated.
// 3) The device keeps a stack of layers indexed by a layer index value, which is used for
//    identifying trigger sources. Since that depends on the number of active tracks/layers,
//    it needs to be re-calculated each time a pattern is created. And when tracks/layers
//    are added, deleted or moved, a new pattern must be created. A unique ID is used for
//    each layer to facilitate this re-calculation.
// 4) Tracks/layers can be individually enabled/disabled for displaying with the Solo/Mute
//    functions. Disabling a track is functionally the same as disabling the first layer,
//    so there are no such functions available for the first layer of each track.

///////////////////////////////////////////////////////////

const oneLayer =
{
  uniqueID        : 0,      // unique ID for this layer

  open            : true,   // true if displayed
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute

  trigAtStart     : true,   // *true to trigger effect at creation
  trigFromMain    : false,  // *true if can trigger from main controls

  trigOnLayer     : false,  // *true if can trigger from other layer:
  trigSrcListDex  : 0,      //  source list index currently selected (0=none)
                            //  if the above is >0 (user has selected one):
  trigSourceID    : 0,      //  uniqueID for that chosen source layer
  trigDevIndex    : 0,      //  device layer index for trigger source
                            //  (set by parser before source list created)
                            //  (must recalculate this when create pattern)

  trigDoRepeat    : false,  // *true for auto-generated trigger:
  trigForever     : false,  //   *false to select specific count
  trigRepCount    : 1,      //   *number of times to trigger (from 1)
  trigRepOffset   : 0,      //   *offset seconds before range (from 0)
  trigRepRange    : 0,      //   *range of random seconds (from 0)

  forceRandom     : false,  // *true if a random force is applied when triggering
  forceValue      : MAX_FORCE_VALUE/2, // *percent force to apply (if not random)

  pluginIndex     : 0,      // effect plugin index, not value
  pluginBits      : 0x00,   // describes plugin (pluginBit_xxx)

  cmdstr          : ''      // command string for the current settings
}

const drawProps =
{
  pcentBright     : DEF_PCENT_BRIGHT, // percent brightness
  pcentDelay      : DEF_PCENT_DELAY,  // percent delay

  overHue         : false,  // *true to allow global override
  degreeHue       : DEF_HUE_DEGREE, // *hue in degrees (0-MAX_DEGREES_HUE)

  overWhite       : false,  // *true to allow global override
  pcentWhite      : 0,      // *percent whiteness

  overCount       : false,  // *true to allow global override
  pcentCount      : 50,     // *percent of pixels affected in range
                          
  pcentXoffset    : 0,      // *percent of pixels for offset
  pcentXlength    : 100,    // *percent of pixels to be drawn

  dirBackwards    : false,  // *backwards drawing direction (decreasing pixel index)
  orPixelVals     : false,  // *whether pixels overwrites (false) or are OR'ed (true)
}

const oneTrack =
{
  open            : true,   // true if displayed
  trackBits       : 0x00,   // all filter layers pluginBits (unless muted)
                            //  OR'ed with drawing layer pluginBits (always)

  lactives        : 1,      // current number of active layers (>=1)
  layers          : [],     // list of 'oneLayer's for this track
  drawProps       : {},     // drawing properties for first layer
}

const oneStrand =
{
  selected        : false,  // true if selected for modification

  curPattIdOld : -1,     // used to prevent unnecessary selections
  curPatternId    : MENUID_CUSTOM, // menu ID of current pattern
  curPatternName  : '',     // name of current pattern
  curPatternCmd   : '',     // current pattern command
  curPatternDesc  : '',     // current pattern description

  showCustom      : false,  // true if displaying customize panel

  bitsOverride    : 0x00,   // OR'ed overrides from all track layers
  bitsEffects     : 0x00,   // OR'ed trackBits from all track layers
  triggerUsed     : false,  // true if effect(s) allow(s) main triggering

  pcentBright     : 0,      // *percent bright
  pcentDelay      : 0,      // *percent delay
  pixelOffset     : 0,      // *pixel offset to start drawing from

  doOverride      : false,  // *true to override local properties with:
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness
  pcentCount      : 0,      // percent of pixels affected in range

  forceValue      : MAX_FORCE_VALUE/2, // force value for triggering
  numPixels       : 0,      // number of pixels in this strand

  tactives        : 0,      // current number of active tracks
  tracks          : [],     // list of 'oneTrack's for this strand

  trigSources     : [],     // list of trigger source layer info
}
// * shadow value used to test for actual user changes

export const overBit_DegreeHue    = 1;      // overwrite degreeHue
export const overBit_PcentWhite   = 2;      // overwrite pcentWhite
export const overBit_PcentCount   = 4;      // overwrite pcentCount

function makeOneLayer()
{
  let layer = {...oneLayer};
  layer.uniqueID = 'LID' + (Math.random() + 1).toString(36).substr(-6);
  //console.log('ID=', layer.uniqueID);
  return layer;
}

function makeOneTrack()
{
  let track = {...oneTrack};
  let layers = [];

  track.drawProps = {...drawProps};

  for (let j = 0; j < get(nLayers); ++j)
    layers.push( makeOneLayer() );

  track.layers = layers;

  return track;
}

function makeNewTracks(s)
{
  let tracks = [];

  for (let i = 0; i < get(nTracks); ++i)
    tracks.push( makeOneTrack() );

  return tracks;
}

export const strandCreateNew = (s) =>
{
  let strand = {...oneStrand};
  strand.tracks = makeNewTracks();
  return strand;
}

// copy all top level values from current strand
// to all the other currently selected strands
export const strandCopyTop = () =>
{
  const sid = get(idStrand);
  const ps = get(pStrand);

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (s !== sid)
    {
      const strand = get(aStrands)[s];
      if (strand.selected)
      {
        strand.curPattIdOld   = ps.curPattIdOld;
        strand.curPatternId   = ps.curPatternId;
        strand.curPatternName = ps.curPatternName;
        strand.curPatternCmd  = ps.curPatternCmd;
        strand.curPatternDesc = ps.curPatternDesc;

        strand.showCustom     = ps.showCustom;
        strand.bitsOverride   = ps.bitsOverride;
        strand.bitsEffects    = ps.bitsEffects;

        strand.pcentBright    = ps.pcentBright;
        strand.pcentDelay     = ps.pcentDelay;
        strand.pixelOffset    = ps.pixelOffset;
        strand.doOverride     = ps.doOverride;
        strand.degreeHue      = ps.degreeHue;
        strand.pcentWhite     = ps.pcentWhite;
        strand.pcentCount     = ps.pcentCount;
        strand.forceValue     = ps.forceValue;
      }
      get(eStrands)[s] = strand.selected;
    }
  }
}

// copy values in entire layer from current strand
// to all the other currently selected strands
export const strandCopyLayer = (track, layer) =>
{
  const sid = get(idStrand);
  const props = get(pStrand).tracks[track].drawProps;
  const player = get(pStrand).tracks[track].layers[layer];

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (s !== sid)
    {
      const strand = get(aStrands)[s];
      if (strand.selected)
      {
        strand.tracks[track].layers.splice(layer, 1, {...player});

        if (layer === 0)
          strand.tracks[track].drawProps = {...props};
      }
    }
  }
}

// copy values in entire track from current strand
// to all the other currently selected strands
export const strandCopyTrack = (track, doall) =>
{
  const sid = get(idStrand);
  const strand = get(pStrand);
  const isopen = strand.tracks[track].open;
  const trackbits = strand.tracks[track].trackBits;
  const lactives = strand.tracks[track].lactives;
  const props = strand.tracks[track].drawProps;

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (s !== sid)
    {
      const strand = get(aStrands)[s];
      if (strand.selected)
      {
        if (doall && !track) strand.tactives = strand.tactives;

        const ptrack = strand.tracks[track];

        ptrack.open = isopen;
        ptrack.trackBits = trackbits;
        ptrack.lactives = lactives;
        ptrack.drawProps = {...props};

        for (let layer = 0; layer < lactives; ++layer)
        {
          const player = strand.tracks[track].layers[layer];
          ptrack.layers.splice(layer, 1, {...player});
        }
      }
    }
  }
}

// copy values in all tracks from current strand
// to all the other currently selected strands
export const strandCopyTracks = () =>
{
  const tactives = get(pStrand).tactives;

  for (let track = 0; track < tactives; ++track)
    strandCopyTrack(track, true);
}

// copy all values for current strand to all other selected ones
export const strandCopyAll = () =>
{
  strandCopyTop();
  strandCopyTracks();
  //console.log(get(aStrands)); // DEBUG
}

// clears all main property values for the current strand to defaults
export const strandClearTop = () =>
{
  const strand = get(pStrand);
  // Don't reset global brightness and delay FIXME?
  //strand.pcentBright    = 50; // diffeent default for global control
  //strand.pcentDelay     = 0;
  strand.pixelOffset    = 0;
  strand.doOverride     = false;
  strand.degreeHue      = 0;
  strand.pcentWhite     = 0;
  strand.pcentCount     = DEF_PCENT_COUNT;
  strand.forceValue     = DEF_FORCE_VALUE;
}

// clears all values for all tracks in the current strand
export const strandClearAll = (track) =>
{
  let sid = get(idStrand);
  get(aStrands)[sid].tactives = 0;
  get(aStrands)[sid].tracks = makeNewTracks();

  get(dStrands)[sid].tactives = 0;
  get(dStrands)[sid].tracks = makeNewTracks();

  strandClearTop();
  strandCopyAll();
}

// clears all values for a track in the current strand
// and copies it to all other selected strands
export const strandClearTrack = (track) =>
{
  let sid = get(idStrand);
  get(aStrands)[sid].tracks.splice(track, 1, makeOneTrack());
  get(dStrands)[sid].tracks.splice(track, 1, makeOneTrack());

  strandCopyTrack(track);
}

// clears all values for a track layer in the current strand
// and copies it to all other selected strands
export const strandClearLayer = (track, layer) =>
{
  let sid = get(idStrand);
  get(aStrands)[sid].tracks[track].layers.splice(layer, 1, makeOneLayer());
  get(dStrands)[sid].tracks[track].layers.splice(layer, 1, makeOneLayer());

  strandCopyLayer(track, layer);
}

// for all selected strands: activate new track,
// and if not the last one, then delete track from
// the end and splice it after the one specified 
export const strandAppendTrack = (track) =>
{
  for (let s = 0; s < get(nStrands); ++s)
  {
    ++(get(aStrands)[s].tactives);
    ++(get(dStrands)[s].tactives);

    if (get(aStrands)[s].selected)
    {
      if (track < get(aStrands)[s].tactives)
      {
        let lasttrack = get(nTracks)-1;
        get(aStrands)[s].tracks.splice(lasttrack+1, 1);
        get(dStrands)[s].tracks.splice(lasttrack+1, 1);

        get(aStrands)[s].tracks.splice(track+1, 0, makeOneTrack());
        get(dStrands)[s].tracks.splice(track+1, 0, makeOneTrack());
      }
    }
  }
}

// for all selected strands: activate new layer,
// and if not the last one, then delete layer from
// the end and splice it after the one specified 
export const strandAppendLayer = (track, layer) =>
{
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      ++(get(aStrands)[s].tracks[track].lactives);
      ++(get(dStrands)[s].tracks[track].lactives);

      if (layer < get(aStrands)[s].tracks[track].lactives)
      {
        let lastlayer = get(nLayers)-1;
        get(aStrands)[s].tracks[track].layers.splice(lastlayer, 1);
        get(dStrands)[s].tracks[track].layers.splice(lastlayer, 1);

        get(aStrands)[s].tracks[track].layers.splice(layer+1, 0, makeOneLayer() );
        get(dStrands)[s].tracks[track].layers.splice(layer+1, 0, makeOneLayer() );
      }
    }
  }
}

// for all selected strands: deactivate one track,
// and if not the last one, then remove specified
// track and append it at the end
export const strandRemoveTrack = (track) =>
{
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      --(get(aStrands)[s].tactives);
      --(get(dStrands)[s].tactives);

      if (track < get(aStrands)[s].tactives)
      {
        get(aStrands)[s].tracks.splice(track, 1);
        get(aStrands)[s].tracks.push( makeOneTrack() );

        get(dStrands)[s].tracks.splice(track, 1);
        get(dStrands)[s].tracks.push( makeOneTrack() );
      }
    }
  }
}

// for all selected strands: deactivate one layer,
// and if not the last one, then remove specified
// layer and append it at the end
export const strandRemoveLayer = (track, layer) =>
{
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      --(get(aStrands)[s].tracks[track].lactives);
      --(get(dStrands)[s].tracks[track].lactives);

      if (layer < get(aStrands)[s].tracks[track].lactives)
      {
        get(aStrands)[s].tracks[track].layers.splice(layer, 1);
        get(aStrands)[s].tracks[track].layers.push( makeOneLayer() );
  
        get(dStrands)[s].tracks[track].layers.splice(layer, 1);
        get(dStrands)[s].tracks[track].layers.push( makeOneLayer() );
      }
    }
  }
}

// swaps specified track for the one after in all selected strands
export const strandSwapTracks = (track) =>
{
  let tsave;
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      tsave = get(aStrands)[s].tracks.splice(track, 1)[0];
      get(aStrands)[s].tracks.splice(track+1, 0, tsave);

      tsave = get(dStrands)[s].tracks.splice(track, 1)[0];
      get(dStrands)[s].tracks.splice(track+1, 0, tsave);
    }
  }
}

// swaps specified track layer for the one after in all selected strands
export const strandSwapLayers = (track, layer) =>
{
  let tsave;
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      tsave = get(aStrands)[s].tracks[track].layers.splice(layer, 1)[0];
      get(aStrands)[s].tracks[track].layers.splice(layer+1, 0, tsave);

      tsave = get(dStrands)[s].tracks[track].layers.splice(layer, 1)[0];
      get(dStrands)[s].tracks[track].layers.splice(layer+1, 0, tsave);
    }
  }
}

// convert device layer index to track,layer
// returns null if index not valid, else object
export const convIndexToTrackLayer = (index) =>
{
  let track = 0;

  for (let i = 0; i < get(pStrand).tactives; ++i)
  {
    if (index < get(pStrand).tracks[i].lactives)
    {
      //console.log(`conv: ${index} => ${track}:${layer}`); // DEBUG
      return { track:track, layer:index };
    }

    index -= get(pStrand).tracks[i].lactives;
    ++track;
  }

  return null;
}

// convert track,layer to device layer index
// returns null if track/layer is invalid
// and creates program error message which
// forces user back to the devices page
export const convTrackLayerToIndex = (track, layer) =>
{
  let index = 0;
  let strand = get(pStrand);

  if (track >= strand.tactives)
  {
    deviceError(`No track=${track+1}`);
    return null;
  }

  if (layer >= strand.tracks[track].lactives)
  {
    deviceError(`No layer=${layer+1}, track=${track+1}`);
    return null;
  }

  for (let i = 0; i < track; ++i)
    for (let j = 0; j < strand.tracks[i].lactives; ++j)
      ++index;

  for (let j = 0; j < layer; ++j)
    ++index;

  //console.log(`conv: ${track}:${layer} => ${index}`); // DEBUG
  return index;
}

