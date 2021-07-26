<script>
 
  import {
    pStrand,
    nTracks,
    tLayers
  } from './globals.js';

  import {
    strandClearTrack,
    strandClearLayer
  } from './strands.js';

  import {
    sendEntireCmdStr,
    updateAllTracks,
    updateTriggerLayers
  } from './cmduser.js';

  export let track;

  let istrack = (track == -1);

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
    if (istrack)
    {
      let n = --($pStrand.tactives);
      if (n <= 1) del_disabled = true;
      add_disabled = false;

      strandClearTrack($pStrand.tactives)
    }
    else
    {
      let n = --($pStrand.tracks[track].lactives);
      if (n <= 1) del_disabled = true;
      add_disabled = false;

      strandClearLayer(track, $pStrand.tracks[track].lactives)
    }

    updateTriggerLayers(); // update trigger sources and rebuild cmdstrs

    // must update all tracks and resend entire command
    // whenever a track/layer is deleted
    updateAllTracks();
    sendEntireCmdStr();
  }

</script>

<button class="button" disabled={add_disabled} on:click={doadd} >+Add</button>
<button class="button" disabled={del_disabled} on:click={dodel} >-Del</button>

<style>
  .button {
    margin: 2px 2px 0 0;
    padding: 2px;
    width: 50px;
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
