import { get } from 'svelte/store';

import {
  nStrands, aStrands, idStrand, pStrand,
  nPixels, nTracks, tLayers,
} from './globals.js';

import { MAX_FORCE } from "./commands.js"

const oneLayer =
{
  // not used for layer 1
  solo            : false,  // true if currently solo
  mute            : false,  // true if currently mute

  pluginID        : 0,      // effect plugin ID
  pluginBits      : 0x00,   // bits describing plugin (pluginBit_ values)

  externTrigs     : false,  // true if external triggering is enabled for this layer
  forceRandom     : false,  // true if a random force is applied when triggering
  forceValue      : MAX_FORCE/2, // percent force to apply (ignored if random)

                            // for auto triggering:
  trigCount       : 0,      // number of times to trigger (-1 to repeat forever)
  trigDelayMin    : 0,      // min amount of delay before next trigger in seconds
  trigDelayRange  : 0,      // range of delay values possible (min...min+range)
                            // these apply to both auto and manual triggering:

  trigLayer       : 0,      // what other layer can trigger this layer

  cmdstr          : ''      // command string for the current settings
}

const drawProps =
{
  pixStart        : 0,      // start/end of range of pixels to be drawn (0...)
  pixEnd          : 0,

  pcentBright     : 100,    // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 0,      // determines msecs delay after each redraw

  overHue         : false,  // true to allow global override
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)

  overWhite       : false,  // true to allow global override
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)

  overCount       : false,  // true to allow global override
  pcentCount      : 100,    // percent of pixels affected in range
                          
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
  pcentCount      : 100,    // percent of pixels affected in range

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

// given a list of tracks/layers,
// generate & return a pattern cmd
export const makePattern = () =>
{
  let cmdstr = '';

  for (const track of tlist)
  {
    cmdstr = cmdstr.concat(`E${track.layers[0].pluginID} `);

    if (track.drawProps.pcentBright != 100)
      cmdstr = cmdstr.concat(`B${track.drawProps.pcentBright} `);

    if (track.drawProps.msecsDelay != 0)
      cmdstr = cmdstr.concat(`D${track.drawProps.msecsDelay} `);

    if (track.drawProps.degreeHue != 0)
      cmdstr = cmdstr.concat(`H${track.drawProps.degreeHue} `);

    if (track.drawProps.pcentWhite != 0)
      cmdstr = cmdstr.concat(`W${track.drawProps.pcentWhite} `);

    if (track.drawProps.goUpwards != true)
      cmdstr = cmdstr.concat('U0 ');

    if (track.drawProps.orPixelValues != false)
      cmdstr = cmdstr.concat('V1 ');

    for (const layer of track.layers)
    {

    }
  }

  return cmdstr;
}

// create partial command string for track/layer
export const makeCmdStr = (track, layer) =>
{

}

// parse the givenpattern command string
// and set values for selected strands
export const parsePattern = (cmdstr) =>
{
}
