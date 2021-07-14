import { get } from 'svelte/store';

import {
  pStrand, aPatterns, 
  curPatternID, curPatternStr,
} from './globals.js';

export const MAX_FORCE      = 1000;   // maximum force value

const pluginBit_DIRECTION   = 0x08;   // changing direction changes effect
const pluginBit_TRIGGER     = 0x10;   // triggering changes the effect
const pluginBit_USEFORCE    = 0x20;   // trigger force is used in effect
const pluginBit_NEGFORCE    = 0x40;   // negative trigger force is used
const pluginBit_SENDFORCE   = 0x80;   // sends trigger force to other plugins

const overBits_DegreeHue    = 1;      // overwrite degreeHue
const overBits_PcentWhite   = 2;      // overwrite pcentWhite
const overBits_PixCount     = 4;      // overwrite pixCount

const cmdStr_GetInfo        = "?";
const cmdStr_GetSegments    = "?S";
const cmdStr_GetPatterns    = "?P";

// Device commands:                   // value is:
const cmdStr_DeviceName     = "@";    // name of device
const cmdStr_PullTrigger    = "!";    // trigger force
const cmdStr_Pause          = "[";    // none
const cmdStr_Resume         = "]";    // none

// Properties associated with pattern // value is:
const cmdStr_SetBright      = "%";    // percent of max ++
const cmdStr_SetDelay       = ":";    // msecs of delay ++
const cmdStr_SetFirst       = "^";    // first pixel to draw ++
const cmdStr_SetProps       = "=";    // hue white count ++
const cmdStr_SetXmode       = "_";    // 0=disable 1=enable override ++

// Determines what is addressed       // value is:
const cmdStr_AddrStrand     = "#";    // strand index
const cmdStr_AddrLayer      = "M";    // layer index

// Commands that form patterns        // value is:
const cmdStr_Clear          = "P ";   // none
const cmdStr_PcentStart     = "J";    // percent of pixels **
const cmdStr_PcentLength    = "K";    // percent of pixels **
const cmdStr_PcentFirst     = "L";    // percent of pixel length ++
const cmdStr_PixStart       = "X";    // pixel index **
const cmdStr_PixCount       = "Y";    // pixel index **
const cmdStr_PixFirst       = "Z";    // pixel index ++
const cmdStr_Effect         = "E";    // plugin number
const cmdStr_Bright         = "B";    // percent of max
const cmdStr_Delay          = "D";    // msecs of delay
const cmdStr_degreeHue      = "H";    // hue degree (0..359)
const cmdStr_PcentWhite     = "W";    // percent whiteness
const cmdStr_PcentCount     = "C";    // percent of draw length
const cmdStr_OrideBits      = "Q";    // property override bits
const cmdStr_Direction      = "U";    // 0=down, 1=up (default)
const cmdStr_OwritePixs     = "V";    // 0=OR, 1=overwrite pixels
const cmdStr_TrigLayer      = "A";    // layer index that will trigger this one
const cmdStr_TrigManual     = "I";    // none (sets manual triggerring)
const cmdStr_TrigForce      = "F";    // force used in triggering (no value if random)
const cmdStr_TrigCount      = "N";    // trigger count (none or 0 means forever)
const cmdStr_TrigMinTime    = "O";    // min time before next auto trigger (secs)
const cmdStr_TriggerRange   = "T";    // auto trigger range time (secs) (no value if not auto)
const cmdStr_Go             = "G";    // causes all effects to be displayed

const DRAW_LAYER            = 0;      // drawing layer is always first layer of the track
const MAX_BYTE_VALUE        = 255;    // max byte value, used for certain commands

// ++ these affect all tracks in the strand
// ** these take effect only when plugin is created
///////////////////////////////////////////////////////////////////////

function makeOrideBits(track)
{
  let bits = 0;
  if (get(pStrand).tracks[track].drawProps.overHue)
    bits |= overBits_DegreeHue;

  if (get(pStrand).tracks[track].drawProps.overWhite)
    bits |= overBits_PcentWhite;

  if (get(pStrand).tracks[track].drawProps.overCount)
    bits |= overBits_PixCount;

  return bits;
}

// create partial command string for track/layer
// then combine all those into one single string
function makeCmdStr(track, layer)
{
  let player = get(pStrand).tracks[track].layers[layer];
  let pdraw = get(pStrand).tracks[track].drawProps;
  let cmdstr = '';

  if (layer == 0) // drawing layer
  {
    let start = pdraw.pcentStart;
    let finish = pdraw.pcentFinish;

    if (start != 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentStart}${start} `);

    if (finish != 100)
    {
      let length = finish - start;
      cmdstr = cmdstr.concat(`${cmdStr_PcentLength}${length} `);
    }
  }

  cmdstr = cmdstr.concat(`${cmdStr_Effect}${player.pluginID} `);

  if (layer == 0) // drawing layer
  {
    if (pdraw.pcentBright != 100)
      cmdstr = cmdstr.concat(`${cmdStr_Bright}${pdraw.pcentBright} `);

    if (pdraw.msecsDelay != 0)
      cmdstr = cmdstr.concat(`${cmdStr_Delay}${pdraw.msecsDelay} `);

    if (pdraw.degreeHue != 0)
      cmdstr = cmdstr.concat(`${cmdStr_degreeHue}${pdraw.degreeHue} `);

    if (pdraw.pcentWhite != 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentWhite}${pdraw.pcentWhite} `);

    if (pdraw.pcentCount != 0)
      cmdstr = cmdstr.concat(`${cmdStr_PcentCount}${pdraw.pcentCount} `);

    let bits = makeOrideBits(track);
    if (bits != 0)
      cmdstr = cmdstr.concat(`${cmdStr_OrideBits}${bits} `);

    if (pdraw.reverseDir != false)
      cmdstr = cmdstr.concat(`${cmdStr_Direction}0 `);

    if (pdraw.orPixelValues != false)
      cmdstr = cmdstr.concat(`${cmdStr_OwritePixs}1 `);
  }

  if (player.trigDoManual)
    cmdstr = cmdstr.concat(`${cmdStr_TrigManual} `);

  if (player.trigDoLayer)
  {
    let tracknum = player.trigTrackNum;
    let layernum = player.trigLayerNum;
    let tlayer = calcLayerID(tracknum-1, layernum-1);
    cmdstr = cmdstr.concat(`${cmdStr_TrigLayer}${tlayer} `);
  }

  if (!player.forceRandom)
    cmdstr = cmdstr.concat(`${cmdStr_TrigForce}${player.forceValue} `);

  if (player.trigTypeStr == 'once')
    cmdstr = cmdstr.concat(`${cmdStr_TriggerRange} `);

  else if (player.trigTypeStr == 'auto')
  {
    if (player.trigDoRepeat)
      cmdstr = cmdstr.concat(`${cmdStr_TrigCount} `);

    else if (player.trigRepCount != 1)
      cmdstr = cmdstr.concat(`${cmdStr_TrigCount}${player.trigRepCount} `);

    if (player.trigDelayMin != 1)
      cmdstr = cmdstr.concat(`${cmdStr_TrigMinTime}${player.trigDelayMin} `);

    if (player.trigDelayRange != 0)
         cmdstr = cmdstr.concat(`${cmdStr_TriggerRange}${player.trigDelayRange} `);
    else cmdstr = cmdstr.concat(`${cmdStr_TriggerRange}$ `);
  }
  
  console.log(`cmdstr=${cmdstr}`);
  player.cmdstr = cmdstr;

  makeCmdStrAll();
}

function makeCmdStrAll()
{
  // combine all layers into single string
  let cmdstr = '';

  let strand = get(pStrand);
  for (let i = 0; i < strand.tactives; ++i)
  {
    let track = strand.tracks[i];
    for (let j = 0; j < track.lactives; ++j)
    {
      let layer = track.layers[j];
      cmdstr = cmdstr.concat(`${layer.cmdstr}`);
    }
  }

  cmdstr = cmdstr.concat(`${cmdStr_Go}`);
  curPatternStr.set(cmdstr);

  //console.log(get(curPatternStr));
}

// parse the givenpattern command string
// and set values for selected strands
export const parsePattern = (cmdstr) =>
{
}


function cmdError(track, layer)
{
  console.error(`Bad track:layer = ${track}:${layer}`);
}

// calculate what pixelnut engine layerid is
function calcLayerID(track, layer)
{
  let layerid = 0;

  if (track >= get(pStrand).tactives)
  {
    console.log(`No track=${track+1}`);
    track = get(pStrand).tactives-1;
  }

  for (let i = 0; i < track; ++i)
    layerid += get(pStrand).tracks[i].lactives;

  if (layer >= get(pStrand).tracks[track].lactives)
  {
    console.log(`No layer=${layer+1}`);
    layer = get(pStrand).tracks[track].lactives-1;
  }

  return layerid + layer;
}

function copyStrandTop(track, layer)
{
  // copy all top level values from current strand
  // to all the other currently selected strands
}

function copyStrandLayer(track, layer)
{
  // copy values in entire layer from current strand
  // to all the other currently selected strands

  if (layer == 0) // also copy drawprops
  {

  }
}

// send command string to all selected strands
function doSend(cmdstr)
{
  // TODO: all strands
  console.log(cmdstr);
}

function sendCmd(cmdstr, cmdval)
{
  if (cmdval != undefined)
       doSend(cmdstr.concat(cmdval, ' '));
  else doSend(cmdstr);
}

function sendLayerCmd(id, cmdstr, cmdval)
{
  if (cmdval != undefined)
    cmdstr = cmdstr.concat(cmdval);

  if (id >= 0)
  {
    let str = `${cmdStr_AddrLayer}${id} `;
    str = str.concat(`${cmdstr} `);
    str = str.concat(`${cmdStr_AddrLayer}`);
    doSend(str);
  }
  else doSend(cmdstr);
}

function sendLayerCmds(id, cmdstr1, cmdval1, cmdstr2, cmdval2)
{
  cmdstr1 = cmdstr1.concat(cmdval1);
  cmdstr2 = cmdstr2.concat(cmdval2);

  let str = `${cmdStr_AddrLayer}${id} `;
  str = str.concat(`${cmdstr1} `);
  str = str.concat(`${cmdstr2} `);
  str = str.concat(`${cmdStr_AddrLayer}`);
  doSend(str);
}

function checkCmdStr(track, layer)
{
  let dosend = (get(curPatternStr) == '');

  makeCmdStr(track, layer);

  if (dosend) doSend(get(curPatternStr));
}

// Commands on the Header:

export const cmdSendPause = (enable) =>
{
  if (enable)
       doSend(cmdStr_Pause);
  else doSend(cmdStr_Resume);
}

// Commands from PanelMain:

// user just selected prebuilt pattern
export const cmdNewPattern = () =>
{
  let list = get(aPatterns);
  let cmdstr = list[get(curPatternID)].cmd;
  if (cmdstr)
  {
    // must clear first, then set new pattern
    doSend(cmdStr_Clear.concat(cmdstr));

    curPatternStr.set(cmdstr);
    parsePattern(cmdstr);
  }
}

export const cmdSetBright = (track) =>
{
  if (track == undefined)
  {
    let value = get(pStrand).pcentBright;
    sendCmd(cmdStr_SetBright, value);
    copyStrandTop();
  }
  else
  {
    let layerid = calcLayerID(track, DRAW_LAYER);
    let value = get(pStrand).tracks[track].drawProps.pcentBright;
    sendLayerCmd(layerid, cmdStr_SetBright, value);
    copyStrandLayer(track, DRAW_LAYER);
    checkCmdStr(track, DRAW_LAYER);
  }
}

export const cmdSetDelay = (track) =>
{
  if (track == undefined)
  {
    let value = get(pStrand).msecsDelay;
    sendCmd(cmdStr_SetDelay, value);
    copyStrandTop();
  }
  else
  {
    let layerid = calcLayerID(track, DRAW_LAYER);
    let value = get(pStrand).tracks[track].drawProps.msecsDelay;
    sendLayerCmd(layerid, cmdStr_SetDelay, value);
    copyStrandLayer(track, DRAW_LAYER);
    checkCmdStr(track, DRAW_LAYER);
  }
}

export const cmdSetRotate = () =>
{
  let value = get(pStrand).firstPixel;
  sendCmd(cmdStr_SetFirst, value);
  copyStrandTop();
}

export const cmdSetOverMode = (enable) =>
{
  sendCmd(cmdStr_SetXmode, enable ? 1 : 0);
}

export const cmdSetProps = (track) =>
{
  if (track == undefined)
  {
    let hue = get(pStrand).degreeHue;
    let white = get(pStrand).pcentWhite;
    let count = get(pStrand).pcentCount;
    let valstr = `${hue} ${white} ${count}`
    sendCmd(cmdStr_SetProps, valstr);
    copyStrandTop();
  }
  else
  {
    let layerid = calcLayerID(track, DRAW_LAYER);

    let hue = get(pStrand).tracks[track].drawProps.degreeHue;
    let white = get(pStrand).tracks[track].drawProps.pcentWhite;
    let count = get(pStrand).tracks[track].drawProps.pcentCount;
    let valstr = `${hue} ${white} ${count}`

    sendLayerCmd(layerid, cmdStr_SetProps, valstr);
    copyStrandLayer(track, DRAW_LAYER);
    checkCmdStr(track, DRAW_LAYER);
  }
}

export const cmdTrigger = () =>
{
  sendCmd(cmdStr_PullTrigger, get(pStrand).forceValue);
}

// Commands from ControlsDrawing:

export const cmdSetDrawEffect = (track) =>
{
  // must recreate entire command string when an effect is changed
  curPatternStr.set(''); // causes refresh
  checkCmdStr(track, DRAW_LAYER);
}

export const cmdSetOverrides = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let bits = makeOrideBits(track);

  sendLayerCmd(layerid, cmdStr_OrideBits, bits);
  copyStrandLayer(track, DRAW_LAYER);
  checkCmdStr(track, DRAW_LAYER);
}

export const cmdSetStart = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let start = get(pStrand).tracks[track].drawProps.pcentStart;
  let finish = get(pStrand).tracks[track].drawProps.pcentFinish;

  let length = finish - start;
  if (length >= 0)
  {
    sendLayerCmds(layerid, cmdStr_PcentStart, start, cmdStr_PcentLength, length);
    copyStrandLayer(track, DRAW_LAYER);
    checkCmdStr(track, DRAW_LAYER);
    return false;
  }
  else
  {
    get(pStrand).tracks[track].drawProps.pcentFinish = start;
    return true; // cause reactive change and call to SetFinish()
  }
}

export const cmdSetFinish = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let start = get(pStrand).tracks[track].drawProps.pcentStart;
  let finish = get(pStrand).tracks[track].drawProps.pcentFinish;

  let length = finish - start;
  if (length >= 0)
  {
    sendLayerCmds(layerid, cmdStr_PcentStart, start, cmdStr_PcentLength, length);
    copyStrandLayer(track, DRAW_LAYER);
    checkCmdStr(track, DRAW_LAYER);
    return false;
  }
  else
  {
    get(pStrand).tracks[track].drawProps.pcentStart = finish;
    return true; // cause reactive change and call to SetStart()
  } 
}

export const cmdSetOwrite = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let value = get(pStrand).tracks[track].drawProps.orPixelValues;
  sendLayerCmd(layerid, cmdStr_OwritePixs, (value ? 1 : 0));
  copyStrandLayer(track, DRAW_LAYER);
  checkCmdStr(track, DRAW_LAYER);
}

export const cmdSetDirect = (track) =>
{
  let layerid = calcLayerID(track, DRAW_LAYER);
  let value = get(pStrand).tracks[track].drawProps.reverseDir;
  sendLayerCmd(layerid, cmdStr_Direction, (value ? 0 : 1)); // 1 is default
  copyStrandLayer(track, DRAW_LAYER);
  checkCmdStr(track, DRAW_LAYER);
}

// Commands from ControlsFilter:

export const cmdSetFilterEffect = (track, layer) =>
{
  // must recreate entire command string when an effect is changed
  curPatternStr.set(''); // causes refresh
  checkCmdStr(track, layer);
}

export const cmdSetTrigManual = (track, layer) =>
{
  // TODO: if not new firmware then must send
  //       entire command string if turning off

  let layerid = calcLayerID(track, layer);
  let domanual = get(pStrand).tracks[track].layers[layer].trigDoManual;
  // don't need to send value if enabling (1 is default)
  sendLayerCmd(layerid, cmdStr_TrigManual, (domanual ? undefined : 0));
  checkCmdStr(track, layer);
}

export const cmdSetTrigLayer = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let dolayer = get(pStrand).tracks[track].layers[layer].trigDoLayer;
  let tracknum = get(pStrand).tracks[track].layers[layer].trigTrackNum;
  let layernum = get(pStrand).tracks[track].layers[layer].trigLayerNum;

  let tlayer = MAX_BYTE_VALUE; // indicates disabled state
  if (dolayer) tlayer = calcLayerID(tracknum-1, layernum-1);
  
  sendLayerCmd(layerid, cmdStr_TrigLayer, tlayer);
  checkCmdStr(track, layer);
  return true;
}

// must recreate entire command string if no-triggering is chosen
export const cmdSetTrigType = (track, layer) =>
{
  let tstr = get(pStrand).tracks[track].layers[layer].trigTypeStr;
  if (tstr == 'none')
  {
    curPatternStr.set(''); // causes refresh
    checkCmdStr(track, layer);
  }
  else if (tstr == 'once')
  {
    let layerid = calcLayerID(track, layer);
    sendLayerCmd(layerid, cmdStr_TriggerRange); // no value is set for once
    checkCmdStr(track, layer);
  }
  else if (tstr == 'auto') cmdSetTrigDrange(track, layer);
}

export const cmdSetTrigRandom = (track, layer) =>
{
  let enabled = get(pStrand).tracks[track].layers[layer].trigDoRepeat;
  if (enabled)
  {
    let layerid = calcLayerID(track, layer);
    sendLayerCmd(layerid, cmdStr_TrigCount); // no value is set for random
    checkCmdStr(track, layer);
  }
  else cmdSetTrigCount(track, layer);
}

export const cmdSetTrigCount = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let count = get(pStrand).tracks[track].layers[layer].trigRepCount;
  sendLayerCmd(layerid, cmdStr_TrigCount, count);
  checkCmdStr(track, layer);
}

export const cmdSetTrigDmin = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let dmin = get(pStrand).tracks[track].layers[layer].trigDelayMin;
  sendLayerCmd(layerid, cmdStr_TrigMinTime, dmin);
  checkCmdStr(track, layer);
}

export const cmdSetTrigDrange = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);
  let range = get(pStrand).tracks[track].layers[layer].trigDelayRange;
  sendLayerCmd(layerid, cmdStr_TriggerRange, range);
  checkCmdStr(track, layer);
}

export const cmdSetForceValue = (track, layer) =>
{
  let layerid = calcLayerID(track, layer);

  if (!get(pStrand).tracks[track].layers[layer].forceRandom)
  {
    let value = get(pStrand).tracks[track].layers[layer].forceValue;
    sendLayerCmd(layerid, cmdStr_TrigForce, value);
  }
  else sendLayerCmd(layerid, cmdStr_TrigForce);

  checkCmdStr(track, layer);
}
