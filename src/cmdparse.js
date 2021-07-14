import { get } from 'svelte/store';

import {
  overBits_DegreeHue   ,
  overBits_PcentWhite  ,
  overBits_PcentCount  ,
  cmdStr_PcentStart    ,
  cmdStr_PcentLength   ,
  cmdStr_Effect        ,
  cmdStr_Bright        ,
  cmdStr_Delay         ,
  cmdStr_degreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Direction     ,
  cmdStr_OwritePixs    ,
  cmdStr_TrigLayer     ,
  cmdStr_TrigManual    ,
  cmdStr_TrigForce     ,
  cmdStr_TrigCount     ,
  cmdStr_TrigMinTime   ,
  cmdStr_TriggerRange  ,
  cmdStr_Go            
  } from './pixelnut.js';

import {
  nTracks, tLayers,
  pStrand, dStrands, idStrand,
} from './globals.js';

import { pluginBit_FILTER, presetsFindEffect } from './presets.js';
import { getTrackLayerFromID, makeLayerCmdStr } from './cmdmake.js';

function valueToBool(value)
{
  if (value <= 0) return false;
  return true;
}
  
function valueToPercent(value)
{
  if (value < 0) return 0;
  if (100 < value) return 100;
  return value;
}

function valueToDegree(value)
{
  if (value < 0) return 0;
  if (359 < value) return 359;
  return value;
}

function valueToPositive(value)
{
  if (value < 0) return 0;
  return value;
}

function valueToTrackLayer(value)
{
  if (isNaN(val))
    return {track:0, layer:0};

  return getTrackLayerFromID(value);
}

// parse the given pattern command string
// and set values for the current strand
// returns false if failed to parse
export const parsePattern = (cmdstr) =>
{
  let track = -1;
  let layer = -1;
  let start = 0;
  let finish = 100;

  const cmds = cmdstr.split(/\s+/); // remove all spaces
  //console.log('parse: ', cmds);

  for (let cmd of cmds)
  {
    if (cmd == '') continue;

    const ch = cmd.substr(0, 1);
    const val = parseInt(cmd.substr(1));

    switch (ch)
    {
      case cmdStr_PcentStart:
      {
        if (!isNaN(val)) // ignore if no value
        {
          start = valueToPercent(val);
        }
        break;
      }
      case cmdStr_PcentLength:
      {
        if (!isNaN(val)) // ignore if no value
        {
          finish = valueToPercent(val);
        }
        break;
      }
      case cmdStr_Effect:
      {
        let firstone = ((track < 0) || (layer < 0));

        let obj = presetsFindEffect(val);
        if (obj == undefined)
        {
          console.error(`Unknown effect: #${val}`);
          return false;
        }

        if (obj.bits & pluginBit_FILTER)
        {
          if (firstone)
          {
            console.error('Must have draw effect before filter effect');
            return false;
          }

          makeLayerCmdStr(track, layer);

          if (get(pStrand).tactives >= get(tLayers))
          {
            console.error('Too many layers');
            return false;
          }
          get(pStrand).tracks[track].lactives++;

          ++layer;
        }
        else // drawing effect
        {
          if (!firstone) makeLayerCmdStr(track, layer);

          if (get(pStrand).tactives >= get(nTracks))
          {
            console.error('Too many tracks');
            return false;
          }
          // there is always at least one track
          else if (track >= 0)
            get(pStrand).tactives++;

          ++track;
          ++layer;

          // set trig type to default
          get(pStrand).tracks[track].layers[layer].trigTypeStr = 'none';
          get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTypeStr = 'none';

          if (start > finish)
          {
            get(pStrand).tracks[track].drawProps.pcentStart = start;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentStart = start;
  
            get(pStrand).tracks[track].drawProps.pcentFinish = finish;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentFinish = finish;
          }
        }

        get(pStrand).tracks[track].layers[layer].pluginIndex = obj.index;
        get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginIndex = obj.index;
        break;
      }
      default: // ignore if no draw effect
      {
        if ((track >= 0) && (layer >= 0)) switch (ch)
        {
          case cmdStr_Bright:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let bright = valueToPercent(val);
              get(pStrand).tracks[track].drawProps.pcentBright = bright;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright = bright;
            }
            break;
          }
          case cmdStr_Delay:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let delay = valueToPositive(val);
              get(pStrand).tracks[track].drawProps.msecsDelay = delay;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.msecsDelay = delay;
            }
            break;
          }
          case cmdStr_degreeHue:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let hue = valueToDegree(val);
              get(pStrand).tracks[track].drawProps.degreeHue = hue;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.degreeHue = hue;
            }
            break;
          }
          case cmdStr_PcentWhite:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let white = valueToPercent(val);
              get(pStrand).tracks[track].drawProps.pcentWhite = white;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentWhite = white;
            }
            break;
          }
          case cmdStr_PcentCount:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let count = valueToPercent(val);
              get(pStrand).tracks[track].drawProps.pcentCount = count;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentCount = count;
            }
            break;
          }
          case cmdStr_OrideBits:
          {
            if (!isNaN(val)) // ignore if no value
            {
              get(pStrand).tracks[track].drawProps.overHue   = (val & overBits_DegreeHue);
              get(pStrand).tracks[track].drawProps.overWhite = (val & overBits_PcentWhite);
              get(pStrand).tracks[track].drawProps.overCount = (val & overBits_PcentCount);
              get(dStrands)[get(idStrand)].tracks[track].drawProps.overHue   = (val & overBits_DegreeHue);
              get(dStrands)[get(idStrand)].tracks[track].drawProps.overWhite = (val & overBits_PcentWhite);
              get(dStrands)[get(idStrand)].tracks[track].drawProps.overCount = (val & overBits_PcentCount);
            }
            break;
          }
          case cmdStr_Direction:
          {
            if (!isNaN(val)) // ignore if no value (device toggles in this case)
            {
              let rdir = valueToBool(val);
              get(pStrand).tracks[track].drawProps.reverseDir = rdir;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.reverseDir = rdir;
            }
            break;
          }
          case cmdStr_OwritePixs:
          {
            if (!isNaN(val)) // ignore if no value (device toggles in this case)
            {
              let owrite = valueToBool(val);
              get(pStrand).tracks[track].drawProps.orPixelVals = owrite;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals = owrite;
            }
            break;
          }
          case cmdStr_TrigManual:
          {
            let doman = (isNaN(val)) ? true : valueToBool(val);
            get(pStrand).tracks[track].layers[layer].trigDoManual = doman;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoManual = doman;
            break;
          }
          case cmdStr_TrigLayer:
          {
            let tlayer = (isNaN(val)) ? 0 : valueToTrackLayer(val);

            get(pStrand).tracks[track].layers[layer].trigDoLayer = true;
            get(pStrand).tracks[track].layers[layer].trigTrackNum = tlayer.track;
            get(pStrand).tracks[track].layers[layer].trigLayerNum = tlayer.layer;

            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoLayer = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTrackNum = tlayer.track;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigLayerNum = tlayer.layer;
            break;
          }
          case cmdStr_TrigForce:
          {
            if (isNaN(val))
            {
              get(pStrand).tracks[track].layers[layer].forceRandom = true;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom = true;
            }
            else
            {
              let force = valueToPositive(val);
              get(pStrand).tracks[track].layers[layer].forceRandom = false;
              get(pStrand).tracks[track].layers[layer].forceValue = force;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom = false;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceValue = force;
            }
            break;
          }
          case cmdStr_TrigCount:
          {
            let count = (isNaN(val)) ? 0 : valueToPositive(val);
            if (count <= 0)
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = true;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = true;
            }
            else
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = false;
              get(pStrand).tracks[track].layers[layer].trigRepCount = count;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = false;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount = count;
            }
            break;
          }
          case cmdStr_TrigMinTime:
          {
            let mintime = (isNaN(val)) ? 1 : ((val < 1) ? 1 : val);
            get(pStrand).tracks[track].layers[layer].trigDelayMin = mintime;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayMin = mintime;
            break;
          }
          case cmdStr_TriggerRange:
          {
            if (isNaN(val))
            {
              get(pStrand).tracks[track].layers[layer].trigTypeStr = 'once';
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTypeStr = 'once';
            }
            else
            {
              let range = valueToPositive(val);
              get(pStrand).tracks[track].layers[layer].trigTypeStr = 'auto';
              get(pStrand).tracks[track].layers[layer].trigDelayRange = range;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTypeStr = 'auto';
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDelayRange = range;
            }
            break;
          }
          case cmdStr_Go: break; // no-op?
        }
      }
    }
  }

  if ((track >= 0) && (layer >= 0))
    makeLayerCmdStr(track, layer);

  //console.log(get(pStrand));
  return true;
}
