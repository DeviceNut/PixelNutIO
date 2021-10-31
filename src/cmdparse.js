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
  DEF_HUE_DEGREE       ,
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
  cmdStr_Go
} from './devcmds.js';

import { presetsFindEffect } from './presets.js';

import {
  makeTrigSourceList,
  makeLayerCmdStr
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
  //console.log('parse: ', cmds); // DEBUG

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
            // enable if no value follows command
            const mute = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].layers[layer].mute = mute;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].mute = mute;
            break;
          }
          case cmdStr_PcentXoffset:
          {
            // set to default if no value follows command
            const offset = isNaN(val) ? 0 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentXoffset = offset;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXoffset = offset;
            break;
          }
          case cmdStr_PcentXlength:
          {
            // set to default if no value follows command
            const extent = isNaN(val) ? 100 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentXlength = extent;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentXlength = extent;
            break;
          }
          case cmdStr_PcentBright:
          {
            // set to default if no value follows command
            const bright = isNaN(val) ? DEF_PCENT_BRIGHT : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentBright = bright;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentBright = bright;
            break;
          }
          case cmdStr_MsecsDelay:
          {
            // set to default if no value follows command
            let delay = isNaN(val) ? DEF_PCENT_DELAY : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentDelay = delay;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentDelay = delay;
            break;
          }
          case cmdStr_DegreeHue:
          {
            // set to default if no value follows command
            const hue = isNaN(val) ? DEF_HUE_DEGREE : valueToDegree(val);
            get(pStrand).tracks[track].drawProps.degreeHue = hue;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.degreeHue = hue;
            break;
          }
          case cmdStr_PcentWhite:
          {
            // set to default if no value follows command
            const white = isNaN(val) ? 0 : valueToPercent(val);
            get(pStrand).tracks[track].drawProps.pcentWhite = white;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.pcentWhite = white;
            break;
          }
          case cmdStr_PcentCount:
          {
            // set to default if no value follows command
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
          case cmdStr_Backwards:
          {
            // enable if no value follows command
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.dirBackwards = enable;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.dirBackwards = enable;
            break;
          }
          case cmdStr_CombinePixs:
          {
            // enable if no value follows command
            const enable = isNaN(val) ? true : valueToBool(val);
            get(pStrand).tracks[track].drawProps.orPixelVals = enable;
            get(dStrands)[get(idStrand)].tracks[track].drawProps.orPixelVals = enable;
            break;
          }
          case cmdStr_TrigForce:
          {
            // enable if no value follows command, else sets to value
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
          case cmdStr_TrigAtStart:
          {
            // alway enable (should never receive value)
            get(pStrand).tracks[track].layers[layer].trigAtStart = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigAtStart = true;
            break;
          }
          case cmdStr_TrigFromMain:
          {
            // alway enable (should never receive value)
            get(pStrand).tracks[track].layers[layer].trigFromMain = true;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigFromMain = true;
            break;
          }
          case cmdStr_TrigByEffect:
          {
            // disable if no value follows command, else value is layer index
            let enable = false;
            if (isNaN(val)) val = 0;
            else enable = true;

            get(pStrand).tracks[track].layers[layer].trigOnLayer = enable;
            get(pStrand).tracks[track].layers[layer].trigDevIndex = val;

            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer = false;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDevIndex = val;
            break;
          }
          case cmdStr_TrigRepeating:
          {
            // enable if no value follows command, and trigger forever
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
            else // disable if value is 0
            {
              get(pStrand).tracks[track].layers[layer].trigDoRepeat = false;
              get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigDoRepeat = false;
            }
            break;
          }
          case cmdStr_TrigOffset:
          {
            // set to 0 if no value follows command
            const offset = isNaN(val) ? 0 : valueToPositive(val);
            get(pStrand).tracks[track].layers[layer].trigRepOffset = offset;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepOffset = offset;
            break;
          }
          case cmdStr_TrigRange:
          {
            // set to 0 if no value follows command
            const range = isNaN(val) ? 0 : valueToPositive(val);
            get(pStrand).tracks[track].layers[layer].trigRepRange = range;
            get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigRepRange = range;
            break;
          }
          case cmdStr_Go: break; // ignored

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
    makeLayerCmdStr(track, layer);

  // must create trigger source list,
  makeTrigSourceList();

  const strand = get(pStrand);
  let slist = strand.trigSources;

  // set list index and source ID for any layers that have a layer trigger set
  // disable the layer trigger if it fails to match one in the list
  for (let track = 0; track < strand.tactives; ++track)
  {
    for (let layer = 0; layer < strand.tracks[track].lactives; ++layer)
    {
      if (strand.tracks[track].layers[layer].trigOnLayer)
      {
        const devindex = strand.tracks[track].layers[layer].trigDevIndex;
        let found = false;

        for (const [i, item] of slist.entries())
        {
          if ((i > 0) && (item.devindex == devindex))
          {
            strand.tracks[track].layers[layer].trigSrcListDex = i;
            strand.tracks[track].layers[layer].trigSourceID = 
              strand.tracks[ item.track ].layers[ item.layer ].uniqueID;

            //console.log(`parse: devindex=${devindex} => ${item.track}:${item.layer}`)
            //console.log(`parse: ID=${strand.tracks[track].layers[layer].trigSourceID}`)
            found = true;
            break;
          }
        }

        if (!found)
        {
          strand.tracks[track].layers[layer].trigOnLayer = false;
          get(dStrands)[get(idStrand)].tracks[track].layers[layer].trigOnLayer = false;
          console.warn(`Failed to find trigger source for: ${devindex}`);
        }
      }
    }
  }

  return true;
}
