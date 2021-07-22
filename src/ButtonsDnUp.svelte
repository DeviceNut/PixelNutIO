<script>
 
  import {
    pStrand,
    dStrands,
    idStrand
   } from './globals.js';
 
  import {
    strandSwapTracks,
    strandSwapLayers
  } from './strands.js'

  import {
    sendEntireCmdStr,
    updateTriggerLayers
  } from './cmduser.js';

  export let track;
  export let layer;

  function checkTrigTrack(tupper)
  {
    let found = false;

    // check if moved tracks were used for any trigger track
    for (let i = 0; i < $pStrand.tactives; ++i)
    {
      for (let j = 0; j < $pStrand.tracks[i].lactives; ++j)
      {
        if ($pStrand.tracks[i].layers[j].trigDoLayer)
        {
          let tnum = $pStrand.tracks[i].layers[j].trigTrackNum;

          if (tnum == tupper+1)
          {
            $pStrand.tracks[i].layers[j].trigTrackNum = tupper;
            found = true;
          }
          else if (tnum == tupper)
          {
            $pStrand.tracks[i].layers[j].trigTrackNum = tupper+1;
            found = true;
          }
        } 
      }
    }

    strandSwapTracks(tupper);

    if (found) updateTriggerLayers();
  }

  function checkTrigLayer(lupper)
  {
    let found = false;

    // check if moved track layers were used for any trigger track layer
    for (let i = 0; i < $pStrand.tactives; ++i)
    {
      for (let j = 0; j < $pStrand.tracks[i].lactives; ++j)
      {
        if ($pStrand.tracks[i].layers[j].trigDoLayer)
        {
          let tnum = $pStrand.tracks[i].layers[j].trigTrackNum;
          let lnum = $pStrand.tracks[i].layers[j].trigLayerNum;

          if ((tnum == track+1) && (lnum == lupper+1))
          {
            $pStrand.tracks[i].layers[j].trigLayerNum = lupper;
            $dStrands[$idStrand].tracks[i].layers[j].trigLayerNum = lupper;
            found = true;
          }
          else if ((tnum == track+1) && (lnum == lupper))
          {
            $pStrand.tracks[i].layers[j].trigLayerNum = lupper+1;
            $dStrands[$idStrand].tracks[i].layers[j].trigLayerNum = lupper+1;
            found = true;
          }
        } 
      }
    }

    strandSwapLayers(track, lupper);

    if (found) updateTriggerLayers();
  }

  const moveup = () =>
  {
    if (layer == 0)
         checkTrigTrack(track+1);
    else checkTrigLayer(layer+1);

    sendEntireCmdStr();

    $pStrand = $pStrand; // refresh screen
  }

  const movedn = () =>
  {
    if (layer == 0)
         checkTrigTrack(track);
    else checkTrigLayer(layer);

    sendEntireCmdStr();

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
 