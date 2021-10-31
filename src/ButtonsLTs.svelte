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
  } from './cmduser2.js';

  export let track;
  export let layer;

  let noadd, norem, noswap;

  $: {
    if (layer === DRAW_LAYER)
    {
      noadd  = ($pStrand.tactives >= $nTracks);
      norem  = ($pStrand.tactives <= 1);
      noswap = (track+1 >= $pStrand.tactives);
    }
    else
    {
      noadd  = ($pStrand.tracks[track].lactives >= $nLayers);
      norem  = ($pStrand.tracks[track].lactives <= 1);
      noswap = (layer+1 >= $pStrand.tracks[track].lactives);
    }
  }

  const doadd  = () => { userAddTrackLayer(track, layer); }
  const dorem  = () => { userRemTrackLayer(track, layer); }
  const doswap = () => { userSwapTrackLayer(track, layer); }

  const dosolo = () => { userSoloTrackLayer(track, layer); }
  const domute = () => { userMuteTrackLayer(track, layer); }

</script>

<button
  class="button"
  on:click={doadd}
  disabled={noadd}
  >Add
</button>

<button
  class="button"
  on:click={dorem}
  disabled={norem}
  >Rem
</button>

<button
  class="button"
  on:click={doswap}
  disabled={noswap}
  >Swap
</button>

<button
  class="button"
  class:select={$pStrand.tracks[track].layers[layer].solo}
  on:click={dosolo}
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
    width: 40px;
    margin: 5px 5px 7px 0;
    padding: 4px;
  }
  .button.select {
    padding: 3px;
    border: 2px solid var(--color-border-select);
    background-color: var(--bg-color-button-select);
  }
</style>
