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
  ENABLEBIT_MUTE,
  ENABLEBIT_SOLO,
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

// assume cannot get called if number of track/layer's at max
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

// assume cannot get called if only one track/layer
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
  // NOTE: assuming custom panels displayed here
  //       because no other way to invoke this
  //console.log('Supress updates...');
  allowUpdates.set(false);
}

// assume cannot get called if the track/layer is the last
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

// setting a track to Solo turns off its Mute but turns it on for all other
// tracks, and also turns off the Solos for all other tracks, whereas turning
// off the Solo turns off the Mutes for all other tracks.
//
// setting a filter layer to Solo turns it off all other filter layers
// in the same track, and turns on the mute for all filter layers in the
// same track (but not the drawing layer, which is always on).
//
// turning off a filter layer Solo turns off all Mutes for other filter
// layers in this track.
export const userSoloTrackLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const player = strand.tracks[track].layers[layer];
  player.solo = !player.solo;
  player.mute = false;

  let bits = (player.solo ? ENABLEBIT_SOLO:0);
  sendLayerCmdForce(track, layer, cmdStr_LayerMute, bits);

  if (layer === DRAW_LAYER)
  {
    if (player.solo)
    {
      for (let i = 0; i < strand.tactives; ++i)
      {
        if (i !== track)
        {
          strand.tracks[i].layers[DRAW_LAYER].mute = true;
          strand.tracks[i].layers[DRAW_LAYER].solo = false;
          sendLayerCmdForce(i, DRAW_LAYER, cmdStr_LayerMute, ENABLEBIT_MUTE);
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
  else
  {
    if (player.solo)
    {
      // DRAW_LAYER not affected
      for (let i = 1; i < strand.tracks[track].lactives; ++i)
      {
        if (i !== layer)
        {
          strand.tracks[track].layers[i].mute = true;
          strand.tracks[track].layers[i].solo = false;
          sendLayerCmdForce(track, i, cmdStr_LayerMute, ENABLEBIT_MUTE);
        }
      }
    }
    else
    {
      // DRAW_LAYER not affected
      for (let i = 1; i < strand.tracks[track].lactives; ++i)
      {
        if (i !== layer)
        {
          if (strand.tracks[track].layers[i].mute)
          {
            strand.tracks[track].layers[i].mute = false;
            sendLayerCmdForce(track, i, cmdStr_LayerMute, 0);
          }
        }
      }
    }
  }

  makeLayerCmdStr(track, layer);
  makeEntireCmdStr();
}

// turning off mute for a track/layer that is not on Solo
// turns off the Solo for any other track/layer, but leaves
// the mute alone
export const userMuteTrackLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const player = strand.tracks[track].layers[layer];
  player.mute = !player.mute;

  let bits = (player.mute ? ENABLEBIT_MUTE:0) | (player.solo ? ENABLEBIT_SOLO:0);
  sendLayerCmdForce(track, layer, cmdStr_LayerMute, bits);

  if (!player.mute && !player.solo)
  {
    if (layer === DRAW_LAYER)
    {
      for (let i = 0; i < strand.tactives; ++i)
      {
        if (i !== track)
        {
          if (strand.tracks[i].layers[DRAW_LAYER].solo)
          {
            strand.tracks[i].layers[DRAW_LAYER].solo = false;

            let bits = (strand.tracks[i].layers[DRAW_LAYER].mute ? ENABLEBIT_MUTE:0);
            sendLayerCmdForce(i, DRAW_LAYER, cmdStr_LayerMute, bits);
          }
        }
      }
    }
    else
    {
      // DRAW_LAYER not affected
      for (let i = 1; i < strand.tracks[track].lactives; ++i)
      {
        if (i !== layer)
        {
          if (strand.tracks[track].layers[i].solo)
          {
            strand.tracks[track].layers[i].solo = false;

            let bits = (strand.tracks[track].layers[i].mute ? ENABLEBIT_MUTE:0);
            sendLayerCmdForce(track, i, cmdStr_LayerMute, bits);
          }
        }
      }
    }
  }

  makeLayerCmdStr(track, layer);
  makeEntireCmdStr();
}
