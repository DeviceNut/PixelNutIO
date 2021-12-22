import { get } from 'svelte/store';

import {
  curDevice,
  nStrands,
  idStrand,
  pStrand,
  aStrands,
  eStrands,
  aEffectsDraw,
  aEffectsFilter,
  MENUID_CUSTOM
} from './globals.js';

import {
  strandCopyAll,
  strandClearAll,
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
  cmdStr_DeviceName,
  cmdStr_Pause,
  cmdStr_Resume,
  cmdStr_SelectEffect,
  cmdStr_AppRemEffect,
  cmdStr_TrigAtStart,
  cmdStr_SetEffect,
  defDrawEffect,
  defFilterEffect
} from './devcmds.js';

import {
  makeEntireCmdStr,
  makeLayerCmdStr,
  updateAllTracks,
  updateTriggerLayers
} from './cmdmake.js';

import {
  sendCmdToDevice,
  sendStrandSwitch,
  sendStrandPattern,
  sendPatternToStrand,
  sendStrandCmd
} from './cmdsend.js';

import { userSendToLayer } from './cmduser1.js';
import { parsePattern } from './cmdparse.js';
import { deviceError } from './devtalk.js';

///////////////////////////////////////////////////////////

export const userSetDevname = (devname) =>
{
  const device = get(curDevice);
  if (device !== null)
  {
    if (devname !== device.curname)
    {
      if (!/[`,/\\]/.test(devname))
      {
        device.newname = devname;
        sendCmdToDevice(cmdStr_DeviceName.concat(devname));
        return true;
      }
      else return false;
    }
  }

  return true;
}

export const userSendPause = (enable) =>
{
  sendStrandCmd(enable ? cmdStr_Pause : cmdStr_Resume);
}

// Strand/Pattern selection and handling:

export const userStrandCombine = (combine) =>
{
  if (!combine) // user turned off combine
  {
    // must disable all but the current one
    for (let i = 0; i < get(nStrands); ++i)
    {
      if (i === get(idStrand))
      {
        get(aStrands)[i].selected = true;
        get(eStrands)[i] = true;
      }
      else
      {
        get(aStrands)[i].selected = false;
        get(eStrands)[i] = false;
      }
    }

    aStrands.set(get(aStrands)); // triggers update
  }
}

export const userStrandSelect = (index, combine) =>
{
  let cur = get(idStrand);
  for (let s = 0; s < get(nStrands); ++s)
  {
    let wason = get(eStrands)[s];
    let nowon = get(aStrands)[s].selected;

    // hasnt' toggled in checkbox yet
    if (s === index) nowon = !nowon;

    if (wason !== nowon)
    {
      if (nowon && !combine && (s !== cur))
      {
        // user selected a different strand
        get(aStrands)[cur].selected = false;
        idStrand.set(s);
        pStrand.set(get(aStrands)[s]);
        sendStrandSwitch(s);
        get(eStrands)[cur] = false;
        get(eStrands)[s] = true;
      }
      else if (nowon && combine && (s !== cur))
      {
        get(eStrands)[cur] = true;
        strandCopyAll();

        // mirror current strand by sending current pattern to newly selected strand
        sendPatternToStrand(s);
      }
      else if (!nowon && combine && (s === cur))
      {
        // disabled the current strand, so set to first enabled one
        for (let ss = 0; ss < get(nStrands); ++ss)
        {
          if (get(aStrands)[ss].selected)
          {
            idStrand.set(s);
            pStrand.set(get(aStrands)[s]);
            sendStrandSwitch(ss);
            break;
          }
        }
        get(eStrands)[s] = false;
      }
      else if (nowon && (s === cur))
      {
        // must resend entire current pattern
        // after having all strands disabled
        sendPatternToStrand(s);
      }
      else
      {
        // else just update current enables, but do nothing
        // when just disabling one when others still enabled
        get(eStrands)[s] = get(aStrands)[s].selected;
      }
    }
  }
}

// user just selected pattern to use
// triggers program error if parse fails
export const userSetPattern = (pattern) =>
{
  //console.log(`SetPattern: ${get(pStrand).curPatternName}`); // DEBUG

  strandClearAll();

  if (parsePattern(pattern)) // sets vars for current strand
  {
    strandCopyAll();
    makeEntireCmdStr();
    sendStrandPattern(); // store/exec new pattern

    // triggers update to UI - MUST HAVE THIS
    pStrand.set(get(pStrand));
  }
  else deviceError(`Failed parsing pattern: ${name}`);
}

export const userClearPattern = () =>
{
  const strand = get(pStrand);
  strand.curPatternId   = MENUID_CUSTOM;
  strand.curPatternName = '';
  strand.curPatternCmd  = '';
  strand.curPatternDesc = '';

  strandClearAll();
  makeEntireCmdStr();
  sendStrandPattern(); // store/exec cleared pattern

  // triggers update to UI - MUST HAVE THIS
  pStrand.set(get(pStrand));

  strand.showCustom = false;
}

// assume cannot get called if number of T/L's at max
export const userAddTrackLayer = (track, layer, dofilter=false) =>
{
  const strand = get(pStrand);
  let effect, plugbits;

  if (!dofilter && (layer === DRAW_LAYER))
  {
    strandAppendTrack(track);

    track += 1;
    effect = defDrawEffect;
    plugbits = get(aEffectsDraw)[effect].bits;
  }
  else
  {
    strandAppendLayer(track, layer);

    layer += 1;
    effect = defFilterEffect;
    plugbits = get(aEffectsFilter)[effect].bits;
  }

  strand.tracks[track].layers[layer].pluginIndex = effect;
  strand.tracks[track].layers[layer].pluginBits  = plugbits;
  strand.tracks[track].trackBits = plugbits;

  updateTriggerLayers(); // update trigger sources
  updateAllTracks();     // rebuild all tracks

  // send command to append new track and redraw layer, set effect
  userSendToLayer(track, layer, cmdStr_AppRemEffect, effect);

  if (strand.tracks[track].layers[layer].trigAtStart)
    userSendToLayer(track, DRAW_LAYER, cmdStr_TrigAtStart, undefined);
}

// assume cannot get called if only one T/L
export const userRemTrackLayer = (track, layer) =>
{
  // send command to delete current track/layer (no effect #)
  userSendToLayer(track, layer, cmdStr_AppRemEffect);

  if (layer == DRAW_LAYER)
  {
    strandClearTrack(track); // clear it first
    strandRemoveTrack(track);
  }
  else
  {
    strandClearLayer(track, layer); // clear it first
    strandRemoveLayer(track, layer);
  }

  updateTriggerLayers(); // update trigger sources
  updateAllTracks();     // rebuild command string
}

// assume cannot get called if the T/L is the last
export const userSwapTrackLayer = (track, layer) =>
{
  // send command to swap track/layer (no effect #)
  userSendToLayer(track, layer, cmdStr_SelectEffect);

  if (layer === DRAW_LAYER)
  {
    strandSwapTracks(track);
    updateTriggerLayers();
    updateAllTracks();     // rebuild command string
  }
  else
  {
    strandSwapLayers(track, layer);
    updateTriggerLayers();
    updateAllTracks();     // rebuild command string
  }
}

// Note: does NOT update shadow values FIXME?
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
          userSendToLayer(i, DRAW_LAYER, cmdStr_LayerMute);
        }
        else if (strand.tracks[i].layers[DRAW_LAYER].mute === true)
        {
          strand.tracks[i].layers[DRAW_LAYER].mute = false;
          userSendToLayer(i, DRAW_LAYER, cmdStr_LayerMute, 0);
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
          userSendToLayer(i, DRAW_LAYER, cmdStr_LayerMute, 0);
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
          userSendToLayer(track, i, cmdStr_LayerMute);
        }
        else if (strand.tracks[track].layers[i].mute === true)
        {
          strand.tracks[track].layers[i].mute = false;
          userSendToLayer(track, i, cmdStr_LayerMute, 0);
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
          userSendToLayer(track, i, cmdStr_LayerMute, 0);
        }
      }
    }
  }

  makeLayerCmdStr(track, layer);
  makeEntireCmdStr();
}

// Note: does NOT update shadow values FIXME?
export const userMuteTrackLayer = (track, layer) =>
{
  const strand = get(pStrand);
  const enable = !strand.tracks[track].layers[layer].mute;
  strand.tracks[track].layers[layer].mute = enable; // toggle

  userSendToLayer(track, layer, cmdStr_LayerMute, enable ? undefined : 0);

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
