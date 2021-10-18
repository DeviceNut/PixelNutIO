import { get } from 'svelte/store';

import {
  nStrands,
  idStrand,
  pStrand,
  eStrands,
  aStrands,
  dStrands,
  nTracks,
  tLayers
} from './globals.js';

import {
  MAX_FORCE_VALUE,
  DEF_PCENT_BRIGHT,
  DEF_PCENT_COUNT,
  DEF_FORCE_VALUE
  } from './pixcmds.js';

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
  pluginIndex     : 0,      // effect plugin index, not value
  pluginBits      : 0x00,   // bits describing plugin (pluginBit_ values)

  open            : true,   // true if displayed
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute

  trigAtStart     : true,   // true to trigger effect at creation
  trigFromMain    : false,  // true if can trigger from main controls

  trigOnLayer     : false,  // true if can trigger from other layer:
  trigListDex     : 0,      //  index into list of possible source layers
  trigTrackNum    : 1,      //  the track number that will trigger (from 1)
  trigLayerNum    : 1,      //  the layer number of that track (from 1)

  trigDoRepeat    : false,  // true for auto-generated trigger:
  trigForever     : false,  //   false to select specific count
  trigRepCount    : 1,      //   number of times to trigger (from 1)
  trigRepOffset   : 0,      //   offset seconds before range (from 0)
  trigRepRange    : 0,      //   range of random seconds (from 0)

  forceRandom     : false,  // true if a random force is applied when triggering
  forceValue      : MAX_FORCE_VALUE/2, // percent force to apply (if not random)

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
  pcentCount      : 50,     // percent of pixels affected in range
                          
  pcentXoffset    : 0,      // percent of pixels for offset
  pcentXlength    : 100,    // percent of pixels to be drawn

  dirBackwards    : false,  // backwards drawing direction (decreasing pixel index)
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

  showMenu        : true,   // true to display source/pattern menus
  showCustom      : false,  // true if displaying customize panel

  curSourceIdx    : 0,      // index into current sources list
  browserSource   : false,  // true if that is the browser list

  curPatternIdx   : 0,      // index into current patterns list
  curPatternStr   : '',     // current pattern command string
                            // (as created from current settings)

  bitsOverride    : 0x00,   // OR'ed overrides from all track layers
  bitsEffects     : 0x00,   // OR'ed effect bits from all track layers
  triggerUsed     : false,  // true if effect(s) allow(s) main triggering

  pcentBright     : 80,     // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 0,      // msecs delay after each redraw
  pixelOffset     : 0,      // pixel offset to start drawing from

  doOverride      : false,  // true to override local properties with:
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)
  pcentCount      : 0,      // percent of pixels affected in range

  forceValue      : MAX_FORCE_VALUE/2, // force value for triggering
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
        strand.showMenu       = ps.showMenu;
        strand.showCustom     = ps.showCustom;
        strand.sourceType     = ps.sourceType;
        strand.browserSource  = ps.browserSource
        strand.curSourceIdx   = ps.curSourceIdx;
        strand.curPatternIdx  = ps.curPatternIdx;
        strand.curPatternStr  = ps.curPatternStr;
        strand.bitsOverride   = ps.bitsOverride;
        strand.bitsEffects    = ps.bitsEffects;

        strand.pcentBright    = ps.pcentBright;
        strand.msecsDelay     = ps.msecsDelay;
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

// clears all main property values for the current strand to defaults
export const strandClearTop = () =>
{
  const strand = get(pStrand);
  // Don't reset global brightness and delay FIXME?
  //strand.pcentBright    = 50; // diffeent default for global control
  //strand.msecsDelay     = 0;
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
  get(aStrands)[sid].tactives = 1;
  get(aStrands)[sid].tracks = makeNewTracks();

  get(dStrands)[sid].tactives = 1;
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
  get(aStrands)[sid].tracks[track].layers.splice(layer, 1, {...oneLayer});
  get(dStrands)[sid].tracks[track].layers.splice(layer, 1, {...oneLayer});

  strandCopyLayer(track, layer);
}

// swaps specified track for the one after in all selected strands
export const strandSwapTracks = (track) =>
{
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      let tsave = get(aStrands)[s].tracks.splice(track, 1)[0];
      get(aStrands)[s].tracks.splice(track+1, 0, tsave);
    }
  }
}

// swaps specified track layer for the one after in the current strand
// and copies both layers to all other selected strands
export const strandSwapLayers = (track, layer) =>
{
  for (let s = 0; s < get(nStrands); ++s)
  {
    if (get(aStrands)[s].selected)
    {
      let tsave = get(aStrands)[s].tracks[track].layers.splice(layer, 1)[0];
      get(aStrands)[s].tracks[track].layers.splice(layer+1, 0, tsave);
    }
  }
}
