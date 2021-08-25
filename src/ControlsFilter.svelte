<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Dropdown
  } from "carbon-components-svelte";

  import {
    pStrand,
    aEffectsFilter,
    aEffFilterDesc
  } from './globals.js'

  import { userSetFilterEffect } from './cmduser.js'

  import ControlsTrigger from './ControlsTrigger.svelte';

  export let track;
  export let layer;

  const seteffect = () => { userSetFilterEffect(track, layer); }

</script>

<div style="padding-left:5px;">
  <MediaQuery query="(max-width: 400px)" let:matches>
    {#if matches}
      <Row>
        <p style="font-size:.9em;">Filter Effect:</p>
      </Row>
    {/if}
  </MediaQuery>
  <Row>
    <MediaQuery query="(min-width: 401px)" let:matches>
      {#if matches}
        <p style="font-size:.9em; margin:7px 12px 0 0;">Filter Effect:</p>
      {/if}
    </MediaQuery>
    <Dropdown
      size="sm"
      type="inline"
      on:select={seteffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[layer].pluginIndex}
      bind:items={$aEffectsFilter}
    />
  </Row>

  <Row style="margin-top:-13px; margin-right:-10px; padding:5px;
              color: var(--color-textbox);
              background-color: var(--bg-color-textbox);">

    <p style="font-size:.9em;">
      {$aEffFilterDesc[$pStrand.tracks[track].layers[layer].pluginIndex]}
    </p>
  </Row>

  {#if ($pStrand.tracks[track].layers[layer].pluginIndex !== 0) }
    <ControlsTrigger {track} {layer} />
  {/if}
</div>
