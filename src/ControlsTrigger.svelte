<script>

  import {
    Checkbox,
    RadioButton,
    RadioButtonGroup
  } from "carbon-components-svelte";

  import {
    nTracks,
    tLayers,
    pStrand
  } from './globals.js'

  import {
    DRAW_LAYER,
    MAX_FORCE
  } from "./pixelnut.js";

  import {
    pluginBit_TRIGGER,
    pluginBit_TRIGFORCE
  } from './presets.js';

  import {
    userSetTrigManual,
    userSetTrigLayer,
    userSetTrigNums,
    userSetTrigType,
    userSetTrigRandom,
    userSetTrigCount,
    userSetTrigDmin,
    userSetTrigDrange,
    userSetForceType,
    userSetForceValue
  } from "./cmduser.js"

  import SliderVal from "./SliderVal.svelte"

  export let track;
  export let layer = DRAW_LAYER;
  export let pbits;

  const setmanual = () => { userSetTrigManual(track, layer); }
  const setlayer  = () => { userSetTrigLayer(track, layer); }
  const settnums  = () => { userSetTrigNums(track, layer); }

  $: {
    let tracknum = $pStrand.tracks[track].layers[layer].trigTrackNum;
    let layernum = $pStrand.tracks[track].layers[layer].trigLayerNum;
    let resend = false;

    // keep track/layer values valid

    if (tracknum > $pStrand.tactives)
    {
      $pStrand.tracks[track].layers[layer].trigTrackNum = $pStrand.tactives;
      resend = true;
    }

    if (layernum > $pStrand.tracks[track].lactives)
    {
      $pStrand.tracks[track].layers[layer].trigLayerNum = $pStrand.tracks[track].lactives;
      resend = true;
    }

    if (resend) userSetTrigLayer(track, layer);
  }

  let opc = '';
  let disable_ttype = false;
  $: {
    if ($pStrand.tracks[track].layers[layer].trigTypeStr == "auto")
    {
      opc = 1;
      disable_ttype = false;
    }
    else
    {
      opc = 0.2;
      disable_ttype = true;
    }
  }

  let disable_repcount = false;
  $: disable_repcount = (disable_ttype || $pStrand.tracks[track].layers[layer].trigDoRepeat);

  const settype   = () => { userSetTrigType(track, layer); }
  const setrandom = () => { userSetTrigRandom(track, layer); }
  const setcount  = () => { userSetTrigCount(track, layer); }
  const setdmin   = () => { userSetTrigDmin(track, layer); }
  const setdrange = () => { userSetTrigDrange(track, layer); }
  const setftype  = () => { userSetForceType(track, layer); }
  const setfvalue = () => { userSetForceValue(track, layer); }

</script>

{#if (pbits & pluginBit_TRIGGER) }

  <div style="margin:10px -10px 10px -15px; padding-top:2px; background-color:#333433;"/>

  <div style="margin-left:-10px; margin-right:-10px;">
    <p style="margin-top:3px; font-size:.9em;">External Triggering:</p>
    <div style="margin-top:5px; padding:5px; background-color:#222322;">

      <Checkbox labelText="Allow manual trigger"
        style="padding: 3px;"
        on:check={setmanual}
        bind:checked={$pStrand.tracks[track].layers[layer].trigDoManual}
      />

      <div style="margin-bottom: 7px; padding: 3px;">
        <Checkbox labelText="Trigger from Track/Layer:"
          style="display:inline-block;"
          on:check={setlayer}
          bind:checked={$pStrand.tracks[track].layers[layer].trigDoLayer}
        />
        <input type="number"
          style="margin-left: 5px;"
          min=1 max={$nTracks}
          on:change={settnums}
          bind:value={$pStrand.tracks[track].layers[layer].trigTrackNum}
          disabled={!$pStrand.tracks[track].layers[layer].trigDoLayer}
        />
        <input type="number"
          style="margin-left: 5px;"
          min=1 max={$tLayers}
          on:change={settnums}
          bind:value={$pStrand.tracks[track].layers[layer].trigLayerNum}
          disabled={!$pStrand.tracks[track].layers[layer].trigDoLayer}
        />
      </div>
    </div>
  </div>

  <div style="margin-left:-10px; margin-right:-10px;">
    <p style="margin-top:3px; font-size:.9em;">Internal Triggering:</p>
    <div style="margin-top:5px; padding:5px; background-color:#222322;">
      <RadioButtonGroup
        labelPosition="left"
        on:change={settype}
        bind:selected={$pStrand.tracks[track].layers[layer].trigTypeStr}
        >
        <RadioButton labelText="None" value="none" />
        <RadioButton labelText="Once" value="once" />
        <RadioButton labelText="Auto" value="auto" />
      </RadioButtonGroup>

      <div style="margin:0 15px 0 15px; opacity:{opc};">
        <div style="margin-top:12px; ">
          <span style="margin-right:9px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
          <input type="number"
            min=1 max=9999
            on:change={setcount}
            bind:value={$pStrand.tracks[track].layers[layer].trigRepCount}
            disabled={disable_repcount}
          />
          <Checkbox labelText="Forever"
            style="display:inline-block; margin-left:5px;"
            on:check={setrandom}
            bind:checked={$pStrand.tracks[track].layers[layer].trigDoRepeat}
            disabled={disable_ttype}
          />
        </div>
        <div style="margin-top:8px; ">
          <span style="margin-right:8px">Minimum Time:&nbsp;</span>
          <input type="number"
            min=1 max=9999
            on:change={setdmin}
            bind:value={$pStrand.tracks[track].layers[layer].trigDelayMin}
            disabled={disable_ttype}
          />&nbsp;&nbsp;secs
        </div>
        <div style="margin-top:8px; ">
          <span style="margin-right:8px">Random Period:</span>
          <input type="number"
            min=0 max=9999
            on:change={setdrange}
            bind:value={$pStrand.tracks[track].layers[layer].trigDelayRange}
            disabled={disable_ttype}
          />&nbsp;&nbsp;secs
        </div>
      </div>
    </div>
  </div>

  {#if (pbits & pluginBit_TRIGFORCE) }

    <div style="margin-left:-10px; margin-right:-10px;">
      <p style="margin-top:3px; font-size:.9em;">Trigger Force:</p>
      <div style="margin-top:5px; padding:5px; background-color:#222322;">

        <Checkbox labelText="Random"
          on:check={setftype}
          bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
        />
        <SliderVal name='Fixed:'
          max={MAX_FORCE}
          onchange={setfvalue}
          bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
          disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
        />
      </div>
    </div>
  {/if}

{/if}
