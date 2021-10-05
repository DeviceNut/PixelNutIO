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
    updateTriggerLayers,
    convTrackLayerToID
  } from './cmdmake.js';

  import { sendEntirePattern } from './cmdsend.js'; // FIXME
  import { sendLayerCmd } from './cmdsend.js';

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

          if (tnum === tupper+1)
          {
            $pStrand.tracks[i].layers[j].trigTrackNum = tupper;
            found = true;
          }
          else if (tnum === tupper)
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

          if ((tnum === track+1) && (lnum === lupper+1))
          {
            $pStrand.tracks[i].layers[j].trigLayerNum = lupper;
            $dStrands[$idStrand].tracks[i].layers[j].trigLayerNum = lupper;
            found = true;
          }
          else if ((tnum === track+1) && (lnum === lupper))
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
    if (layer === DRAW_LAYER)
    {
      checkTrigTrack(track+1);
      updateAllTracks(); // recreate all tracks

      //let layerid = convTrackLayerToID(track, DRAW_LAYER);
      //sendLayerCmd(layerid, cmdStr_Operation, `${OPER_SWAP_TRACK}`);
    }
    else
    {
      checkTrigLayer(layer+1);
      updateAllTracks(); // recreate all tracks

      //let layerid = convTrackLayerToID(track, layer);
      //sendLayerCmd(layerid, cmdStr_Operation, `${OPER_SWAP_LAYER}`);
    }

    sendEntirePattern(); // FIXME when device command handling updated

    $pStrand = $pStrand; // refresh screen
  }

  const movedn = () =>
  {
    if (layer === DRAW_LAYER)
    {
      checkTrigTrack(track);
      updateAllTracks(); // recreate all tracks

      //let layerid = convTrackLayerToID(track-1, DRAW_LAYER);
      //sendLayerCmd(layerid, cmdStr_Operation, `${OPER_SWAP_TRACK}`);
    }
    else
    {
      checkTrigLayer(layer);
      updateAllTracks(); // recreate all tracks

      //let layerid = convTrackLayerToID(track, layer-1);
      //sendLayerCmd(layerid, cmdStr_Operation, `${OPER_SWAP_LAYER}`);
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
 