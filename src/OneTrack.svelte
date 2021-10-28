<script>

  import { Row, Column } from "carbon-components-svelte";

  import { pStrand, nLayers } from './globals.js';
  import { strandClearLayer } from './strands.js';
  import { DRAW_LAYER } from './devcmds.js';

  import Revealer from './Revealer.svelte';
  import ButtonsDnUp from './ButtonsDnUp.svelte';
  import ButtonsSoloMute from './ButtonsSoloMute.svelte';
  import OneLayer from './OneLayer.svelte';

  export let track;

  let tstate;
  $: tstate = $pStrand.tracks[track].open ? 'block' : 'none';

  let bgc;
  $: bgc = $pStrand.tracks[track].open ? '#222522' : '#111';
  // cannot use css vars here, and style cannot access globals

  let add_disabled;
  $: add_disabled = ($pStrand.tracks[track].lactives >= $nLayers);

  const doadd = () =>
  {
    strandClearLayer(track, $pStrand.tracks[track].lactives);
    ++($pStrand.tracks[track].lactives);
  }

</script> 

<Row style="margin-top:10px; background-color: {bgc};">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].open} name='Track' num={track+1} />
  </Column>
  <ButtonsDnUp {track} layer={DRAW_LAYER} />
  <ButtonsSoloMute {track} layer={DRAW_LAYER} />
</Row>
<div style="display:{tstate};">
  {#each Array($pStrand.tracks[track].lactives) as _,layer}
    <div style="margin-left:13px; display: {tstate};">
      <OneLayer {track} {layer} />
    </div>
  {/each}
  {#if ($pStrand.tracks[track].lactives < $nLayers)}
    <div style="margin:0 5px 5px 5px;">
      <button class="button-add"
        on:click={doadd}
        disabled={add_disabled}
        >Add New Layer
      </button>
    </div>
  {/if}
</div>

<style>
  .button-add {
    width: 100%;
    padding: 2px;
  }
</style>
