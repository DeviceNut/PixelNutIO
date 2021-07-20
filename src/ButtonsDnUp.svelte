<script>
 
  import { pStrand } from './globals.js';
 
  import {
    makeTrackCmdStrs,
    makeLayerCmdStr,
    makeEntireCmdStr
  } from './cmdmake.js'

  import {
    strandSwapTracks,
    strandSwapLayers
  } from './strands.js'

  import { sendEntireCmdStr } from './cmduser.js';

  export let track;
  export let layer;

  function rebuild()
  {
    if (layer == 0) makeTrackCmdStrs(track);
    else            makeLayerCmdStr(track, layer);

    makeEntireCmdStr();
    sendEntireCmdStr();
  }
 
  const moveup = () =>
  {
    if (layer == 0)
        strandSwapTracks(track+1);
    else strandSwapLayers(track, layer+1);

    rebuild();
    $pStrand = $pStrand; // refresh screen
  }

  const movedn = () =>
  {
    if (layer == 0)
         strandSwapTracks(track);
    else strandSwapLayers(track, layer);

    rebuild();
    $pStrand = $pStrand; // refresh screen
  }
 
</script>
 
{#if (layer == 0)}
  {#if (track > 0)}
  <button class="button" on:click={movedn} >Dn</button>
  {/if}
  <button class="button" on:click={moveup} disabled={track+1 >= $pStrand.tactives} >Up</button>
{:else}
{#if (layer > 1)}
  <button class="button" on:click={movedn} >Dn</button>
  {/if}
  <button class="button" on:click={moveup} disabled={layer+1 >= $pStrand.tracks[track].lactives} >Up</button>
{/if}
 
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
   button:disabled,button[disabled] {
    pointer-events: none;
    opacity: 0.35;
  }
 </style>
 