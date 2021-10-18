<script>

  import {
    Checkbox,
    Dropdown
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    MAX_FORCE_VALUE
  } from './pixcmds.js';

  import {
    pStrand,
    aTriggers
  } from './globals.js';

  import {
    pluginBit_REPTRIGS,
    pluginBit_TRIGFORCE
  } from './presets.js';

  import {
    userSetTrigStart,
    userSetTrigMain,
    userSetTrigLayer,
    userSetTrigNums,
    userSetTrigRepeat,
    userSetTrigCount,
    userSetTrigForever,
    userSetTrigOffset,
    userSetTrigRange,
    userSetForceType,
    userSetForceValue
  } from './cmduser.js';

  import { makeTrigSourceList } from './cmdmake.js';

  import SliderVal from './SliderVal.svelte';

  export let track;
  export let layer = DRAW_LAYER;

  function setNums()
  {
    let item = $aTriggers[$pStrand.tracks[track].layers[layer].trigListDex];
    if (item.id > 0)
    {
      $pStrand.tracks[track].layers[layer].trigTrackNum = item.tnum;
      $pStrand.tracks[track].layers[layer].trigLayerNum = item.lnum;
      return true;
    }
    return false;
  }

  const setOnLayer = () =>
  {
    if (setNums()) userSetTrigLayer(track, layer);
  }

  const setLayerNums = () =>
  {
    if (setNums()) userSetTrigNums(track, layer);
  }

  $: {
    // make sure there's at least one entry
    if ($aTriggers.length < 1) makeTrigSourceList();
  }

  const autoStart  = () => { userSetTrigStart(  track, layer); }
  const setMain    = () => { userSetTrigMain(   track, layer); }
  const setRepeat  = () => { userSetTrigRepeat( track, layer); }
  const setCount   = () => { userSetTrigCount(  track, layer); }
  const setForever = () => { userSetTrigForever(track, layer); }
  const setOffset  = () => { userSetTrigOffset( track, layer); }
  const setRange   = () => { userSetTrigRange(  track, layer); }
  const setFtype   = () => { userSetForceType(  track, layer); }
  const setFvalue  = () => { userSetForceValue( track, layer); }

  let helpon = false;
  let trigon = false;

</script>

<div style="margin:5px 0 13px -10px;
            padding-top:13px; padding-bottom:5px;
            background-color: var(--bg-color-controls-area);">

  <div style="margin-bottom:15px;">
    <button
      style="margin-left:10px;"
      class="button-help"
      on:click={() => {helpon = !helpon;}}
      >?
    </button>
    <button
      style="margin-left:15px;"
      class="button-restart"
      on:click={() => {trigon = !trigon;}}
      >Triggering Options
    </button>

    {#if helpon }
        <div style="margin:15px 10px 0 10px; padding:5px;
                    color: var(--color-textbox);
                    background-color: var(--bg-color-textbox);">
          <p style="font-size:.9em;">
            Explain how triggering works.
          </p>
        </div>
    {/if}
  </div>

  {#if trigon }
    <div style="margin-left:8px;">
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
        {#if (($aTriggers).length > 0) }
          <Checkbox labelText="From other effect"
            style="padding:3px;"
            on:check={setOnLayer}
            bind:checked={$pStrand.tracks[track].layers[layer].trigOnLayer}
          />
          {#if $pStrand.tracks[track].layers[layer].trigOnLayer }
            <Dropdown
              style="margin-bottom:10px;"
              on:select={setLayerNums}
              bind:selectedIndex={$pStrand.tracks[track].layers[layer].trigListDex}
              bind:items={$aTriggers}
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
                value={$pStrand.tracks[track].layers[layer].trigRepRange}
              />&nbsp;&nbsp;secs
            </div>
          </div>
        {/if}
      {/if}
      {#if ($pStrand.tracks[track].layers[layer].pluginBits & pluginBit_TRIGFORCE) &&
          ($pStrand.tracks[track].layers[layer].trigAtStart  ||
            $pStrand.tracks[track].layers[layer].trigDoRepeat) }
        <Checkbox labelText="Random force"
          style="padding:3px;"
          on:check={setFtype}
          bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
        />
        <div style="margin-left:7px; margin-top:-10px;">
          <SliderVal name='Force:'
            max={MAX_FORCE_VALUE}
            onchange={setFvalue}
            bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
            disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
          />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .button-trigger {
     height: 30px;
     margin-left: 15px;
     padding: 3px;
   }
  .button-help {
    font-size: .8em;
    width: 25px;
    height: 25px;
    padding: 3px;
    margin-left: 15px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
