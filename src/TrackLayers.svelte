<script>

  import { Row, Column } from "carbon-components-svelte";

  import { pStrand } from './globals.js';
  import { DRAW_LAYER } from './devcmds.js';

  import Revealer from './Revealer.svelte';
  import ButtonsDrawLayer from './ButtonsDrawLayer.svelte';
  import ButtonsActions from './ButtonsActions.svelte';

  import SelectDraw from './SelectDraw.svelte';
  import SectionDraw from './SectionDraw.svelte';
  import SelectFilter from './SelectFilter.svelte';
  import SelectTrigger from './SelectTrigger.svelte';

  export let track;

  let tstate;
  $: tstate = $pStrand.tracks[track].open ? 'block' : 'none';

</script> 

<Row style="margin-top:10px; background-color:var(--bgc-header);">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].open} name='Track' num={track+1} />
  </Column>
  <ButtonsActions {track} layer={DRAW_LAYER} />
</Row>
<div style="display:{tstate};">
  {#each Array($pStrand.tracks[track].lactives) as _,layer}
    <Row style="margin-top:10px; margin-left:-5px; background-color:var(--bgc-header);">
      <Column>
        <Revealer bind:isopen={$pStrand.tracks[track].layers[layer].open} name='Layer' num={layer+1} />
      </Column>
      {#if (layer === DRAW_LAYER) }
        <ButtonsDrawLayer {track} />
      {:else}
        <ButtonsActions {track} {layer} />
      {/if}
    </Row>
    <Row style="margin-left:-5px;">
      <Column style="padding-top:10px; padding-bottom:10px; background-color:var(--bgc-page);">
        {#if (layer === DRAW_LAYER) }
          <SelectDraw {track} />
          {#if $pStrand.tracks[track].layers[layer].open}
            <SectionDraw {track} />
          {/if}
        {:else}
          <SelectFilter {track} {layer} />
          {#if $pStrand.tracks[track].layers[layer].open}
            <SelectTrigger {track} {layer} />
          {/if}
        {/if}
      </Column>
    </Row>
  {/each}
</div>
