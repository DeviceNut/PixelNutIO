<script>
 
  import { DRAW_LAYER } from './devcmds.js';

  import {
    pStrand,
    nTracks,
    nLayers
  } from './globals.js';

  import {
    userAddTrackLayer,
    userRemTrackLayer,
    userSwapTrackLayer,
    userSoloTrackLayer,
    userMuteTrackLayer
  } from './cmdacts.js';

  export let track;
  export let layer;

  let noadd, norem, noswap, nosolo;

  $: {
    if (layer === DRAW_LAYER) // apply to track
    {
      noadd  = ($pStrand.tactives >= $nTracks);
      norem  = ($pStrand.tactives <= 1);
      noswap = (track+1 >= $pStrand.tactives);
      nosolo = norem;
    }
    else
    {
      noadd  = ($pStrand.tracks[track].lactives >= $nLayers);
      norem  = ($pStrand.tracks[track].lactives <= 1);
      noswap = (layer+1 >= $pStrand.tracks[track].lactives);
      nosolo = norem;
    }
  }

  const doadd  = () => { userAddTrackLayer( track, layer); }
  const dorem  = () => { userRemTrackLayer( track, layer); }
  const doswap = () => { userSwapTrackLayer(track, layer); }
  const dosolo = () => { userSoloTrackLayer(track, layer); }
  const domute = () => { userMuteTrackLayer(track, layer); }

</script>

<button class="button"
  on:click={doadd}
  disabled={noadd}
  >Add
</button>

<button class="button"
  on:click={dorem}
  disabled={norem}
  >Del
</button>

<button class="button"
  on:click={doswap}
  disabled={noswap}
  >Swap
</button>

<button class="button"
  class:select={$pStrand.tracks[track].layers[layer].solo}
  on:click={dosolo}
  disabled={nosolo}
  >Solo
</button>

<button
  class="button"
  class:select={$pStrand.tracks[track].layers[layer].mute}
  on:click={domute}
  >Mute
</button>

<style>
  .button {
    float: right;
    width: 38px;
    height: 30px;
    margin: 5px 5px 7px 0;
    padding: 3px;
  }
  .button.select {
    padding: 3px;
    background-color: var(--bgc-button-enabled);
    border: 2px solid var(--bdc-button-enabled);
  }
</style>
