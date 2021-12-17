<script>
 
  import { DRAW_LAYER } from './devcmds.js';
  import { pStrand, nTracks } from './globals.js';
  import { userAddTrackLayer } from './cmduser2.js';

  export let track;

  let noadd;
  $: noadd  = ($pStrand.tactives >= $nTracks);

  // adding filter layer only here
  const doadd = () => { userAddTrackLayer(track, DRAW_LAYER, true); }

  let actstr;
  let expanded;
  $: {
    let oneopen = false;
    const t = $pStrand.tracks[track];
    for (let i = 0; i < t.lactives; ++i)
      if (t.layers[i].open) oneopen = true;

    expanded = oneopen;
  }
  $: actstr = expanded ? "Collapse" : "Expand";

  const doact = () =>
  {
    expanded = !expanded;
    const t = $pStrand.tracks[track];
    for (let i = 0; i < t.lactives; ++i)
      t.layers[i].open = expanded;

    // triggers update to UI - MUST HAVE THIS
    $pStrand = $pStrand;
  }

</script>

<button class="button"
  on:click={doadd}
  disabled={noadd}
  >Add
</button>

<button class="button"
  on:click={doact}
  >{actstr}
</button>

<style>
  .button {
    float: right;
    width: 60px;
    margin: 5px 5px 7px 0;
    padding: 4px;
  }
</style>
