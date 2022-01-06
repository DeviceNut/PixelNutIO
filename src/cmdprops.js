import { get } from 'svelte/store';

import { pStrand } from './globals.js';

import {
  DRAW_LAYER,
  cmdStr_ValueHue,
  cmdStr_PcentWhite,
  cmdStr_PcentCount,
  cmdStr_OrideBits
} from './devcmds.js';

import {
  makeOrideBits,
  updateLayerVals
} from './cmdmake.js';

import {
  sendLayerCmd
} from './cmdsend.js';

///////////////////////////////////////////////////////////

export const userSetHue = (track) =>
{
  const layer = DRAW_LAYER;
  const hue = get(pStrand).tracks[track].drawProps.valueHue;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_ValueHue, `${hue}`);
}

export const userSetWhite = (track) =>
{
  const layer = DRAW_LAYER;
  const white = get(pStrand).tracks[track].drawProps.pcentWhite;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_PcentWhite, `${white}`);
}

export const userSetCount = (track) =>
{
  const layer = DRAW_LAYER;
  const count = get(pStrand).tracks[track].drawProps.pcentCount;

  updateLayerVals(track, layer);
  sendLayerCmd(track, layer, cmdStr_PcentCount, `${count}`);
}

export const userSetOverrides = (track) =>
{
  const layer = DRAW_LAYER;
  const strand = get(pStrand);
  const bits = makeOrideBits(strand, track);
  const props = strand.tracks[track].drawProps;

  updateLayerVals(track, layer);

  sendLayerCmd(track, layer, cmdStr_OrideBits, bits ? bits : undefined);

  if (!props.overHue)
       sendLayerCmd(track, layer, cmdStr_ValueHue, `${props.valueHue}`);
  else sendLayerCmd(track, layer, cmdStr_ValueHue, `${strand.valueHue}`);

  if (!props.overWhite)
       sendLayerCmd(track, layer, cmdStr_PcentWhite, `${props.pcentWhite}`);
  else sendLayerCmd(track, layer, cmdStr_PcentWhite, `${strand.pcentWhite}`);

  if (!props.overCount)
       sendLayerCmd(track, layer, cmdStr_PcentCount, `${props.pcentCount}`);
  else sendLayerCmd(track, layer, cmdStr_PcentCount, `${strand.pcentCount}`);
}
