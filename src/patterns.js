import { get } from 'svelte/store';
import {
  nStrands, nPixels,
  nTracks, tLayers, aLayers,
  aPatterns, aEffectsDraw, aEffectsPre,
  curPatternID, curPatternStr,
} from './globals.js';

const pluginBit_DIRECTION   = 0x08;   // changing direction changes effect
const pluginBit_TRIGGER     = 0x10;   // triggering changes the effect
const pluginBit_USEFORCE    = 0x20;   // trigger force is used in effect
const pluginBit_NEGFORCE    = 0x40;   // negative trigger force is used
const pluginBit_SENDFORCE   = 0x80;   // sends trigger force to other plugins

const cmdStr_GetInfo        = "?";
const cmdStr_GetSegments    = "?S";
const cmdStr_GetPatterns    = "?P";
const cmdStr_SetBright      = "%";
const cmdStr_SetDelay       = ":";
const cmdStr_SetFirst       = "Z";
const cmdStr_SetStart       = "J";
const cmdStr_SetFinish      = "K";
const cmdStr_SetProps       = "=";
const cmdStr_SetXmode       = "_";
const cmdStr_SetName        = "@";
const cmdStr_Trigger        = "!";
const cmdStr_Pause          = "[";
const cmdStr_Resume         = "]";
const cmdStr_SegsEnable     = "#";
const cmdStr_PopPattern     = "P";

const cmdStr_Effect         = "E";
const cmdStr_Modify         = "M";

const defLayer =
{
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
  layers          : [],     // list of DefLayers for this track
  drawProps       : {},     // drawing properties for that drawing layer
}

let allTracks = [];

export const patternsInit = () =>
{
  for (let s = 0; s < get(xStrands); ++i)

  for (let i = 0; i < get(nTracks); ++i)
  {
    let track = {...defTrack};
    track.num = i+1;
    track.drawProps = {...defProps};

    track.drawProps.pixCount = get(nPixels)[strand];
    track.drawProps.pixStart = 0;
    track.drawProps.pixEnd = track.drawProps.pixCount-1;

    let layers = [];
    for (let j = 0; j < get(tLayers); ++j)
    {
      let layer = {...defLayer};
      layer.num = j+1;
      layer.otrack = i;
      layers.concat(layer);
    }

    track.layers = layers;
    allTracks.concat(track);
  }
}

function calcLayerID(track, layer)
{
  // calculate what pixelnut engine layerid is
  let layerid = 0;
  for (let i = 0; i < track-1; ++i) layerid += get(aLayers)[i];
  layerid += layer-1;
  return layerid;
}

function dosend(str)
{
  console.log(str);
}

function sendCmd(cmdstr, cmdval, track, layer)
{
  if (cmdval != undefined)
  {
    if ((track != undefined) && (layer != undefined))
    {
      // calculate what pixelnut engine layerid is
      let layerid = 0;
      for (let i = 0; i < track-1; ++i) layerid += get(aLayers)[i];
      layerid += layer-1;

      let str = '';
      str = str.concat(`${cmdStr_Modify}${layerid} `);
      str = str.concat(`${cmdstr}${cmdval} `);
      str = str.concat(`${cmdStr_Modify} `);
      dosend(str);
    }
    else dosend(`${cmdstr}${cmdval}`);
  }
  else dosend(cmdstr);
}

export const newPatternID = () =>
{
  let list = get(aPatterns);
  let cmdstr = list[get(curPatternID)].cmd;
  if (cmdstr)
  {
    dosend(cmdstr);
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

export const sendBright = (track, layer) =>
{
  sendCmd(cmdStr_SetBright, track, layer);
}

