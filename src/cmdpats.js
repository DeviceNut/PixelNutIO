import { get } from 'svelte/store';

import {
  pStrand,
  findEffectFromIndex
} from './globals.js';

import {
  strandCopyAll,
  strandClearAll
} from './strands.js';

import {
  DRAW_LAYER,
  pluginBit_ORIDE_HUE,
  pluginBit_ORIDE_WHITE,
  pluginBit_ORIDE_COUNT,
  pluginBit_ORIDE_DELAY,
  pluginBit_ORIDE_DIR,
  pluginBit_ORIDE_EXT,
  cmdStr_ValueHue,
  cmdStr_PcentWhite,
  cmdStr_PcentCount,
  cmdStr_MsecsDelay,
  cmdStr_Backwards,
  cmdStr_SelectEffect
} from './devcmds.js';

import { deviceError } from './devtalk.js';

import {
  makeEntireCmdStr,
  updateAllTracks,
  updateTriggerLayers
} from './cmdmake.js';

import {
  sendStrandPattern,
  sendLayerCmd,
  sendLayerCmdForce
} from './cmdsend.js';

import { parsePattern } from './cmdparse.js';
import { MENUID_CUSTOM } from './menu.js';

///////////////////////////////////////////////////////////

// user just selected pattern to use
// triggers program error if parse fails
export const userSetPattern = (pattern) =>
{
  //console.log(`SetPattern: ${get(pStrand).curPatternName}`);

  strandClearAll();

  if (parsePattern(pattern)) // sets vars for current strand
  {
    strandCopyAll();
    makeEntireCmdStr();
    sendStrandPattern(); // store/exec new pattern

    // triggers update to UI - MUST HAVE THIS
    pStrand.set(get(pStrand));
  }
  else deviceError(`Failed parsing pattern: ${pattern}`);
}

export const userClearPattern = (setid=true) =>
{
  const strand = get(pStrand);

  if (setid) strand.curPatternId = MENUID_CUSTOM;

  if (strand.curPatternCmd !== '')
  {
    strand.curPatternName = '';
    strand.curPatternCmd  = '';
    strand.curPatternDesc = '';

    strand.showCustom = false;

    strandClearAll();
    makeEntireCmdStr();
    sendStrandPattern(); // store/exec cleared pattern

    // triggers update to UI - MUST HAVE THIS
    pStrand.set(get(pStrand));
  }
}

export const resetEffectBits = (track, props, bits) =>
{
  console.log(`Reset Effect: track=${track} bits=${bits.toString(16)}`);

  if (bits & pluginBit_ORIDE_HUE)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_ValueHue, props.valueHue);

  if (bits & pluginBit_ORIDE_WHITE)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentWhite, props.pcentWhite);

  if (bits & pluginBit_ORIDE_COUNT)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentCount, props.pcentCount);

  if (bits & pluginBit_ORIDE_DELAY)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_MsecsDelay, props.pcentDelay);

  if (bits & pluginBit_ORIDE_DIR)
    sendLayerCmd(track, DRAW_LAYER, cmdStr_Backwards, props.dirBackwards ? 1 : undefined);

  if (bits & pluginBit_ORIDE_EXT)
  {
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentXoffset, props.pcentXoffset);
    sendLayerCmd(track, DRAW_LAYER, cmdStr_PcentXlength, props.pcentXlength);
  }
}

// switch to new effect on this layer, specified by layer's plugindex
export const userSetEffect = (track, layer) =>
{
  const strand = get(pStrand);
  const player = strand.tracks[track].layers[layer];

  console.log(`${track}.${layer}: PluginIndex ${player.pluginObj.index} => ${player.plugindex}`);

  if (player.plugindex !== player.pluginObj.index)
  {
    const pobj = findEffectFromIndex(player.pluginObj.filter, player.plugindex);
    const before = player.pluginObj.bits;
    const after = pobj.bits;
    player.pluginObj = pobj;

    updateTriggerLayers();
    updateAllTracks();

    sendLayerCmdForce(track, layer, cmdStr_SelectEffect, `${pobj.id}`);

    const bits = before & ~after; // override bits being cleared
    const props = get(pStrand).tracks[track].drawProps;

    resetEffectBits(track, props, bits);
  }
}

export const userDoRestart = (track, layer) =>
{
  const pval = get(pStrand).tracks[track].layers[layer].pluginObj.id;
  sendLayerCmdForce(track, layer, cmdStr_SelectEffect, `${pval}`);
}
