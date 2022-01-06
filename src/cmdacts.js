import { get } from 'svelte/store';

import {
  pStrand,
  findEffectFromPlugin,
  allowUpdates
} from './globals.js';

import {
  strandClearTrack,
  strandClearLayer,
  strandRemoveTrack,
  strandRemoveLayer,
  strandAppendTrack,
  strandAppendLayer,
  strandSwapTracks,
  strandSwapLayers
} from './strands.js';

import {
  DRAW_LAYER,
  cmdStr_LayerMute,
  cmdStr_SelectEffect,
  cmdStr_AppRemEffect,
  cmdStr_TrigAtStart,
  defDrawEffect,
  defFilterEffect
} from './devcmds.js';

import {
  makeEntireCmdStr,
  makeLayerCmdStr,
  updateAllTracks,
  updateTriggerLayers
} from './cmdmake.js';

import { sendLayerCmdForce } from './cmdsend.js';
import { resetEffectBits } from './cmdpats.js';

///////////////////////////////////////////////////////////

// assume cannot get called if number of T/L's at max
export const userAddTrackLayer = (track, layer, dofilter=false) =>
{
  const strand = get(pStrand);
  let effect;

  if (!dofilter && (layer === DRAW_LAYER))
  {
    strandAppendTrack(track);

    effect = defDrawEffect;
    // send command to append new track and redraw layer, set effect
    sendLayerCmdForce(track, layer, cmdStr_AppRemEffect, effect);
    track += 1;
  }
  else
  {
    strandAppendLayer(track, layer);

    effect = defFilterEffect;
    // send command to append new filter layer, set effect
    sendLayerCmdForce(track, layer, cmdStr_AppRemEffect, effect);
    layer += 1;
  }

  let obj = findEffectFromPlugin(effect);
  strand.tracks[track].trackBits |= obj.bits;
  strand.tracks[track].layers[layer].pluginObj = obj;

  updateTriggerLayers();
  updateAllTracks();

  if (strand.tracks[track].layers[layer].trigAtStart)
  sendLayerCmdForce(track, layer, cmdStr_TrigAtStart);
}

// assume cannot get called if only one T/L
export const userRemTrackLayer = (track, layer) =>
{
  // send command to delete current track/layer (no effect #)
  sendLayerCmdForce(track, layer, cmdStr_AppRemEffect);

  if (layer == DRAW_LAYER)
  {
    strandClearTrack(track);
    strandRemoveTrack(track);
  }
  else
  {
    const strand = get(pStrand);
    const props = strand.tracks[track].drawProps;
    const player = strand.tracks[track].layers[layer];
    const bits = player.pluginObj.bits;
    resetEffectBits(track, props, bits);

    strandClearLayer(track, layer);
    strandRemoveLayer(track, layer);
  }

  updateTriggerLayers();
  updateAllTracks();

  // supress reactive changes until UI updated
  allowUpdates.set(false);
}

// assume cannot get called if the T/L is the last
export const userSwapTrackLayer = (track, layer) =>
{
  // send command to swap track/layer (no effect #)
  sendLayerCmdForce(track, layer, cmdStr_SelectEffect);

  if (layer === DRAW_LAYER)
       strandSwapTracks(track);
  else strandSwapLayers(track, layer);

  updateTriggerLayers();
  updateAllTracks();
}

export const userSoloTrackLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const enable = !strand.tracks[track].layers[layer].solo;
  strand.tracks[track].layers[layer].solo = enable; // toggle

  // setting a track to Solo turns off its Mute but turns it on for all other
  // tracks, but turning off the Solos for all other tracks, whereas turning
  // off the Solo turns off Mutes for all other tracks.
  if (layer === DRAW_LAYER)
  {
    if (enable)
    {
      for (let i = 0; i < strand.tactives; ++i)
      {
        if (i !== track)
        {
          strand.tracks[i].layers[DRAW_LAYER].solo = false;
          strand.tracks[i].layers[DRAW_LAYER].mute = true;
          sendLayerCmdForce(i, DRAW_LAYER, cmdStr_LayerMute);
        }
        else if (strand.tracks[i].layers[DRAW_LAYER].mute === true)
        {
          strand.tracks[i].layers[DRAW_LAYER].mute = false;
          sendLayerCmdForce(i, DRAW_LAYER, cmdStr_LayerMute, 0);
        }
      }
    }
    else
    {
      for (let i = 0; i < strand.tactives; ++i)
      {
        if (i !== track)
        {
          strand.tracks[i].layers[DRAW_LAYER].mute = false;
          sendLayerCmdForce(i, DRAW_LAYER, cmdStr_LayerMute, 0);
        }
      }
    }
  }
  // setting a layer to Solo turns it off all other layers (in the same track),
  // and turns on the mute for all filter layers in the same track (but not
  // the drawing layer, which is always on).
  //
  // turning off a layer Solo turns off all Mutes for other layers in this track.
  else
  {
    if (enable)
    {
      for (let i = 1; i < strand.tracks[track].lactives; ++i) // note layer 0 is not affected
      {
        if (i !== layer)
        {
          strand.tracks[track].layers[i].solo = false;
          strand.tracks[track].layers[i].mute = true;
          sendLayerCmdForce(track, i, cmdStr_LayerMute);
        }
        else if (strand.tracks[track].layers[i].mute === true)
        {
          strand.tracks[track].layers[i].mute = false;
          sendLayerCmdForce(track, i, cmdStr_LayerMute, 0);
        }
      }
    }
    else
    {
      for (let i = 1; i < strand.tracks[track].lactives; ++i) // note layer 0 is not affected
      {
        if (i !== layer)
        {
          strand.tracks[track].layers[i].mute = false;
          sendLayerCmdForce(track, i, cmdStr_LayerMute, 0);
        }
      }
    }
  }

  makeLayerCmdStr(track, layer);
  makeEntireCmdStr();
}

export const userMuteTrackLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const enable = !strand.tracks[track].layers[layer].mute;
  strand.tracks[track].layers[layer].mute = enable; // toggle

  sendLayerCmdForce(track, layer, cmdStr_LayerMute, enable ? undefined : 0);

  // turning off mute for a track/layer that is not on Solo
  // turns off the Solo for any other track/layer
  if (!enable)
  {
    if (layer === DRAW_LAYER)
    {
      for (let i = 0; i < strand.tactives; ++i)
        if (i !== track)
          strand.tracks[i].layers[DRAW_LAYER].solo = false;
    }
    else
    {
      for (let i = 1; i < strand.tracks[track].lactives; ++i) // DRAW_LAYER not affected
        if (i !== layer)
          strand.tracks[track].layers[i].solo = false;
    }
  }

  makeLayerCmdStr(track, layer);
  makeEntireCmdStr();
}
