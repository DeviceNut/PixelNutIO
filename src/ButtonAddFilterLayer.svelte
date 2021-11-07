<script>
 
  import { DRAW_LAYER } from './devcmds.js';
  import { pStrand, nTracks } from './globals.js';
  import { userAddTrackLayer } from './cmduser2.js';

  export let track;

  let noadd;
  $: noadd  = ($pStrand.tactives >= $nTracks);

  // adding filter layer only here
  const doadd  = () => { userAddTrackLayer(track, DRAW_LAYER, true); }

</script>

<button
  class="button"
  on:click={doadd}
  disabled={noadd}
  >Add Filter
</button>

<style>
  .button {
    float: right;
    width: 85px;
    margin: 5px 5px 7px 0;
    padding: 4px;
  }
</style>
