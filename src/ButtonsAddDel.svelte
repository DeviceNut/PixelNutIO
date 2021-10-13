<script>
 
  import {
    pStrand,
    nTracks,
    tLayers
  } from './globals.js';

  import {
    DRAW_LAYER,
    cmdStr_SelectEffect
  } from './pixcmds.js';

  import {
    strandClearTrack,
    strandClearLayer
  } from './strands.js';

  import {
    updateAllTracks,
    updateTriggerLayers,
    convTrackLayerToID
  } from './cmdmake.js';

  import { sendEntirePattern } from './cmdsend.js'; // FIXME
  import { userSendToLayer } from './cmduser.js';

  export let track;

  let istrack = (track === -1);

  let add_disabled;
  let del_disabled;

  $: {
    if (istrack)
    {
      add_disabled = ($pStrand.tactives >= $nTracks);
      del_disabled = ($pStrand.tactives <= 1);
    }
    else
    {
      add_disabled = ($pStrand.tracks[track].lactives >= $tLayers);
      del_disabled = ($pStrand.tracks[track].lactives <= 1);
    }
  }

  // Note: adding track to end doesn't affect
  // any of the existing trigger track/layer numbers
  // (not until select an effect for first layer)
  const doadd = () =>
  {
    if (istrack)
    {
      let n = ++($pStrand.tactives);
      if (n >= $nTracks) add_disabled = true;
      del_disabled = false;
    }
    else
    {
      let n = ++($pStrand.tracks[track].lactives);
      if (n >= $tLayers) add_disabled = true;
      del_disabled = false;
    }
  }

  const dodel = () =>
  {
    let layer;

    if (istrack)
    {
      let n = --($pStrand.tactives);
      if (n <= 1) del_disabled = true;
      add_disabled = false;

      layer = DRAW_LAYER;

      strandClearTrack($pStrand.tactives)
    }
    else
    {
      let n = --($pStrand.tracks[track].lactives);
      if (n <= 1) del_disabled = true;
      add_disabled = false;

      layer = $pStrand.tracks[track].lactives;
      strandClearLayer(track, layer);
    }

    updateTriggerLayers(); // update trigger sources
    updateAllTracks();     // recreate all tracks

    //let layerid = convTrackLayerToID(track, layer);
    //userSendToLayer(track, layer, cmdStr_SelectEffect);
    sendEntirePattern(); // FIXME when device command handling updated
  }

</script>

<button class="button" disabled={add_disabled} on:click={doadd} >+Add</button>
<button class="button" disabled={del_disabled} on:click={dodel} >-Del</button>

<style>
  .button {
    width: 50px;
    margin: 2px 2px 0 0;
    padding: 2px;
  }
</style>
