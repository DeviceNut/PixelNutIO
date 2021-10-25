<script>
 
  import { pStrand } from './globals.js';
  import { DRAW_LAYER } from './devcmds.js';

  import {
    strandSwapTracks,
    strandSwapLayers
  } from './strands.js';

  import {
    updateAllTracks,
    updateTriggerLayers
  } from './cmdmake.js';

  import { sendEntirePattern } from './cmdsend.js'; // FIXME
  import { userSendToLayer } from './cmduser.js'; // TODO

  export let track;
  export let layer;

  const moveup = () =>
  {
    if (layer === DRAW_LAYER)
    {
      strandSwapTracks(track);
      updateTriggerLayers();
      updateAllTracks(); // recreate all tracks
    }
    else
    {
      strandSwapLayers(track, layer);
      updateTriggerLayers();
      updateAllTracks(); // recreate all tracks
    }

    sendEntirePattern(); // FIXME when device command handling updated

    $pStrand = $pStrand; // refresh screen
  }

  const movedn = () =>
  {
    if (layer === DRAW_LAYER)
    {
      strandSwapTracks(track-1);
      updateTriggerLayers();
      updateAllTracks(); // recreate all tracks
    }
    else
    {
      strandSwapLayers(track, layer-1);
      updateTriggerLayers();
      updateAllTracks(); // recreate all tracks
    }

    sendEntirePattern(); // FIXME when device command handling updated

    $pStrand = $pStrand; // refresh screen
  }
 
</script>
 
{#if (layer === DRAW_LAYER)}
  <button
    class="button"
    on:click={movedn}
    disabled={(track == 0)}
    >Dn
  </button>
  <button
    class="button"
    on:click={moveup}
    disabled={track+1 >= $pStrand.tactives}
    >Up
  </button>
{:else}
  <button
    class="button"
    on:click={movedn}
    disabled={(layer < 2)}
    >Dn
  </button>
  <button
    class="button"
    on:click={moveup}
    disabled={layer+1 >= $pStrand.tracks[track].lactives}
    >Up
  </button>
{/if}
 
 <style>
   .button {
     float: right;
     width: 40px;
     margin: 3px 5px 0 0;
     padding: 4px;
   }
 </style>
 