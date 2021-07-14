<script>
 
  import { pStrand, nTracks, tLayers } from './globals.js';

  export let track = 0;
  export let layer = 0;

  let isSolo = false;
  let isMute = false;

  $: {
    if (layer == 0) // controls for a track
    {
      isSolo = $pStrand.tracks[track].solo;
      isMute = $pStrand.tracks[track].mute;
    }
    else // for one of the predraw layers (layer > 1)
    {
      isSolo = $pStrand.tracks[track].layers[layer].solo;
      isMute = $pStrand.tracks[track].layers[layer].mute;
    }
  }

  const dosolo = () =>
  {
    isSolo = !isSolo;

    // setting a track to Solo turns off its Mute but turns it on for all other
    // tracks, but turning off the Solos for all other tracks, whereas turning
    // off the Solo turns off all Mutes for all tracks.
    if (layer == 0)
    {
      if (isSolo)
      {
        $pStrand.tracks[track].solo = true;

        for (let i = 0; i < $nTracks; ++i)
        {
          if (i == track) {
            $pStrand.tracks[i].mute = false;
          } else {
            $pStrand.tracks[i].solo = false;
            $pStrand.tracks[i].mute = true;
          }
        }
      }
      else
      {
        $pStrand.tracks[track].solo = false;

        for (let i = 0; i < $nTracks; ++i) {
          $pStrand.tracks[i].mute = false;
        }
      }
    }
    // setting a layer to Solo turns it off all other layers (in the same track),
    //  and turns on the mute for all pre-draw layers in the same track (but not
    //  the drawing layer, which is always on).
    //
    // turning off a layer Solo turns off all mutes all all layers in this track.
    else
    {
      if (isSolo)
      {
        $pStrand.tracks[track].layers[layer].solo = true;

        for (let i = 0; i < $tLayers; ++i)
        {
          if (i == layer) {
            $pStrand.tracks[track].layers[i].mute = false;
          } else {
            $pStrand.tracks[track].layers[i].solo = false;
            $pStrand.tracks[track].layers[i].mute = true;
          }
        }
      }
      else
      {
        $pStrand.tracks[track].layers[layer].solo = false;

        for (let i = 0; i < $tLayers; ++i) {
          $pStrand.tracks[track].layers[i].mute = false;
        }
      }
    }
  }

  const domute = () =>
  {
    isMute = !isMute;

    if (layer == 0) {
      $pStrand.tracks[track].mute = isMute;
    } else {
      $pStrand.tracks[track].layers[layer].mute = isMute;
    }
  }

</script>

<button on:click={domute} class="button" class:select={isMute}>Mute</button>
<button on:click={dosolo} class="button" class:select={isSolo}>Solo</button>

<style>
  .button {
    float:right;
    margin: 2px 15px 0 0;
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
