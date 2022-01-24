import { get } from 'svelte/store';

import {
  nStrands,
  idStrand,
  pStrand,
  eStrands,
  aStrands,
  nTracks,
  nLayers
} from './globals.js';

import {
  DEF_HUE_VALUE,
  DEF_PCENT_BRIGHT,
  DEF_PCENT_DELAY,
  DEF_PCENT_COUNT,
  DEF_FORCE_VALUE
} from './devcmds.js';

import { deviceError } from './devtalk.js';
import { MENUID_CUSTOM } from './menu.js';

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

  trigAtStart     : true,   // true to trigger effect at creation
  trigFromMain    : false,  // true if can trigger from main controls

  trigOnLayerShow : false,  // true if user has enabled trigger list dropdown
  trigSrcListDex  : 0,      //  source list index currently selected (0=none)
                            //  if the above is >0 (user has selected one):
  trigSrcLayerID  : 0,      //  uniqueID for that chosen source layer
  trigSrcLayerDex : 0,      //  device layer index for trigger source
                            //  (set by parser before source list created)
                            //  (must recalculate this when create pattern)

  trigDoRepeat    : false,  // true for auto-generated trigger:
  trigForever     : false,  //   false to select specific count
  trigRepCount    : 1,      //   number of times to trigger (from 1)
  trigRepOffset   : 0,      //   offset seconds before range (from 0)
  trigRepRange    : 0,      //   range of random seconds (from 0)

  forceRandom     : false,  // true if a random force is applied when triggering
  forceValue      : DEF_FORCE_VALUE, // percent force to apply (if not random)

  plugindex       : 0,      // index into effect list as chosen by user
  pluginObj       : {},     // object returned from findEffectFromIndex()
                            //  that contains all info on an effect

  cmdstr          : '',     // command string for the current settings
  isnewstr        : false   // true if command string has changed
}

const drawProps =
{
  pcentBright     : DEF_PCENT_BRIGHT, // percent brightness
  pcentDelay      : DEF_PCENT_DELAY,  // percent delay

  overHue         : false,  // true to allow global override
  valueHue        : DEF_HUE_VALUE, // hue in degrees (0-MAX_HUE_VALUE)

  overWhite       : false,  // true to allow global override
  pcentWhite      : 0,      // percent whiteness

  overCount       : false,  // true to allow global override
  pcentCount      : 50,     // percent of pixels affected in range
                          
  pcentXoffset    : 0,      // percent of pixels for offset
  pcentXlength    : 100,    // percent of pixels to be drawn

  orPixelVals     : false,  // whether pixels overwrites (false) or are OR'ed (true)
  dirBackwards    : false,  // backwards drawing direction (decreasing pixel index)
  noRepeating     : false,  // action does not repeat, else continuous
}

const oneTrack =
{
  open            : true,   // true if displayed
  trackBits       : 0x00,   // all filter layers plugin bits OR'ed with
                            //  drawing layer plugin bits (unless muted)

  lactives        : 1,      // current number of active layers (>=1)
  layers          : [],     // list of 'oneLayer's for this track
  drawProps       : {},     // drawing properties for first layer
  saveProps       : {}      // used to detect changes in properties
}

const orideProps =
{
  doEnable        : false,  // true to override local properties with:
  valueHue        : 0,      // hue value (0-MAX_HUE_VALUE)
  pcentWhite      : 0,      // percent whiteness
  pcentCount      : 0,      // percent of pixels affected in range
}

const trigSrcItem =
{
  // used by UI to display items to user:
  id              : 0,      // list index
  text            : '',     // display text

  // used internally to identify source:
  devindex        : 0,      // value sent to device (layer index)
  sourceid        : 0,      // unique layer ID
  track           : 0,      // track index
  layer           : 0       // track layer index
}

const oneStrand =
{
  selected        : false,  // true if selected for modification

  curPatternId    : MENUID_CUSTOM, // menu ID of current pattern
  curPatternName  : '',     // name of current pattern
  curPatternCmd   : '',     // current pattern command
  curPatternDesc  : '',     // current pattern description

  bitsOverride    : 0x00,   // OR'ed overrides from all track layers
  bitsEffects     : 0x00,   // OR'ed trackBits from all track layers
  triggerUsed     : false,  // true if effect(s) allow(s) main triggering

  pcentBright     : 0,      // percent bright
  pcentDelay      : 0,      // percent delay
  pixelOffset     : 0,      // pixel offset to start drawing from
  forceValue      : DEF_FORCE_VALUE, // force value for triggering

  opropsUser      : {},     // override properties set by user
  opropsSent      : {},     // override properties sent to device

  numPixels       : 0,      // number of pixels in this strand
  tactives        : 0,      // current number of active tracks
  tracks          : [],     // list of 'oneTrack's for this strand

  trigSources     : [],     // list of 'trigSrcItem'
}

export const overBit_DegreeHue    = 1;      // overwrite valueHue
export const overBit_PcentWhite   = 2;      // overwrite pcentWhite
export const overBit_PcentCount   = 4;      // overwrite pcentCount

function makeOneLayer()
{
  let layer = {...oneLayer};
  layer.uniqueID = 'LID' + (Math.random() + 1).toString(36).slice(-8);
  //console.log(`makeOneLayer: ID=${layer.uniqueID}`);
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
  strand.opropsUser = {...orideProps};
  strand.opropsSent = {...orideProps};
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
        strand.curPatternId   = ps.curPatternId;
        strand.curPatternName = ps.curPatternName;
        strand.curPatternCmd  = ps.curPatternCmd;
        strand.curPatternDesc = ps.curPatternDesc;

        strand.bitsOverride   = ps.bitsOverride;
        strand.bitsEffects    = ps.bitsEffects;
        strand.triggerUsed    = ps.triggerUsed;

        strand.pcentBright    = ps.pcentBright;
        strand.pcentDelay     = ps.pcentDelay;
        strand.pixelOffset    = ps.pixelOffset;
        strand.forceValue     = ps.forceValue;

        strand.opropsUser.doEnable   = ps.opropsUser.doEnable;
        strand.opropsUser.valueHue   = ps.opropsUser.valueHue;
        strand.opropsUser.pcentWhite = ps.opropsUser.pcentWhite;
        strand.opropsUser.pcentCount = ps.opropsUser.pcentCount;

        strand.opropsUser.doEnable   = ps.opropsUser.doEnable;
        strand.opropsUser.valueHue   = ps.opropsUser.valueHue;
        strand.opropsUser.pcentWhite = ps.opropsUser.pcentWhite;
        strand.opropsUser.pcentCount = ps.opropsUser.pcentCount;

        strand.trigSources = [];
        for (let i = 0; i < ps.trigSources.length; ++i)
          strand.trigSources.push( {...ps.trigSources[i]} );
      }
      get(eStrands)[s] = strand.selected;
    }
  }
}

// copy values in entire layer from current strand
// to all the other currently selected strands
export const strandCopyLayer = (track, layer) =>
{
  const sid     = get(idStrand);
  const strand  = get(pStrand);
  const props   = strand.tracks[track].drawProps;
  const player  = strand.tracks[track].layers[layer];

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
  const sid       = get(idStrand);
  const strand    = get(pStrand);
  const isopen    = strand.tracks[track].open;
  const trackbits = strand.tracks[track].trackBits;
  const lactives  = strand.tracks[track].lactives;
  const props     = strand.tracks[track].drawProps;

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
}

// clears all values for all tracks in the current strand
export const strandClearAll = (track) =>
{
  const strand = get(pStrand);

  strand.tactives = 0;
  strand.tracks = makeNewTracks();

  strand.pixelOffset = 0;
  strand.forceValue = DEF_FORCE_VALUE;

  strand.opropsUser.doEnable = false;
  strand.opropsUser.valueHue = 0;
  strand.opropsUser.pcentWhite = 0;
  strand.opropsUser.pcentCount = DEF_PCENT_COUNT;

  strandCopyAll();
}

// clears all values for a track in the current strand
// and copies it to all other selected strands
export const strandClearTrack = (track) =>
{
  get(pStrand).tracks.splice(track, 1, makeOneTrack());

  strandCopyTrack(track);
}

// clears all values for a track layer in the current strand
// and copies it to all other selected strands
export const strandClearLayer = (track, layer) =>
{
  get(pStrand).tracks[track].layers.splice(layer, 1, makeOneLayer());

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

    if (get(aStrands)[s].selected)
    {
      if (track < get(aStrands)[s].tactives)
      {
        let lasttrack = get(nTracks)-1;
        get(aStrands)[s].tracks.splice(lasttrack+1, 1);
        get(aStrands)[s].tracks.splice(track+1, 0, makeOneTrack());
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

      if (layer < get(aStrands)[s].tracks[track].lactives)
      {
        let lastlayer = get(nLayers)-1;
        get(aStrands)[s].tracks[track].layers.splice(lastlayer, 1);
        get(aStrands)[s].tracks[track].layers.splice(layer+1, 0, makeOneLayer() );
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

      if (track < get(aStrands)[s].tactives)
      {
        get(aStrands)[s].tracks.splice(track, 1);
        get(aStrands)[s].tracks.push( makeOneTrack() );
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

      if (layer < get(aStrands)[s].tracks[track].lactives)
      {
        get(aStrands)[s].tracks[track].layers.splice(layer, 1);
        get(aStrands)[s].tracks[track].layers.push( makeOneLayer() );
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
      //console.log(`conv: ${index} => ${track}:${layer}`);
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

  //console.log(`conv: ${track}:${layer} => ${index}`);
  return index;
}
