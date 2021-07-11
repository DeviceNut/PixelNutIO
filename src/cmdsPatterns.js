import { get } from 'svelte/store';
import {
  aPatterns, aEffectsDraw, aEffectsPre,
  curPatternID, curPatternStr,
} from './globalVars.js';

const pluginBit_DIRECTION   = 0x08;   // changing direction changes effect
const pluginBit_TRIGGER     = 0x10;   // triggering changes the effect
const pluginBit_USEFORCE    = 0x20;   // trigger force is used in effect
const pluginBit_NEGFORCE    = 0x40;   // negative trigger force is used
const pluginBit_SENDFORCE   = 0x80;   // sends trigger force to other plugins

const defLayer =
{
  id              : 0,      // index into all layers: target ID for force
  num             : 0,      // relative to track, numbered from 1 (1=drawing)
  otrack          : 0,      // index into all tracks to owning track

  pluginID        : 0,      // effect plugin ID
  pluginBits      : 0x00,   // bits describing plugin (pluginBit_ values)

                            // random auto triggering information:
  trigCount       : 0,      // number of times to trigger (-1 to repeat forever)
  trigDelayMin    : 0,      // min amount of delay before next trigger in seconds
  trigDelayRange  : 0,      // range of delay values possible (min...min+range)
                              // these apply to both auto and manual triggering:
  trigForce       : 0,      // amount of force to apply (-1 for random)
  trigExtern      : false,  // true if external triggering is enabled for this layer
  trigSource      : -1,     // what other layer can trigger this layer (-1 for none)
}

const defProps =
{
  pixStart        : 0,      // start/end of range of pixels to be drawn (0...)
  pixEnd          : 0,      // 
  pixCount        : 0,      // actual number of pixels to use in this range

  pcentBright     : 0,      // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 0,      // determines msecs delay after each redraw
  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)

  goUpwards       : true,   // drawing direction (true for increasing pixel index)
  orPixelValues   : false,  // whether pixels overwrites (false) or are OR'ed (true)
}

const defTrack =
{
  num             : 0,      // this track's number, from 1
  layers          : [],     // list of layer indexes (first one is drawing layer)
  drawProps       : defProps, // drawing properties for that drawing layer
}

let allLayers = [];
let allTracks = [];
let cmdStr = '';

console.log('Here in cmdsPatterns...');

export const sendCmd = (cmdstr, cmdval) =>
{
  if (cmdval)
       console.log(`Send: ${cmdstr}${cmdval}`);
  else console.log(`Send: ${cmdstr}`);
}

export const newPatternID = () =>
{
  let list = get(aPatterns);
  let cmdstr = list[get(curPatternID)].cmd;
  if (cmdstr)
  {
    console.log(`Send: ${cmdstr}`);
    curPatternStr.set(cmdstr);
  }
}

// given a list of tracks/layers,
// generate & return a pattern cmd
export const makePattern = (tlist) =>
{
  let cmdstr = '';

  for (const track of tlist)
  {
    cmdstr.concat(`E${track.layers[0].pluginID} `);

    if (track.drawProps.pcentBright != 100)
      cmdstr.concat(`B${track.drawProps.pcentBright} `);

    if (track.drawProps.msecsDelay != 0)
      cmdstr.concat(`D${track.drawProps.msecsDelay} `);

    if (track.drawProps.degreeHue != 0)
      cmdstr.concat(`H${track.drawProps.degreeHue} `);

    if (track.drawProps.pcentWhite != 0)
      cmdstr.concat(`W${track.drawProps.pcentWhite} `);

    if (track.drawProps.goUpwards != true)
      cmdstr.concat('U0 ');

      if (track.drawProps.orPixelValues != false)
      cmdstr.concat('V1 ');

    for (const layer of track.layers)
    {

    }
  }
}
