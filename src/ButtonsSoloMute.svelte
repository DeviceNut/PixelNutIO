<script>
 
  import {
    DRAW_LAYER
  } from "./pixelnut.js";

  import {
    pStrand,
    nTracks, tLayers
  } from './globals.js';

  import {
    makeTrackCmdStrs,
    makeLayerCmdStr,
    makeEntireCmdStr
  } from './cmdmake.js'

  import { sendEntireCmdStr } from './cmduser.js';

  export let track;
  export let layer;

  let isSolo = false;
  let isMute = false;

  $: {
    isSolo = $pStrand.tracks[track].layers[layer].solo;
    isMute = $pStrand.tracks[track].layers[layer].mute;
  }

  function rebuild()
  {
    if (layer == 0) makeTrackCmdStrs(track);
    else            makeLayerCmdStr(track, layer);

    makeEntireCmdStr();
    sendEntireCmdStr();
  }

  const dosolo = () =>
  {
    isSolo = !isSolo;

    // setting a track to Solo turns off its Mute but turns it on for all other
    // tracks, but turning off the Solos for all other tracks, whereas turning
    // off the Solo turns off Mutes for all other tracks.
    if (layer == 0)
    {
      if (isSolo)
      {
        $pStrand.tracks[track].layers[DRAW_LAYER].solo = true;

        for (let i = 0; i < $nTracks; ++i)
        {
          if (i != track)
          {
            $pStrand.tracks[i].layers[DRAW_LAYER].solo = false;
            $pStrand.tracks[i].layers[DRAW_LAYER].mute = true;
          }
          else
          {
            $pStrand.tracks[i].layers[DRAW_LAYER].mute = false;
          }
        }
      }
      else
      {
        $pStrand.tracks[track].layers[DRAW_LAYER].solo = false;

        for (let i = 0; i < $nTracks; ++i)
        {
          if (i != track)
          {
            $pStrand.tracks[i].layers[DRAW_LAYER].mute = false;
          }
        }
      }
    }
    // setting a layer to Solo turns it off all other layers (in the same track),
    // and turns on the mute for all pre-draw layers in the same track (but not
    // the drawing layer, which is always on).
    //
    // turning off a layer Solo turns off all Mutes for other layers in this track.
    else
    {
      if (isSolo)
      {
        $pStrand.tracks[track].layers[layer].solo = true;

        for (let i = 1; i < $tLayers; ++i) // note layer 0 is not affected
        {
          if (i != layer)
          {
            $pStrand.tracks[track].layers[i].solo = false;
            $pStrand.tracks[track].layers[i].mute = true;
          }
          else
          {
            $pStrand.tracks[track].layers[i].mute = false;
          }
        }
      }
      else
      {
        $pStrand.tracks[track].layers[layer].solo = false;

        for (let i = 1; i < $tLayers; ++i) // note layer 0 is not affected
        {
          if (i != layer)
          {
            $pStrand.tracks[track].layers[i].mute = false;
          }
        }
      }
    }

    rebuild();
  }

  const domute = () =>
  {
    isMute = !isMute;
    $pStrand.tracks[track].layers[layer].mute = isMute;

    // turning off mute for a track/layer that is not on Solo
    // turns off the Solo for any other track/layer
    if (!isMute)
    {
      if (layer == 0)
      {
        for (let i = 0; i < $nTracks; ++i)
        {
          if (i != track)
          {
            $pStrand.tracks[i].layers[DRAW_LAYER].solo = false;
          }
        }
      }
      else
      {
        for (let i = 1; i < $tLayers; ++i) // note layer 0 is not affected
        {
          if (i != layer)
          {
            $pStrand.tracks[track].layers[i].solo = false;
          }
        }
      }
    }

    rebuild();
  }

</script>

<button class="button" class:select={isMute} on:click={domute} >Mute</button>
<button class="button" class:select={isSolo} on:click={dosolo} >Solo</button>

<style>
  .button {
    float:right;
    margin: 3px 5px 0 0;
    padding: 4px;
    width: 40px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
  .select {
    padding: 3px;
    border: 2px solid rgb(0,100,200);
    background-color:#222322;
  }
</style>
