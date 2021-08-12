import { get } from 'svelte/store';

import {
  overBit_DegreeHue    ,
  overBit_PcentWhite   ,
  overBit_PcentCount   ,
  cmdStr_PcentStart    ,
  cmdStr_PcentLength   ,
  cmdStr_Effect        ,
  cmdStr_PcentBright   ,
  cmdStr_MsecsDelay    ,
  cmdStr_DegreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Direction     ,
  cmdStr_OwritePixs    ,
  cmdStr_TrigFromLayer ,
  cmdStr_TrigFromMain  ,
  cmdStr_TrigForce     ,
  cmdStr_TrigCount     ,
  cmdStr_TrigMinTime   ,
  cmdStr_TriggerRange  ,
  cmdStr_Clear         ,
  cmdStr_Go
  } from './pixcmds.js';

import {
  nTracks,
  tLayers,
  pStrand,
  dStrands,
  idStrand,
  aEffectsDraw,
  aEffectsFilter,
} from './globals.js';

import {
  presetsFindEffect,
} from './presets.js';

import {
  makeLayerCmdStr,
  makeEntireCmdStr
} from './cmdmake.js';

import { strandClearAll } from './strands.js';

///////////////////////////////////////////////////////////

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
  if (isNaN(value)) return {track:0, layer:0};

  let track = 0;

  for (let i = 0; i < get(pStrand).tactives; ++i)
  {
    if (value < get(pStrand).tracks[i].lactives)
      break;

    value -= get(pStrand).tracks[i].lactives;
    ++track;
  }

  return { track:track, layer:value };
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
  let trackbits = 0;

  const cmds = cmdstr.toUpperCase().split(/\s+/); // remove all spaces
  //console.log('parse: ', cmds); // DEBUG

  for (let cmd of cmds)
  {
    if (cmd === '') continue;

    const ch = cmd.substr(0, 1);
    const val = parseInt(cmd.substr(1));

    switch (ch)
    {
      case cmdStr_Clear:
      {
        strandClearAll();
        break;
      }
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
        let layerbits;

        let obj = presetsFindEffect(val);
        if (obj === undefined)
        {
          console.error(`Unknown effect: #${val}`);
          return false;
        }

        if (obj.filter)
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

          layerbits = get(aEffectsFilter)[obj.index].bits;
          trackbits |= layerbits;
        }
        else // drawing effect
        {
          if (get(pStrand).tactives >= get(nTracks))
          {
            console.error('Too many tracks');
            return false;
          }

          if (!firstone)
          {
            makeLayerCmdStr(track, layer);
            
            get(pStrand).tracks[track].trackBits = trackbits;
            get(dStrands)[get(idStrand)].tracks[track].trackBits = trackbits;
          }

          // there is always at least one track
          // and the default value is 1
          if (track >= 0) get(pStrand).tactives++;

          ++track;
          layer = 0; // DRAW_LAYER

          if (start > finish)
          {
            get(pStrand).tracks[track].drawProps.pcentStart = start;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentStart = start;
  
            get(pStrand).tracks[track].drawProps.pcentFinish = finish;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentFinish = finish;

            start = 0;
            finish = 100;
          }

          layerbits = get(aEffectsDraw)[obj.index].bits;
          trackbits = layerbits;

          // if don't find a 'T' then disable triggering
          get(pStrand).tracks[track].layers[0].trigAutoStart = false;
          get(pStrand).tracks[track].layers[0].trigTypeStr = 'none';
          get(dStrands)[get(idStrand)].tracks[track].layers[0].trigAutoStart = false;
          get(dStrands)[get(idStrand)].tracks[track].layers[0].trigTypeStr = 'none';
        }

        get(pStrand).tracks[track].layers[layer].pluginIndex = obj.index;
        get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginIndex = obj.index;

        get(pStrand).tracks[track].layers[layer].pluginBits = layerbits;
        get(dStrands)[get(idStrand)].tracks[track].layers[layer].pluginBits = layerbits;
        break;
      }
      default: // must have draw effect for these commands:
      {
        if ((track < 0) || (layer < 0))
        {
          console.error(`Must define draw effect before: ${cmd}`);
          return false;
        }
        else switch (ch)
        {
          case cmdStr_PcentBright:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let bright = valueToPercent(val);
              get(pStrand).tracks[track].drawProps.pcentBright = bright;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright = bright;
            }
            break;
          }
          case cmdStr_MsecsDelay:
          {
            if (!isNaN(val)) // ignore if no value
            {
              let delay = valueToPositive(val);
              get(pStrand).tracks[track].drawProps.msecsDelay = delay;
              get(dStrands)[get(idStrand)].tracks[track].drawProps.msecsDelay = delay;
            }
            break;
          }
          case cmdStr_DegreeHue:
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
              get(pStrand).tracks[track].drawProps.overHue   = (val & overBit_DegreeHue);
              get(pStrand).tracks[track].drawProps.overWhite = (val & overBit_PcentWhite);
              get(pStrand).tracks[track].drawProps.overCount = (val & overBit_PcentCount);
              get(dStrands)[get(idStrand)].tracks[track].drawProps.overHue   = (val & overBit_DegreeHue);
              get(dStrands)[get(idStrand)].tracks[track].drawProps.overWhite = (val & overBit_PcentWhite);
              get(dStrands)[get(idStrand)].tracks[track].drawProps.overCount = (val & overBit_PcentCount);
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
          case cmdStr_TrigFromMain:
          {
            let doman = (isNaN(val)) ? true : valueToBool(val);
            get(pStrand).tracks[track].layers[layer].trigFromMain = doman;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigFromMain = doman;
            break;
          }
          case cmdStr_TrigFromLayer:
          {
            let tlayer = (isNaN(val)) ? 0 : valueToTrackLayer(val);

            get(pStrand).tracks[track].layers[layer].trigDoLayer = true;
            get(pStrand).tracks[track].layers[layer].trigTrackNum = tlayer.track+1;
            get(pStrand).tracks[track].layers[layer].trigLayerNum = tlayer.layer+1;

            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoLayer = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTrackNum = tlayer.track+1;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigLayerNum = tlayer.layer+1;
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

            get(pStrand).tracks[track].layers[layer].trigAutoStart = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[0].trigAutoStart = true;
            break;
          }
          case cmdStr_Go: break; // no-op?

          default:
          {
            console.error(`Unknown command: ${ch}`); break;
            return false;
          }
        }
      }
    }
  }

  if ((track >= 0) && (layer >= 0))
    makeLayerCmdStr(track, layer);

  makeEntireCmdStr();
  return true;
}
