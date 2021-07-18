<script>

  import {
    Row,
    Dropdown
  } from "carbon-components-svelte";

  import {
    pStrand,
    aEffectsFilter,
    aEffFilterDesc
  } from './globals.js'

  import { userSetFilterEffect } from "./cmduser.js"

  import ControlsTrigger from './ControlsTrigger.svelte'

  export let track;
  export let layer;

  const seteffect = () => { userSetFilterEffect(track, layer); }

</script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Filter Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      on:select={seteffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[layer].pluginIndex}
      bind:items={$aEffectsFilter}
    />
  </div>
</Row>

<Row style="margin: 15px 0 10px 0; padding: 5px; color: #888988; background-color: #333433;">
  <span>
    {$aEffFilterDesc[$pStrand.tracks[track].layers[layer].pluginIndex]}
  </span>
</Row>

{#if ($pStrand.tracks[track].layers[layer].pluginIndex != 0) }
  <ControlsTrigger {track} {layer} />
{/if}
