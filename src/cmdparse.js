import { get } from 'svelte/store';

import {
  nTracks,
  nLayers,
  pStrand,
  findEffectFromPlugin
} from './globals.js';

import {
  overBit_DegreeHue,
  overBit_PcentWhite,
  overBit_PcentCount,
  strandCopyLayer
} from './strands.js';

import {
  DRAW_LAYER,
  ENABLEBIT_MUTE,
  ENABLEBIT_SOLO,
  DEF_HUE_VALUE,
  DEF_PCENT_BRIGHT,
  DEF_PCENT_COUNT,
  cmdStr_PcentXoffset,
  cmdStr_PcentXlength,
  cmdStr_SetEffect,
  cmdStr_PcentBright,
  cmdStr_MsecsDelay,
  cmdStr_ValueHue,
  cmdStr_PcentWhite,
  cmdStr_PcentCount,
  cmdStr_OrideBits,
  cmdStr_CombinePixs,
  cmdStr_Backwards,
  cmdStr_NoRepeating,
  cmdStr_TrigAtStart,
  cmdStr_TrigFromMain,
  cmdStr_TrigByEffect,
  cmdStr_TrigRepeating,
  cmdStr_TrigOffset,
  cmdStr_TrigRange,
  cmdStr_TrigForce,
  cmdStr_LayerMute
} from './devcmds.js';

import {
  makeTrigSourceList,
  makeLayerCmdStr,
  makeEntireCmdStr
} from './cmdmake.js';

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

// parse the given pattern command string
// and set values for the current strand
// returns false if failed to parse
export const parsePattern = (pattern) =>
{
  let track = -1;
  let layer = -1;
  let trackbits = 0;

  const cmds = pattern.toUpperCase().split(/\s+/); // remove all spaces
  //console.log('parse: ', cmds);

  for (let cmd of cmds)
  {
    if (cmd === '') continue;

    const ch = cmd.substr(0, 1);
    const val = parseInt(cmd.substr(1));

    switch (ch)
    {
      case cmdStr_SetEffect:
      {
        let firstone = ((track < 0) || (layer < 0));

        let obj = findEffectFromPlugin(val);
        if (obj === undefined)
        {
          console.warn(`Unknown effect: #${val}`);
          return false;
        }

        if (!obj.filter)
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
          }

          ++track;
          get(pStrand).tactives++;
          layer = DRAW_LAYER;

          trackbits = obj.bits;
        }
        else if (firstone)
        {
          console.warn('Must have draw effect before filter effect');
          return false;
        }
        else // filter effect
        {
          makeLayerCmdStr(track, layer);

          if (get(pStrand).tracks[track].lactives >= get(nLayers))
          {
            console.warn('Too many layers');
            return false;
          }

          get(pStrand).tracks[track].lactives++;
          ++layer;

          trackbits |= obj.bits;
        }

        // turn off triggering-on-start because disabled if missing
        get(pStrand).tracks[track].layers[layer].trigAtStart = false;

        //console.log(`parse: track=${track} layer=${layer} index=${obj.index} plugbits=${layerbits.toString(16)}`);
        get(pStrand).tracks[track].layers[layer].plugindex = obj.index;
        get(pStrand).tracks[track].layers[layer].pluginObj = obj;
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
            // enable mute only if no value follows command
            if (isNaN(val))
            {
              get(pStrand).tracks[track].layers[layer].mute = true;
              get(pStrand).tracks[track].layers[layer].solo = false;
            }
            else
            {
              get(pStrand).tracks[track].layers[layer].mute = (val & ENABLEBIT_MUTE) ? true : false;
              get(pStrand).tracks[track].layers[layer].solo = (val & ENABLEBIT_SOLO) ? true : false;
            }
            break;
          }
          case cmdStr_PcentXoffset:
          {
            // set to default if no value follows command
            const offset = isNaN(val) ? 0 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentXoffset = offset;
            break;
          }
          case cmdStr_PcentXlength:
          {
            // set to default if no value follows command
            const extent = isNaN(val) ? 100 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentXlength = extent;
            break;
          }
          case cmdStr_PcentBright:
          {
            // set to default if no value follows command
            const bright = isNaN(val) ? DEF_PCENT_BRIGHT : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentBright = bright;
            break;
          }
          case cmdStr_MsecsDelay:
          {
            // set to default if no value follows command
            let delay = isNaN(val) ? DEF_PCENT_DELAY : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentDelay = delay;
            break;
          }
          case cmdStr_ValueHue:
          {
            // set to default if no value follows command
            const hue = isNaN(val) ? DEF_HUE_VALUE : valueToDegree(val);
            get(pStrand).tracks[track].drawProps.valueHue = hue;
            break;
          }
          case cmdStr_PcentWhite:
          {
            // set to default if no value follows command
            const white = isNaN(val) ? 0 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentWhite = white;
            break;
          }
          case cmdStr_PcentCount:
          {
            // set to default if no value follows command
            const count = isNaN(val) ? DEF_PCENT_COUNT : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentCount = count;
            break;
          }
          case cmdStr_OrideBits:
          {
            if (!isNaN(val)) // ignore if no value
            {
              get(pStrand).tracks[track].drawProps.overHue   = (val & overBit_DegreeHue);
              get(pStrand).tracks[track].drawProps.overWhite = (val & overBit_PcentWhite);
              get(pStrand).tracks[track].drawProps.overCount = (val & overBit_PcentCount);
            }
            break;
          }
          case cmdStr_CombinePixs:
          {
            // enable if no value follows command
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.orPixelVals = enable;
            break;
          }
          case cmdStr_Backwards:
          {
            // enable if no value follows command
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.dirBackwards = enable;
            break;
          }
          case cmdStr_NoRepeating:
          {
            // enable if no value follows command
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.noRepeating = enable;
            break;
          }
          case cmdStr_TrigForce:
          {
            // enable if no value follows command, else sets to value
            if (isNaN(val))
            {
              get(pStrand).tracks[track].layers[layer].forceRandom = true;
            }
            else
            {
              const force = valueToPositive(val);
              get(pStrand).tracks[track].layers[layer].forceRandom = false;
              get(pStrand).tracks[track].layers[layer].forceValue = force;
            }
            break;
          }
          case cmdStr_TrigAtStart:
          {
            // alway enable (should never receive value)
            get(pStrand).tracks[track].layers[layer].trigAtStart = true;
            break;
          }
          case cmdStr_TrigFromMain:
          {
            // alway enable (should never receive value)
            get(pStrand).tracks[track].layers[layer].trigFromMain = true;
            break;
          }
          case cmdStr_TrigByEffect:
          {
            // disable if no value follows command, else value is layer index
            let enable = false;
            if (isNaN(val)) val = 0;
            else enable = true;

            get(pStrand).tracks[track].layers[layer].trigOnLayerShow = enable;
            get(pStrand).tracks[track].layers[layer].trigSrcLayerDex = val;
            break;
          }
          case cmdStr_TrigRepeating:
          {
            // enable if no value follows command, and trigger forever
            const count = isNaN(val) ? -1 : valueToPositive(val);
            if (count < 0)
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = true;
              get(pStrand).tracks[track].layers[layer].trigForever = true;
            }
            else if (count > 0)
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = true;
              get(pStrand).tracks[track].layers[layer].trigForever = false;
              get(pStrand).tracks[track].layers[layer].trigRepCount = count;
            }
            else // disable if value is 0
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = false;
            }
            break;
          }
          case cmdStr_TrigOffset:
          {
            // set to 0 if no value follows command
            const offset = isNaN(val) ? 0 : valueToPositive(val);
            get(pStrand).tracks[track].layers[layer].trigRepOffset = offset;
            break;
          }
          case cmdStr_TrigRange:
          {
            // set to 0 if no value follows command
            const range = isNaN(val) ? 0 : valueToPositive(val);
            get(pStrand).tracks[track].layers[layer].trigRepRange = range;
            break;
          }
          default:
          {
            console.warn(`Unexpected command: ${ch}`);
            return false;
          }
        }
      }
    }
  }

  // make sure to finish last layer
  if ((track >= 0) && (layer >= 0))
  {
    makeLayerCmdStr(track, layer);
    get(pStrand).tracks[track].trackBits = trackbits;
  }

  // make list of possible trigger sources
  makeTrigSourceList();

  const strand = get(pStrand);
  let slist = strand.trigSources;

  // set list index and source ID for any layers that have a layer trigger set
  // disable the layer trigger if it fails to match one in the list
  let remake = false;
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      if (strand.tracks[track].layers[layer].trigOnLayerShow)
      {
        const devindex = strand.tracks[track].layers[layer].trigSrcLayerDex;
        let found = false;

        for (const [i, item] of slist.entries())
        {
          if ((i > 0) && (item.devindex == devindex))
          {
            strand.tracks[track].layers[layer].trigSrcListDex = i;
            strand.tracks[track].layers[layer].trigSrcLayerID =
              strand.tracks[ item.track ].layers[ item.layer ].uniqueID;

            //console.log(`parse: devindex=${devindex} => ${item.track}:${item.layer}`)
            //console.log(`parse: ID=${strand.tracks[track].layers[layer].trigSrcLayerID}`)

            makeLayerCmdStr(track, layer);
            strandCopyLayer(track, layer);
            found = true;
            break;
          }
        }

        if (!found)
        {
          console.warn(`parse: failed to find trigger source for: ${devindex}`);

          strand.tracks[track].layers[layer].trigOnLayerShow = false;
          strand.tracks[track].layers[layer].trigSrcListDex = 0; // indicates none chosen
        }
      }
    }
  }

  if (remake) makeEntireCmdStr();

  return true;
}
