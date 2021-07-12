<script>
 
  import { pStrand, nTracks, tLayers } from './globals.js';

  export let tracknum = 0;

  let istrack = (tracknum == 0);

  let add_disabled = isAddDisabled();
  let del_disabled = isDelDisabled();

  function isAddDisabled()
  {
    if (istrack)
         return ($pStrand.tactives >= $nTracks);
    else return ($pStrand.tracks[tracknum-1].lactives >= $tLayers);
  }

  function isDelDisabled()
  {
    if (istrack)
         return ($pStrand.tactives <= 1);
    else return ($pStrand.tracks[tracknum-1].lactives <= 1);
  }

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
      let n = ++($pStrand.tracks[tracknum-1].lactives);
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
    }
    else
    {
      let n = --($pStrand.tracks[tracknum-1].lactives);
      if (n <= 1) del_disabled = true;
      add_disabled = false;
    }
  }

</script>

<button disabled={add_disabled} on:click={doadd} class="button" >+Add</button>
<button disabled={del_disabled} on:click={dodel} class="button" >-Del</button>

<style>
  .button {
    float:left;
    margin: 2px 15px 0 0;
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
