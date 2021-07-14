import { get } from 'svelte/store';

import { pStrand } from './globals.js';
import { makeLayerCmdStr } from './cmdmake.js';
import {
  pluginBit_FILTER,
  presetsFindEffect
} from './presets.js';

import {
  overBits_DegreeHue   ,
  overBits_PcentWhite  ,
  overBits_PixCount    ,
  cmdStr_GetInfo       ,
  cmdStr_GetSegments   ,
  cmdStr_GetPatterns   ,
  cmdStr_DeviceName    ,
  cmdStr_PullTrigger   ,
  cmdStr_Pause         ,
  cmdStr_Resume        ,
  cmdStr_SetBright     ,
  cmdStr_SetDelay      ,
  cmdStr_SetFirst      ,
  cmdStr_SetProps      ,
  cmdStr_SetXmode      ,
  cmdStr_AddrStrand    ,
  cmdStr_AddrLayer     ,
  cmdStr_Clear         ,
  cmdStr_PcentStart    ,
  cmdStr_PcentLength   ,
  cmdStr_PcentFirst    ,
  cmdStr_PixStart      ,
  cmdStr_PixCount      ,
  cmdStr_PixFirst      ,
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

function valueToPercent(value)
{
  if (value < 0) return 0;
  if (100 < value) return 100;
  return value;
}

// parse the given pattern command string
// and set values for the current strand
// returns false if failed to parse
export const parsePattern = (cmdstr) =>
{
  let ineffect = false; // true once have an effect
  let isfilter = false; // true if effect is filter
  let effectcnt = 0;
  let track = 0;
  let layer = 0;

  const cmds = cmdstr.split(/\s+/); // remove all spaces
  console.log('parse: ', cmds);
  return;

  for (let cmd of cmds)
  {
    if (cmd == '') continue;

    const ch = cmd.substr(0, 1);
    const val = parseInt(cmd.substr(1));

    switch (ch)
    {
      case cmdStr_PcentStart:
        break;
      case cmdStr_PcentLength:
        break;

      case cmdStr_Effect:
        //console.log('effect=', val);

        let bits = presetsFindEffect(val);
        if (bits == undefined) return false;

        isfilter = bits & pluginBit_FILTER;
        if (isfilter)
        {
          if (!ineffect) return false;
          makeLayerCmdStr(track, layer);
          ++layer;
        }
        //else if 

        ++effectcnt;
        break;

      case cmdStr_Bright:
        let bright = valueToPercent(val);
        get(pStrand).tracks[track].drawProps.pcentBright = bright;
        break;

      case cmdStr_Delay:
        break;
      case cmdStr_degreeHue:
        break;
      case cmdStr_PcentWhite:
        break;
      case cmdStr_PcentCount:
        break;
      case cmdStr_OrideBits:
        break;
      case cmdStr_Direction:
        break;
      case cmdStr_OwritePixs:
        break;

      case cmdStr_TrigLayer:
        break;
      case cmdStr_TrigManual:
        break;
      case cmdStr_TrigForce:
        break;
      case cmdStr_TrigCount:
        break;
      case cmdStr_TrigMinTime:
        break;
      case cmdStr_TriggerRange:
        break;

      case cmdStr_Go: // no-op?
        break;
    }
  }

  if (effectcnt)
    makeLayerCmdStr(track, layer);

  return true;
}
