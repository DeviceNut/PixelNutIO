<script>

  import { Row, Column } from "carbon-components-svelte";

  import { pStrand } from './globals.js';
  import { DRAW_LAYER } from './devcmds.js';

  import Revealer from './Revealer.svelte';
  import ButtonAddFilterLayer from './ButtonAddFilterLayer.svelte';
  import ButtonsFiltersAndTracks from './ButtonsTracksFilters.svelte';

  import SelectDraw from './SelectDraw.svelte';
  import SectionDraw from './SectionDraw.svelte';
  import SelectFilter from './SelectFilter.svelte';
  import SectionTrigger from './SectionTrigger.svelte';

  export let track;
  export let layer;

  let name = `Layer ${layer+1}`;

</script>

<Row style="margin:7px 0 0 -15px; background-color:var(--bg-color-tracklayer-head);">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].layers[layer].open} {name} />
  </Column>
  {#if (layer === DRAW_LAYER) }
    <ButtonAddFilterLayer {track} />
  {:else}
    <ButtonsFiltersAndTracks {track} {layer} />
  {/if}
</Row>
<Row style="margin-left:-15px;">
  <Column style="padding-top:10px; background-color:var(--bg-color-tracklayer-area);">
    {#if (layer === DRAW_LAYER) }
      <SelectDraw {track} />
      {#if $pStrand.tracks[track].layers[layer].open }
        <SectionDraw {track} />
      {/if}
    {:else}
      <SelectFilter {track} {layer} />
      {#if $pStrand.tracks[track].layers[layer].open }
        <SectionTrigger {track} {layer} />
      {/if}
    {/if}
  </Column>
</Row>
