<script>

  import {
    Checkbox,
    Dropdown
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    MAX_FORCE_VALUE
  } from './devcmds.js';

  import { pStrand } from './globals.js';

  import {
    pluginBit_REPTRIGS,
    pluginBit_TRIGFORCE
  } from './presets.js';

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
  } from './cmduser1.js';

  import SliderVal from './SliderVal.svelte';

  export let track;
  export let layer = DRAW_LAYER;

  const autoStart  = () => { userSetTrigStart(  track, layer); }
  const setMain    = () => { userSetTrigMain(   track, layer); }
  const setOnLayer = () => { userSetTrigLayer(  track, layer); }
  const setSource  = () => { userSetTrigSource( track, layer); }
  const setRepeat  = () => { userSetTrigRepeat( track, layer); }
  const setCount   = () => { userSetTrigCount(  track, layer); }
  const setForever = () => { userSetTrigForever(track, layer); }
  const setOffset  = () => { userSetTrigOffset( track, layer); }
  const setRange   = () => { userSetTrigRange(  track, layer); }
  const setFtype   = () => { userSetForceType(  track, layer); }
  const setFvalue  = () => { userSetForceValue( track, layer); }

</script>

<div style="margin:5px 0 10px -10px; padding:0 5px 10px;
            background-color: var(--bg-color-controls-area);">

  <p style="padding:10px 0 10px 3px; font-size:.9em;">
    Triggering Options:</p>

  <Checkbox labelText="Once at start"
    style="padding:3px;"
    on:check={autoStart}
    bind:checked={$pStrand.tracks[track].layers[layer].trigAtStart}
  />
  {#if !$pStrand.tracks[track].layers[layer].trigAtStart ||
        ($pStrand.tracks[track].layers[layer].pluginBits & pluginBit_REPTRIGS) }
    <Checkbox labelText="From main controls"
      style="padding:3px;"
      on:check={setMain}
      bind:checked={$pStrand.tracks[track].layers[layer].trigFromMain}
    />
    {#if (($pStrand.trigSources).length > 1) }
      <Checkbox labelText="From other effect"
        style="padding:3px;"
        on:check={setOnLayer}
        bind:checked={$pStrand.tracks[track].layers[layer].trigOnLayer}
      />
      {#if $pStrand.tracks[track].layers[layer].trigOnLayer }
        <Dropdown
          style="margin-bottom:10px;"
          on:select={setSource}
          bind:selectedIndex={$pStrand.tracks[track].layers[layer].trigSrcListDex}
          bind:items={$pStrand.trigSources}
        />
      {/if}
    {/if}
    <Checkbox labelText="Auto generated"
      style="padding:3px;"
      on:check={setRepeat}
      bind:checked={$pStrand.tracks[track].layers[layer].trigDoRepeat}
    />
    {#if ($pStrand.tracks[track].layers[layer].trigDoRepeat) }
      <div style="margin:12px 15px 0 15px;">
        {#if ($pStrand.tracks[track].layers[layer].pluginBits & pluginBit_REPTRIGS) }
          <span style="margin-right:9px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
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
          <span style="margin-right:8px">Minimum Time:&nbsp;</span>
          <input type="number"
            min=1 max=9999
            on:change={setOffset}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepOffset}
          />&nbsp;&nbsp;secs
        </div>
        <div style="margin-top:8px; margin-bottom:10px;">
          <span style="margin-right:8px">Random Period:</span>
          <input type="number"
            min=0 max=9999
            on:change={setRange}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepRange}
          />&nbsp;&nbsp;secs
        </div>
      </div>
    {/if}
  {/if}

  {#if ($pStrand.tracks[track].layers[layer].pluginBits & pluginBit_TRIGFORCE) &&
        ($pStrand.tracks[track].layers[layer].trigAtStart ||
        $pStrand.tracks[track].layers[layer].trigDoRepeat) }

    <p style="padding:13px 0 5px 5px; font-size:.9em;">
      Triggering Force:</p>

    <Checkbox labelText="Random force"
      style="margin-left:5px; margin-top:10px;"
      on:check={setFtype}
      bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
    />
    <div style="margin-left:10px; margin-top:-5px;">
      <SliderVal name='Force:'
        max={MAX_FORCE_VALUE}
        onchange={setFvalue}
        bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
        disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
      />
    </div>
  {/if}

</div>
