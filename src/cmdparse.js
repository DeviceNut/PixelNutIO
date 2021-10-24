import { get } from 'svelte/store';

import {
  nTracks,
  nLayers,
  pStrand,
  dStrands,
  idStrand,
  aEffectsDraw,
  aEffectsFilter
} from './globals.js';

import {
  DRAW_LAYER           ,
  DEF_PCENT_BRIGHT     ,
  DEF_PCENT_COUNT      ,
  overBit_DegreeHue    ,
  overBit_PcentWhite   ,
  overBit_PcentCount   ,
  cmdStr_PcentXoffset  ,
  cmdStr_PcentXlength  ,
  cmdStr_SetEffect     ,
  cmdStr_PcentBright   ,
  cmdStr_MsecsDelay    ,
  cmdStr_DegreeHue     ,
  cmdStr_PcentWhite    ,
  cmdStr_PcentCount    ,
  cmdStr_OrideBits     ,
  cmdStr_Backwards     ,
  cmdStr_CombinePixs   ,
  cmdStr_TrigAtStart   ,
  cmdStr_TrigFromMain  ,
  cmdStr_TrigByEffect  ,
  cmdStr_TrigRepeating ,
  cmdStr_TrigOffset    ,
  cmdStr_TrigRange     ,
  cmdStr_TrigForce     ,
  cmdStr_LayerMute     ,
  cmdStr_Clear         ,
  cmdStr_Go
} from './devcmds.js';

import { presetsFindEffect } from './presets.js';
import { strandClearAll } from './strands.js';
import { makeLayerCmdStr } from './cmdmake.js';

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
export const parsePattern = (pattern) =>
{
  let track = -1;
  let layer = -1;
  let trackbits = 0;

  const cmds = pattern.toUpperCase().split(/\s+/); // remove all spaces
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
      case cmdStr_SetEffect:
      {
        let firstone = ((track < 0) || (layer < 0));
        let layerbits;

        let obj = presetsFindEffect(val);
        if (obj === undefined)
        {
          console.warn(`Unknown effect: #${val}`);
          return false;
        }

        if (obj.filter)
        {
          if (firstone)
          {
            console.warn('Must have draw effect before filter effect');
            return false;
          }

          makeLayerCmdStr(track, layer);

          if (get(pStrand).tactives >= get(nLayers))
          {
            console.warn('Too many layers');
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
            console.warn('Too many tracks');
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
          layer = DRAW_LAYER;

          layerbits = get(aEffectsDraw)[obj.index].bits;
          trackbits = layerbits;
        }

        // turn off triggering-on-start because disabled if missing
        get(pStrand).tracks[track].layers[layer].trigAtStart = false;
        get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAtStart = false;

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
          console.warn(`Must define draw effect before: ${cmd}`);
          return false;
        }
        else switch (ch)
        {
          case cmdStr_LayerMute:
          {
            const mute = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].layers[layer].mute = mute;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].mute = mute;
            break;
          }
          case cmdStr_PcentXoffset:
          {
            const offset = isNaN(val) ? 0 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentXoffset = offset;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXoffset = offset;
            break;
          }
          case cmdStr_PcentXlength:
          {
            const extent = isNaN(val) ? 100 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentXlength = extent;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXlength = extent;
            break;
          }
          case cmdStr_PcentBright:
          {
            const bright = isNaN(val) ? DEF_PCENT_BRIGHT : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentBright = bright;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright = bright;
            break;
          }
          case cmdStr_MsecsDelay:
          {
            let delay = isNaN(val) ? DEF_PCENT_DELAY : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentDelay = delay;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentDelay = delay;
            break;
          }
          case cmdStr_DegreeHue:
          {
            const hue = isNaN(val) ? 0 : valueToDegree(val);
            get(pStrand).tracks[track].drawProps.degreeHue = hue;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.degreeHue = hue;
            break;
          }
          case cmdStr_PcentWhite:
          {
            const white = isNaN(val) ? 0 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentWhite = white;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentWhite = white;
            break;
          }
          case cmdStr_PcentCount:
          {
            const count = isNaN(val) ? DEF_PCENT_COUNT : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentCount = count;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentCount = count;
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
          case cmdStr_Backwards: // enabled if no value
          {
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.dirBackwards = enable;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.dirBackwards = enable;
            break;
          }
          case cmdStr_CombinePixs: // enabled if no value
          {
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.orPixelVals = enable;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals = enable;
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
              const force = valueToPositive(val);
              get(pStrand).tracks[track].layers[layer].forceRandom = false;
              get(pStrand).tracks[track].layers[layer].forceValue = force;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceRandom = false;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].forceValue = force;
            }
            break;
          }
          case cmdStr_TrigByEffect:
          {
            if (!isNaN(val)) // ignore if no value
            {
              const tlayer = valueToTrackLayer(val);

              get(pStrand).tracks[track].layers[layer].trigOnLayer = true;
              get(pStrand).tracks[track].layers[layer].trigTrackNum = tlayer.track+1;
              get(pStrand).tracks[track].layers[layer].trigLayerNum = tlayer.layer+1;

              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer = true;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigTrackNum = tlayer.track+1;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigLayerNum = tlayer.layer+1;
            }
            break;
          }
          case cmdStr_TrigFromMain:
          {
            get(pStrand).tracks[track].layers[layer].trigFromMain = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigFromMain = true;
            break;
          }
          case cmdStr_TrigAtStart:
          {
            get(pStrand).tracks[track].layers[layer].trigAtStart = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAtStart = true;
            break;
          }
          case cmdStr_TrigRepeating:
          {
            const count = isNaN(val) ? -1 : valueToPositive(val);
            if (count < 0)
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = true;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = true;
              get(pStrand).tracks[track].layers[layer].trigForever = true;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigForever = true;
            }
            else if (count > 0)
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = true;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = true;
              get(pStrand).tracks[track].layers[layer].trigForever = false;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigForever = false;
              get(pStrand).tracks[track].layers[layer].trigRepCount = count;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepCount = count;
            }
            else
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = false;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = false;
            }
            break;
          }
          case cmdStr_TrigOffset:
          {
            const offset = isNaN(val) ? 0 : valueToPositive(val);
            get(pStrand).tracks[track].layers[layer].trigRepOffset = offset;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepOffset = offset;
            break;
          }
          case cmdStr_TrigRange:
          {
            const range = isNaN(val) ? 0 : valueToPositive(val);
            get(pStrand).tracks[track].layers[layer].trigRepRange = range;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepRange = range;
            break;
          }
          case cmdStr_Go: break;

          default:
          {
            console.warn(`Unknown command: ${ch}`); break;
            return false;
          }
        }
      }
    }
  }

  // make sure to finish last layer
  if ((track >= 0) && (layer >= 0))
    makeLayerCmdStr(track, layer);

  return true;
}
