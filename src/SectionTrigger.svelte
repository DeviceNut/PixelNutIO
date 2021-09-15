<script>

  import {
    Row,
    Checkbox,
    Dropdown,
    RadioButton,
    RadioButtonGroup
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
    pluginBit_TRIGGER,
    pluginBit_TRIGFORCE
  } from './presets.js';

  import {
    userSetTrigStart,
    userSetTrigMain,
    userSetTrigLayer,
    userSetTrigNums,
    userSetTrigType,
    userSetTrigRandom,
    userSetTrigCount,
    userSetTrigDmin,
    userSetTrigDrange,
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

  const setEnable = () =>
  {
    if (setNums()) userSetTrigLayer(track, layer);
  }

  const setLayer = () =>
  {
    if (setNums()) userSetTrigNums(track, layer);
  }

  $: {
    // make sure there's at least one entry
    if ($aTriggers.length < 1) makeTrigSourceList();
  }

  const setType   = () => { userSetTrigType(track, layer); }
  const setRandom = () => { userSetTrigRandom(track, layer); }
  const setCount  = () => { userSetTrigCount(track, layer); }
  const setDmin   = () => { userSetTrigDmin(track, layer); }
  const setDrange = () => { userSetTrigDrange(track, layer); }
  const setFtype  = () => { userSetForceType(track, layer); }
  const setFvalue = () => { userSetForceValue(track, layer); }
  
  const autoStart = () =>
  {
    if ($pStrand.tracks[track].layers[layer].trigAutoStart)
        $pStrand.tracks[track].layers[layer].trigFromMain = false;

    userSetTrigStart(track, layer);
  }

  const setMain = () =>
  {
    if ($pStrand.tracks[track].layers[layer].trigFromMain)
        $pStrand.tracks[track].layers[layer].trigAutoStart = false;

    userSetTrigMain(track, layer);
  }

</script>

{#if ($pStrand.tracks[track].layers[layer].pluginBits & pluginBit_TRIGGER) }

  <div style="margin:10px -10px 10px -15px; padding-top:2px;
              background-color: var(--bg-color-divider);"/>

  <div style="margin-left:-10px; margin-right:-10px;">
    <p style="margin-top:3px; font-size:.9em;">External Triggering:</p>
    <div style="margin-top:5px; padding:5px;
                background-color: var(--bg-color-controls-area);">

      <Checkbox labelText="Trigger from main controls"
        style="padding:3px;"
        on:check={setMain}
        bind:checked={$pStrand.tracks[track].layers[layer].trigFromMain}
      />

      <div style="margin-bottom:7px; padding:3px;">
        <Checkbox labelText="Trigger from Track/Layer"
          style="display:inline-block;"
          on:check={setEnable}
          bind:checked={$pStrand.tracks[track].layers[layer].trigDoLayer}
        />
        {#if $pStrand.tracks[track].layers[layer].trigDoLayer }
          <Dropdown
            on:select={setLayer}
            bind:selectedIndex={$pStrand.tracks[track].layers[layer].trigListDex}
            bind:items={$aTriggers}
          />
        {/if}
      </div>
    </div>
  </div>

  <div style="margin-left:-10px; margin-right:-10px;">
    <p style="margin-top:3px; font-size:.9em;">Internal Triggering:</p>
    <div style="margin-top:5px; padding:5px;
                background-color: var(--bg-color-controls-area);">

      <RadioButtonGroup
        labelPosition="left"
        on:change={setType}
        bind:selected={$pStrand.tracks[track].layers[layer].trigTypeStr}
        >
        <RadioButton labelText="None" value="none" />
        <RadioButton labelText="Once" value="once" />
        <RadioButton labelText="Auto" value="auto" />
      </RadioButtonGroup>

      {#if ($pStrand.tracks[track].layers[layer].trigTypeStr === "auto") }
        <div style="margin:12px 15px 0 15px;">
          <span style="margin-right:9px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
          <input type="number"
            min=1 max=9999
            on:change={setCount}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepCount}
            disabled={$pStrand.tracks[track].layers[layer].trigDoRepeat}
          />
          <Checkbox labelText="Forever"
            style="display:inline-block; margin-left:5px;"
            on:check={setRandom}
            bind:checked={$pStrand.tracks[track].layers[layer].trigDoRepeat}
          />
          <div style="margin-top:8px; ">
            <span style="margin-right:8px">Minimum Time:&nbsp;</span>
            <input type="number"
              min=1 max=9999
              on:change={setDmin}
              bind:value={$pStrand.tracks[track].layers[layer].trigDelayMin}
            />&nbsp;&nbsp;secs
          </div>
          <div style="margin-top:8px; ">
            <span style="margin-right:8px">Random Period:</span>
            <input type="number"
              min=0 max=9999
              on:change={setDrange}
              bind:value={$pStrand.tracks[track].layers[layer].trigDelayRange}
            />&nbsp;&nbsp;secs
          </div>
        </div>
      {/if}

      {#if ($pStrand.tracks[track].layers[layer].pluginBits & pluginBit_TRIGFORCE) }

      <div style="margin-top:10px; padding-top:1px; background-color: var(--bg-color-divider);"/>

        <p style="margin:10px 0 10px 0; font-size:.9em;">Trigger Force:</p>
        <Checkbox labelText="Random"
          on:check={setFtype}
          bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
        />
        <SliderVal name='Fixed:'
          max={MAX_FORCE_VALUE}
          onchange={setFvalue}
          bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
          disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
        />
      {/if}
    </div>
  </div>

{:else}
  <div style="margin:7px 0 0 -13px; padding:5px 0 5px 5px;
              background-color: var(--bg-color-controls-area);">

    <Row style="margin:0;">
      <Checkbox labelText="Trigger once at start"
        style="padding: 3px;"
        on:check={autoStart}
        bind:checked={$pStrand.tracks[track].layers[layer].trigAutoStart}
      />
    </Row>
    <Row style="margin:0;">
      <Checkbox labelText="Trigger from main controls"
        style="padding: 3px;"
        on:check={setMain}
        bind:checked={$pStrand.tracks[track].layers[layer].trigFromMain}
      />
    </Row>
  </div>
{/if}
