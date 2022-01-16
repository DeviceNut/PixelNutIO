<script>

  import {
    Checkbox,
    Dropdown
  } from "carbon-components-svelte";

  import {
    pStrand,
    allowUpdates
   } from './globals.js';

  import {
    DRAW_LAYER,
    MAX_FORCE_VALUE,
    pluginBit_REPTRIGS,
    pluginBit_TRIGFORCE
  } from './devcmds.js';

  import {
    userSetTrigStart,
    userSetTrigMain,
    userSetTrigLayer,
    userSetTrigSource,
    userSetTrigRepeat,
    userSetTrigCount,
    userSetTrigForever,
    userSetTrigOffset,
    userSetTrigRange,
    userSetForceType,
    userSetForceValue
  } from './cmdtrig.js';

  import SliderVal from './SliderVal.svelte';

  export let track;
  export let layer = DRAW_LAYER;

  const autoStart  = () => { if ($allowUpdates) userSetTrigStart(  track, layer); }
  const setMain    = () => { if ($allowUpdates) userSetTrigMain(   track, layer); }
  const setOnLayer = () => { if ($allowUpdates) userSetTrigLayer(  track, layer); }
  const setSource  = () => { if ($allowUpdates) userSetTrigSource( track, layer); }
  const setRepeat  = () => { if ($allowUpdates) userSetTrigRepeat( track, layer); }
  const setCount   = () => { if ($allowUpdates) userSetTrigCount(  track, layer); }
  const setForever = () => { if ($allowUpdates) userSetTrigForever(track, layer); }
  const setOffset  = () => { if ($allowUpdates) userSetTrigOffset( track, layer); }
  const setRange   = () => { if ($allowUpdates) userSetTrigRange(  track, layer); }
  const setFtype   = () => { if ($allowUpdates) userSetForceType(  track, layer); }
  const setFvalue  = () => { if ($allowUpdates) userSetForceValue( track, layer); }

</script>

<div class="area">
  <p class="options">Triggering Options:</p>

  <Checkbox labelText="Once at start"
    style="margin-top:10px;"
    on:check={autoStart}
    bind:checked={$pStrand.tracks[track].layers[layer].trigAtStart}
  />
  {#if !$pStrand.tracks[track].layers[layer].trigAtStart ||
        ($pStrand.tracks[track].layers[layer].pluginObj.bits & pluginBit_REPTRIGS) }
    <Checkbox labelText="From main controls"
      style="margin-top:10px;"
      on:check={setMain}
      bind:checked={$pStrand.tracks[track].layers[layer].trigFromMain}
    />
    {#if (($pStrand.trigSources).length > 1) }
      <Checkbox labelText="From other effect"
        style="margin-top:10px;"
        on:check={setOnLayer}
        bind:checked={$pStrand.tracks[track].layers[layer].trigOnLayerShow}
      />
      {#if $pStrand.tracks[track].layers[layer].trigOnLayerShow }
        <Dropdown
          style="margin-bottom:10px;"
          on:select={setSource}
          bind:selectedIndex={$pStrand.tracks[track].layers[layer].trigSrcListDex}
          bind:items={$pStrand.trigSources}
        />
      {/if}
    {/if}
    <Checkbox labelText="Auto generated"
      style="margin-top:10px;"
      on:check={setRepeat}
      bind:checked={$pStrand.tracks[track].layers[layer].trigDoRepeat}
    />
    {#if ($pStrand.tracks[track].layers[layer].trigDoRepeat) }
      <div style="margin:12px 15px 0 15px;">
        {#if ($pStrand.tracks[track].layers[layer].pluginObj.bits & pluginBit_REPTRIGS) }
          <span class="inval">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
          <input type="number"
            min=1 max=9999
            on:change={setCount}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepCount}
            disabled={$pStrand.tracks[track].layers[layer].trigForever}
          />
          <Checkbox labelText="Forever"
            style="display:inline-block; margin-left:5px;"
            on:check={setForever}
            bind:checked={$pStrand.tracks[track].layers[layer].trigForever}
          />
        {/if}
        <div style="margin-top:8px;">
          <span class="inval">Minimum Time:&nbsp;</span>
          <input type="number"
            min=1 max=9999
            on:change={setOffset}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepOffset}
          />&nbsp;&nbsp;secs
        </div>
        <div style="margin-top:8px; margin-bottom:10px;">
          <span class="inval">Random Period:</span>
          <input type="number"
            min=0 max=9999
            on:change={setRange}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepRange}
          />&nbsp;&nbsp;secs
        </div>
      </div>
    {/if}
  {/if}

  {#if ($pStrand.tracks[track].layers[layer].pluginObj.bits & pluginBit_TRIGFORCE) &&
       ($pStrand.tracks[track].layers[layer].trigAtStart ||
        $pStrand.tracks[track].layers[layer].trigDoRepeat) }

    <p style="margin-top:15px; font-size:.9em;">
      Triggering Force:</p>

    <Checkbox labelText="Random force"
      style="margin-top:15px;"
      on:check={setFtype}
      bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
    />
    <SliderVal name='Force:'
      max={MAX_FORCE_VALUE}
      onchange={setFvalue}
      bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
      disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
    />
  {/if}

</div>

<style>
  .area {
    margin: 10px -5px 10px -5px;
    padding: 7px 0 10px 10px;
    background-color: var(--bgc-controls-area);
  }
  .options {
    margin-top: 10px;
    margin-bottom: 15px;
    font-size:.9em;
  }
  .inval {
    margin-right: 8px;
  }
</style>