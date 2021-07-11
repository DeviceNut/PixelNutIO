<script>
 
  import {
    xTracks, nTracks,
    xLayers, tLayers, nLayers
  }
  from './globals.js';

  export let tracknum = 0;
  let istrack = (tracknum == 0);

  let add_disabled = isAddDisabled();
  let del_disabled = isDelDisabled();

  function isAddDisabled()
  {
    if (istrack)
         return ($nTracks >= $xTracks);
    else return ($nLayers >= $xLayers);
  }

  function isDelDisabled()
  {
    if (istrack)
         return ($nTracks <= 1);
    else return ($nLayers[tracknum-1] <= 1);
  }

  const doadd = () =>
  {
    if (istrack)
    {
      let n = $nTracks + 1;
      if (n >= $xTracks) add_disabled = true;
      del_disabled = false;
      nTracks.set(n);
    }
    else
    {
      let e = $nLayers;
      let n = ++e[tracknum-1];
      if (n >= $tLayers) add_disabled = true;
      del_disabled = false;
      nLayers.set(e);
    }
  }

  const dodel = () =>
  {
    if (istrack)
    {
      let n = $nTracks - 1;
      if (n <= 1) del_disabled = true;
      add_disabled = false;
      nTracks.set(n);
    }
    else
    {
      let e = $nLayers;
      let n = --e[tracknum-1];
      if (n <= 1) del_disabled = true;
      add_disabled = false;
      nLayers.set(e);
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
