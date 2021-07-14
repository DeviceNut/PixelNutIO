import { get } from 'svelte/store';

import {
  nStrands, aStrands,
  idStrand, pStrand,
  nTracks, tLayers, nPixels
} from './globals.js';

import { MAX_FORCE } from "./commands.js"

const oneLayer =
{
  // solo/mute not used for drawing layer
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute
  
  pluginID        : 0,      // effect plugin ID
  pluginBits      : 0x00,   // bits describing plugin (pluginBit_ values)

  trigDoManual    : false,  // true if can trigger manually from Main Panel
  trigDoLayer     : false,  // true if can trigger from other layer:
  trigTrackNum    : 1,      //  the track number that will trigger (from 1)
  trigLayerNum    : 1,      //  the layer number that will trigger (from 1)
  trigTypeStr     : 'once', // or 'none' or if 'auto' (auto triggering), then:
  trigDoRepeat    : true,   // true to repeat forever, else:
  trigRepCount    : 1,      //  number of times to repeat trigger (at least 1)
  trigDelayMin    : 1,      //  min seconds before next trigger (at least 1)
  trigDelayRange  : 0,      //  range of delay values possible (min...min+range)

  forceRandom     : true,   // true if a random force is applied when triggering
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
                          
  pcentStart      : 0,      // percent of pixels where start
  pcentFinish     : 100,    // percent of pixels where finish
                            //  (start must be <= finish)

  reverseDir      : false,  // reverse drawing direction (false for increasing pixel index)
  orPixelValues   : false,  // whether pixels overwrites (false) or are OR'ed (true)
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

                            // global per-strand settings:
  pcentBright     : 80,     // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 50,     // determines msecs delay after each redraw
  firstPixel      : 0,      // determines pixel to start drawing from

  doOverride      : false,  // true to override local properties with:
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)
  pcentCount      : 0,      // percent of pixels affected in range

  forceValue      : MAX_FORCE/2, // force value for triggering

  tactives        : 1,      // current number of active tracks (>=1)
  tracks          : [],     // list of 'oneTrack's for this strand
}

export const patternsInit = () =>
{
  let curstrand = get(idStrand);
  let slist = [];

  for (let s = 0; s < get(nStrands); ++s)
  {
    let strand = {...oneStrand};
    strand.tactives = 1;

    if (s == curstrand)
      strand.selected = true;

    let scount = get(nPixels)[s];

    let tracks = [];
    for (let i = 0; i < get(nTracks); ++i)
    {
      let track = {...oneTrack};
      track.drawProps = {...drawProps};

      // must set these properties upon creation
      track.drawProps.pixStart = 0;
      track.drawProps.pixEnd = scount-1;
      track.drawProps.pixCount = scount;
  
      let layers = [];
      for (let j = 0; j < get(tLayers); ++j)
      {
        let layer = {...oneLayer};
        layers.push(layer);
      }
  
      track.layers = layers;
      tracks.push(track);
    }

    strand.tracks = tracks;
    slist.push(strand);
  }

  aStrands.set(slist);
  pStrand.set(slist[curstrand]);
}
