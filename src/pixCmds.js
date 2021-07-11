import { get } from 'svelte/store';
import { aPatterns, aEffects } from './globalVars.js';

const defLayer =
{
  id              : 0,      // index into all layers: target ID for force
  num             : 0,      // relative to track, numbered from 1 (1=drawing)
  ownert          : 0,      // index into all tracks to owning track
                            // random auto triggering information:
  trigTimeMsecs   : 0,      // time of next trigger in msecs (0 if not set yet)
  trigCount       : 0,      // number of times to trigger (-1 to repeat forever)
  trigDelayMin    : 0,      // min amount of delay before next trigger in seconds
  trigDelayRange  : 0,      // range of delay values possible (min...min+range)
                            // these apply to both auto and manual triggering:
  trigForce       : 0,      // amount of force to apply (-1 for random)
  trigActive      : false,  // true if this layer has been triggered at least once
  trigExtern      : false,  // true if external triggering is enabled for this layer
  trigSource      : -1,     // what other layer can trigger this layer (-1 for none)

}

const defProps =
{
  pixStart        : 0,      // start/end of range of pixels to be drawn (0...)
  pixEnd          : 0,      // 
  pixCount        : 0,      // actual number of pixels to use in this range

  degreeHue       : 0,      // hue in degrees (0-MAX_DEGREES_HUE)
  pcentWhite      : 0,      // percent whiteness (0-MAX_PERCENTAGE)
  pcentBright     : 0,      // percent brightness (0-MAX_PERCENTAGE)
  msecsDelay      : 0,      // determines msecs delay after each redraw
  goUpwards       : true,   // drawing direction (true for increasing pixel index)
  orPixelValues   : false,  // whether pixels overwrites (false) or are OR'ed (true)
}

const defTrack =
{
  num             : 0,      // this track's number, from 1
  dlayer          : 0,      // index into all layers to drawing layer
  msRedraw        : 0,      // time of next redraw of plugin in msecs
  drawProps       : {},     // drawing properties  
}

let allLayers = [];
let allTracks = [];
let cmdStr = '';

console.log('Here in pixCmds...');

export const sendCmd = (cmdstr, cmdval) =>
{
  if (cmdval)
       console.log(`Send: ${cmdstr}${cmdval}`);
  else console.log(`Send: ${cmdstr}`);
}

export const sendPattern = (index) =>
{
  let list = get(aPatterns);
  let cmdstr = list[index].cmd;
  if (cmdstr) console.log(`Send: ${cmdstr}`);
}
