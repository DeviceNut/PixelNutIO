<script>

  import { Row, Column } from "carbon-components-svelte";

  import { pStrand } from './globals.js';
  import { DRAW_LAYER } from './devcmds.js';

  import Revealer from './Revealer.svelte';
  import ButtonsTrackCols from './ButtonsTrackCols.svelte';
  import SectionDraw from './SectionDraw.svelte';
  import SectionFilter from './SectionFilter.svelte';

  export let track;
  export let layer;

  let bgc;
  $: bgc = $pStrand.tracks[track].layers[layer].open ? '#222522' : '#111'
  // cannot use css vars here, and style cannot access globals

</script>

<Row style="margin-left:-15px; margin-top:7px; background-color: {bgc};">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].layers[layer].open} name='Layer' num={layer+1} />
  </Column>
  {#if (layer !== DRAW_LAYER) }
    <ButtonsTrackCols {track} {layer} />
  {/if}
</Row>
<Row style="margin-left:-15px;">
  {#if $pStrand.tracks[track].layers[layer].open }
    <Column style="padding-top:10px; background-color: var(--bg-color-tracklayer-area);">
      {#if (layer === DRAW_LAYER) }
        <SectionDraw {track} />
      {:else}
        <SectionFilter {track} {layer} />
      {/if}
    </Column>
  {/if}
</Row>
