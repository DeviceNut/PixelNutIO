import { get } from 'svelte/store';

import {
  MIN_TRACK_LAYERS,
  nStrands, idStrand, pStrand,
  eStrands, aStrands, dStrands,
  nTracks, tLayers
} from './globals.js';

import { MAX_FORCE } from './pixcmds.js';

// 1) To simplify track/layer access, a fixed number of layers are assigned to each track.
// 2) Whenever tracks or layers are added or removed a new pattern has to be generated.
// 3) The device's pixel engine keeps a stack of layers indexed by a layer id, the value
//    of which is used for assigning trigger targets, and since that depends on the number
//    of active tracks/layers, it needs to be re-calculated each time a pattern is generated.
// 4) Active tracks/layers are the ones displayed that can be modified. The user can change
//    these with the Add/Del buttons, up to the limits of the device.
// 5) Tracks/layers can be individually enabled/disabled (except for the first layer of each track)
//    with the Solo/Mute buttons.

///////////////////////////////////////////////////////////

const oneLayer =
{
  pluginIndex     : 0,      // effect plugin index, not value (0=none)
  pluginBits      : 0x00,   // bits describing plugin (pluginBit_ values)

  open            : true,   // true if displayed
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute

  trigAutoStart   : true,   // true to auto start effect, if not then:
  trigFromMain    : false,  // true if can trigger from main controls

  trigDoLayer     : false,  // true if can trigger from other layer:
  trigListDex     : 0,      //  index into list of possible source layers
  trigTrackNum    : 1,      //  the track number that will trigger (from 1)
  trigLayerNum    : 1,      //  the layer number of that track (from 1)

  trigTypeStr     : 'once', // or 'once', or if 'auto' (auto triggering), then:
  trigDoRepeat    : true,   // true to repeat forever, else:
  trigRepCount    : 1,      //  number of times to repeat trigger (at least 1)
  trigDelayMin    : 1,      //  min seconds before next trigger (at least 1)
  trigDelayRange  : 0,      //  range of delay values possible (min...min+range)

  forceRandom     : false,  // true if a random force is applied when triggering
  forceValue      : MAX_FORCE/2, // percent force to apply (if not random)

  cmdstr          : ''      // command string for the current settings
}

const drawProps =
{
  pcentBright     : 100,    // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 0,      // determines msecs delay after each redraw

  overHue         : false,  // true to allow global override
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)

  overWhite       : false,  // true to allow global override
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)

  overCount       : false,  // true to allow global override
  pcentCount      : 0,      // percent of pixels affected in range
                          
  pcentOffset     : 0,      // percent of pixels for offset
  pcentExtent     : 100,    // percent of pixels to be drawn
                            //  (start must be <= finish)

  reverseDir      : false,  // reverse drawing direction (false for increasing pixel index)
  orPixelVals     : false,  // whether pixels overwrites (false) or are OR'ed (true)
}

const oneTrack =
{
  open            : true,   // true if displayed
  trackBits       : 0x00,   // all filter layers OR'ed with drawing layer

  lactives        : 1,      // current number of active layers (>=1)
  layers          : [],     // list of 'oneLayer's for this track
  drawProps       : {},     // drawing properties for first layer
}

const oneStrand =
{
  selected        : false,  // true if selected for modification
  showCustom      : false,  // true if displaying customize panel

  indexSources    : 0,      // index into sources list
  indexPatterns   : 0,      // index into patterns list
  fromStored      : false,  // true if current pattern from storage

  curPatternStr   : '',     // active pattern command string
                            // (as created from current settings)

  bitsOverride    : 0x00,   // OR'ed overrides from all track layers
  bitsEffects     : 0x00,   // OR'ed effect bits from all track layers

  pcentBright     : 80,     // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 50,     // determines msecs delay after each redraw
  firstPixel      : 1,      // determines pixel to start drawing from
  directUp        : 1,      // 0 to draw in reverse direction // TODO

  doOverride      : false,  // true to override local properties with:
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)
  pcentCount      : 0,      // percent of pixels affected in range

  forceValue      : MAX_FORCE/2, // force value for triggering
  numPixels       : 0,      // number of pixels in this strand

  tactives        : 1,      // current number of active tracks (>=1)
  tracks          : [],     // list of 'oneTrack's for this strand
}

function makeOneTrack()
{
  let track = {...oneTrack};
  let layers = [];

  track.drawProps = {...drawProps};

  for (let j = 0; j < get(tLayers); ++j)
    layers.push( {...oneLayer} );

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

export const makeNewStrand = (s) =>
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
        strand.showCustom     = ps.showCustom;
        strand.indexSources   = ps.indexSources;
        strand.indexPatterns  = ps.indexPatterns;
        strand.fromStored     = ps.fromStored;

        strand.curPatternStr  = ps.curPatternStr;
        strand.bitsOverride   = ps.bitsOverride;
        strand.bitsEffects    = ps.bitsEffects;

        strand.pcentBright    = ps.pcentBright;
        strand.msecsDelay     = ps.msecsDelay;
        strand.firstPixel     = ps.firstPixel;
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
  const props = get(pStrand).tracks[track].drawProps;
  const lactives = get(pStrand).tracks[track].lactives;
  const trackbits = get(pStrand).tracks[track].trackBits;
  const isopen = get(pStrand).tracks[track].open;

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (s !== sid)
    {
      const strand = get(aStrands)[s];
      if (strand.selected)
      {
        if (doall && !track) strand.tactives = get(pStrand).tactives;

        const ptrack = strand.tracks[track];

        ptrack.open = isopen;
        ptrack.trackBits = trackbits;
        ptrack.lactives = lactives;
        ptrack.drawProps = {...props};

        for (let layer = 0; layer < lactives; ++layer)
        {
          const player = get(pStrand).tracks[track].layers[layer];
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

// clears all values for all tracks in the current strand
export const strandClearAll = (track) =>
{
  let sid = get(idStrand);
  get(aStrands)[sid].tactives = 1;
  get(aStrands)[sid].tracks = makeNewTracks();

  get(dStrands)[sid].tactives = 1;
  get(dStrands)[sid].tracks = makeNewTracks();

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
  get(aStrands)[sid].tracks[track].layers.splice(layer, 1, {...oneLayer});
  get(dStrands)[sid].tracks[track].layers.splice(layer, 1, {...oneLayer});

  strandCopyLayer(track, layer);
}

// swaps specified track for the one below in the current strand
// and copies both tracks to all other selected strands
export const strandSwapTracks = (track) =>
{
  let sid = get(idStrand);
  let track1 = get(aStrands)[sid].tracks[track-1];
  let track2 = get(aStrands)[sid].tracks[track];

  get(aStrands)[sid].tracks[track-1] = track2;
  get(aStrands)[sid].tracks[track] = track1;

  get(dStrands)[sid].tracks[track-1] = track2;
  get(dStrands)[sid].tracks[track] = track1;

  strandCopyTrack(track-1);
  strandCopyTrack(track);
}

// swaps specified track layer for the one below in the current strand
// and copies both layers to all other selected strands
export const strandSwapLayers = (track, layer) =>
{
  let sid = get(idStrand);
  let layer1 = get(aStrands)[sid].tracks[track].layers[layer-1];
  let layer2 = get(aStrands)[sid].tracks[track].layers[layer];

  get(aStrands)[sid].tracks[track].layers[layer-1] = layer2;
  get(aStrands)[sid].tracks[track].layers[layer] = layer1;

  get(dStrands)[sid].tracks[track].layers[layer-1] = layer2;
  get(dStrands)[sid].tracks[track].layers[layer] = layer1;

  strandCopyLayer(track, layer-1);
  strandCopyLayer(track, layer);
}
