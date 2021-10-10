<script>

  import {
    Row,
    Dropdown
  } from "carbon-components-svelte";

  import {
    pStrand,
    aEffectsFilter,
    aEffFilterDesc
  } from './globals.js';

  import { userSetEffect } from './cmduser.js';

  import SectionTrigger from './SectionTrigger.svelte';

  export let track;
  export let layer;

  const seteffect = () => { userSetEffect(track, layer, $aEffectsFilter); }

  let helpon = false;

</script>

<div style="margin-top:5px; padding-left:5px;">
  <Row>
    <Dropdown
      style="margin-bottom:-13px;"
      size="sm"
      type="inline"
      on:select={seteffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[layer].pluginIndex}
      bind:items={$aEffectsFilter}
    />
    <button
      class="button-help"
      on:click={() => {helpon = !helpon;}}
      >?
    </button>
  </Row>

  {#if helpon }
    <Row style="margin-right:-10px; padding:5px;
                color: var(--color-textbox);
                background-color: var(--bg-color-textbox);">
      <p style="font-size:.9em;">
        {$aEffFilterDesc[$pStrand.tracks[track].layers[layer].pluginIndex]}
      </p>
    </Row>
  {/if}

  <SectionTrigger {track} {layer} />
</div>

<style>
  .button-help {
    width: 30px;
    height: 30px;
    padding: 3px;
    margin-right: 10px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
