import { get } from 'svelte/store';

import {
  nStrands, idStrand, pStrand,
  eStrands, aStrands, dStrands,
  nTracks, tLayers
} from './globals.js';

import { MAX_FORCE } from "./pixelnut.js"

const oneLayer =
{
  pluginIndex     : 0,      // effect plugin index, not value (0=none)
  pluginBits      : 0x00,   // bits describing plugin (pluginBit_ values)

  //////////////////////////// only used for filter layers:
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute

  trigDoManual    : false,  // true if can trigger manually from Main Panel
  trigDoLayer     : false,  // true if can trigger from other layer:
  trigTrackNum    : 1,      //  the track number that will trigger (from 1)
  trigLayerNum    : 1,      //  the layer number of that track (from 1)
  trigTypeStr     : 'once', // or 'none' or if 'auto' (auto triggering), then:
  trigDoRepeat    : true,   // true to repeat forever, else:
  trigRepCount    : 1,      //  number of times to repeat trigger (at least 1)
  trigDelayMin    : 1,      //  min seconds before next trigger (at least 1)
  trigDelayRange  : 0,      //  range of delay values possible (min...min+range)

  forceRandom     : true,   // true if a random force is applied when triggering
  forceValue      : MAX_FORCE/2, // percent force to apply (if not random)
  ////////////////////////////

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
                          
  pcentStart      : 0,      // percent of pixels where start
  pcentFinish     : 100,    // percent of pixels where finish
                            //  (start must be <= finish)

  reverseDir      : false,  // reverse drawing direction (false for increasing pixel index)
  orPixelVals     : false,  // whether pixels overwrites (false) or are OR'ed (true)
}

const oneTrack =
{
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute

  lactives        : 1,      // current number of active layers (>=1)
  layers          : [],     // list of 'oneLayer's for this track
  drawProps       : {},     // drawing properties for first layer
}

const oneStrand =
{
  selected        : false,  // true if selected for modification

  patternID       : 0,      // current pattern index
  patternStr      : '',     // current pattern string
  backupStr       : '',     // reverts to know good after bad edit
  
  pcentBright     : 80,     // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 50,     // determines msecs delay after each redraw
  firstPixel      : 1,      // determines pixel to start drawing from

  doOverride      : false,  // true to override local properties with:
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)
  pcentCount      : 0,      // percent of pixels affected in range

  forceValue      : MAX_FORCE/2, // force value for triggering

  tactives        : 1,      // current number of active tracks (>=1)
  tracks          : [],     // list of 'oneTrack's for this strand
}

function makeNewTracks(s)
{
  let tracks = [];
  for (let i = 0; i < get(nTracks); ++i)
  {
    let track = {...oneTrack};
    track.drawProps = {...drawProps};

    let layers = [];
    for (let j = 0; j < get(tLayers); ++j)
    {
      let layer = {...oneLayer};
      layers.push(layer);
    }

    track.layers = layers;
    tracks.push(track);
  }

  return tracks;
}

function makeNewStrand(s)
{
  let strand = {...oneStrand};
  strand.tracks = makeNewTracks();
  return strand;
}

export const patternsInit = () =>
{
  const sid = get(idStrand);
  let slist = [];
  let elist = [];

  for (let s = 0; s < get(nStrands); ++s)
  {
    const strand = makeNewStrand(s);
    const select = (s == sid) ? true : false;
    strand.selected = select;
    slist.push(strand);
    elist.push(select);
  }

  aStrands.set(slist);
  eStrands.set(elist);
  pStrand.set(slist[sid]);

  // make duplicate object to keep shadow values
  slist = [];
  for (let s = 0; s < get(nStrands); ++s)
    slist.push(makeNewStrand(s));

  dStrands.set(slist);
}

// copy all top level values from current strand
// to all the other currently selected strands
export const copyStrandTop = () =>
{
  const sid = get(idStrand);
  const ps = get(pStrand);

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (s != sid)
    {
      const strand = get(aStrands)[s];
      if (strand.selected)
      {
        strand.patternID   = ps.patternID;
        strand.patternStr  = ps.patternStr;
        strand.backupStr   = ps.backupStr;
        strand.pcentBright = ps.pcentBright;
        strand.msecsDelay  = ps.msecsDelay;
        strand.firstPixel  = ps.firstPixel;
        strand.doOverride  = ps.doOverride;
        strand.degreeHue   = ps.degreeHue;
        strand.pcentWhite  = ps.pcentWhite;
        strand.pcentCount  = ps.pcentCount;
        strand.forceValue  = ps.forceValue;
      }
      get(eStrands)[s] = strand.selected;
    }
  }
}

// copy values in entire layer from current strand
// to all the other currently selected strands
export const copyStrandLayer = (track, layer) =>
{
  const sid = get(idStrand);
  const props = get(pStrand).tracks[track].drawProps;
  const player = get(pStrand).tracks[track].layers[layer];

  for (let s = 0; s < get(nStrands); ++s)
  {
    if (s != sid)
    {
      const strand = get(aStrands)[s];
      if (strand.selected)
      {
        strand.tracks[track].layers[layer] = {...player};

        if (layer == 0)
          strand.tracks[track].drawProps = {...props};
      }
    }
  }
}

// copy all values for current strand to all other selected ones
export const copyStrand = () =>
{
  copyStrandTop();

  for (let track = 0; track < get(pStrand).tactives; ++track)
    for (let layer = 0; layer < get(pStrand).tracks[track].lactives; ++layer)
      copyStrandLayer(track, layer);
}

// clears all values for all tracks in the current strand
export const clearAllTracks = () =>
{
  let sid = get(idStrand);
  get(aStrands)[sid].tactives = 1;
  get(aStrands)[sid].tracks = makeNewTracks();
}
