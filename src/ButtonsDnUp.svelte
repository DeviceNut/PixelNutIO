<script>
 
  import {
    pStrand,
    dStrands,
    idStrand
   } from './globals.js';
 
  import {
    DRAW_LAYER,
    OPER_SWAP_LAYER,
    OPER_SWAP_TRACK,
    cmdStr_Operation
  } from './pixcmds.js';

  import {
    strandSwapTracks,
    strandSwapLayers
  } from './strands.js';

  import {
    updateAllTracks,
    updateTriggerLayers
  } from './cmdmake.js';

  import { sendEntirePattern } from './cmdsend.js'; // FIXME
  import { userSendToLayer } from './cmduser.js';

  export let track;
  export let layer;

  function checkTrigTrack(track)
  {
    let found = false;

    // check if moved tracks were used for any trigger track
    for (let i = 0; i < $pStrand.tactives; ++i)
    {
      for (let j = 0; j < $pStrand.tracks[i].lactives; ++j)
      {
        if ($pStrand.tracks[i].layers[j].trigOnLayer)
        {
          // convert from 1-based numbers to 0-based index
          let ti = $pStrand.tracks[i].layers[j].trigTrackNum-1;

          if (ti === track)
          {
            $pStrand.tracks[i].layers[j].trigTrackNum = track+1;
            found = true;
          }
          else if (ti === track+1)
          {
            $pStrand.tracks[i].layers[j].trigTrackNum = track;
            found = true;
          }
        } 
      }
    }

    strandSwapTracks(track);

    if (found) updateTriggerLayers();
  }

  function checkTrigLayer(layer)
  {
    let found = false;

    // check if moved track layers were used for any trigger track layer
    for (let i = 0; i < $pStrand.tactives; ++i)
    {
      for (let j = 0; j < $pStrand.tracks[i].lactives; ++j)
      {
        if ($pStrand.tracks[i].layers[j].trigOnLayer)
        {
          // convert from 1-based numbers to 0-based index
          let ti = $pStrand.tracks[i].layers[j].trigTrackNum-1;
          let li = $pStrand.tracks[i].layers[j].trigLayerNum-1;

          if ((ti === track) && (li === layer))
          {
            $pStrand.tracks[i].layers[j].trigLayerNum = layer+1;
            $dStrands[$idStrand].tracks[i].layers[j].trigLayerNum = layer+1;
            found = true;
          }
          else if ((ti === track) && (li === layer+1))
          {
            $pStrand.tracks[i].layers[j].trigLayerNum = layer;
            $dStrands[$idStrand].tracks[i].layers[j].trigLayerNum = layer;
            found = true;
          }
        } 
      }
    }

    strandSwapLayers(track, layer);

    if (found) updateTriggerLayers();
  }

  const moveup = () =>
  {
    if (layer === DRAW_LAYER)
    {
      checkTrigTrack(track);
      updateAllTracks(); // recreate all tracks

      //userSendToLayer(track, DRAW_LAYER, cmdStr_Operation, `${OPER_SWAP_TRACK}`);
    }
    else
    {
      checkTrigLayer(layer);
      updateAllTracks(); // recreate all tracks

      //userSendToLayer(track, layer, cmdStr_Operation, `${OPER_SWAP_LAYER}`);
    }

    sendEntirePattern(); // FIXME when device command handling updated

    $pStrand = $pStrand; // refresh screen
  }

  const movedn = () =>
  {
    if (layer === DRAW_LAYER)
    {
      checkTrigTrack(track-1);
      updateAllTracks(); // recreate all tracks

      //userSendToLayer(track-1, DRAW_LAYER, cmdStr_Operation, `${OPER_SWAP_TRACK}`);
    }
    else
    {
      checkTrigLayer(layer-1);
      updateAllTracks(); // recreate all tracks

      //userSendToLayer(track, layer-1, cmdStr_Operation, `${OPER_SWAP_LAYER}`);
    }

    sendEntirePattern(); // FIXME when device command handling updated

    $pStrand = $pStrand; // refresh screen
  }
 
</script>
 
{#if (layer === DRAW_LAYER)}
  {#if (track > 0)}
    <button
      class="button"
      on:click={movedn}
      >Dn
    </button>
  {/if}
  <button
    class="button"
    on:click={moveup}
    disabled={track+1 >= $pStrand.tactives}
    >Up
  </button>
{:else}
  {#if (layer !== DRAW_LAYER)}
    <button
      class="button"
      on:click={movedn}
      disabled={(layer < 2)}
      >Dn
    </button>
  {/if}
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
 