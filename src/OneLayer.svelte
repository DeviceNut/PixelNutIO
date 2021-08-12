<script>

  import { Row, Column } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import Revealer from './Revealer.svelte';
  import ButtonsDnUp from './ButtonsDnUp.svelte';
  import ButtonsSoloMute from './ButtonsSoloMute.svelte';
  import ControlsDraw from './ControlsDraw.svelte';
  import ControlsFilter from './ControlsFilter.svelte';

  export let track;
  export let layer;

  let bgc;
  $: bgc = $pStrand.tracks[track].layers[layer].open ? '#222522' : '#111'
  // cannot use css vars here, and <Row> cannot take a class

</script>

<Row style="margin-left:-15px; margin-top:7px; background-color: {bgc};">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].layers[layer].open} name='Layer' num={layer+1} />
  </Column>
  {#if (layer !== 0) }
    <ButtonsDnUp {track} {layer} />
    <ButtonsSoloMute {track} {layer} />
  {/if}
</Row>
<Row style="margin-left:-15px;">
  {#if $pStrand.tracks[track].layers[layer].open }
    <Column style="padding-top:10px; background-color: var(--bg-color-tracklayer-area);">
      {#if (layer === 0) }
        <ControlsDraw {track} />
      {:else}
        <ControlsFilter {track} {layer} />
      {/if}
    </Column>
  {/if}
</Row>
