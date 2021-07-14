<script>

  import {
    Row,
    Checkbox, Dropdown,
    RadioButtonGroup, RadioButton,
  }
  from "carbon-components-svelte";

  import { pStrand, aEffectsFilter, tLayers } from './globals.js'
  import {
    MAX_FORCE,
    cmdSetFilterEffect,
    cmdSetTrigManual,
    cmdSetTrigLayer,
    cmdSetTrigType,
    cmdSetTrigCount,
    cmdSetTrigDmin,
    cmdSetTrigDrange,
    cmdSetForceValue
  } from "./commands.js"

  import SliderVal from "./SliderVal.svelte"

  export let track = 0;
  export let layer = 0;

  const seteffect = () => { cmdSetFilterEffect(track, layer); }
  const setmanual = () => { cmdSetTrigManual(track, layer); }
  const setlayer  = () => { cmdSetTrigLayer(track, layer); }

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

  const settype   = () => { cmdSetTrigType(track, layer); }
  const setcount  = () => { cmdSetTrigCount(track, layer); }
  const setdmin   = () => { cmdSetTrigDmin(track, layer); }
  const setdrange = () => { cmdSetTrigDrange(track, layer); }
  const setforce  = () => { cmdSetForceValue(track, layer); }

  // BUG: RadioButton on:click doesn't work?!
  // also on:click for RadioButtonGroup happens twice?
  // and when it does 'selected' hasn't changed yet
  // solution: use on:change with RadioButtonGroup

</script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Filter Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      on:select={seteffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[layer].pluginID}
      bind:items={$aEffectsFilter}
    />
  </div>
</Row>

<p style="margin-top: 12px;">Trigger Controls:</p>
<div style="margin-top: 8px; padding: 5px 0 13px 5px; background-color: #222322;">

  <Checkbox labelText="Allow manual trigger"
    style="padding: 3px;"
    on:check={setmanual}
    bind:checked={$pStrand.tracks[track].layers[layer].trigDoManual}
  />

  <div style="margin-bottom: 7px; padding: 3px;">
    <Checkbox labelText="Trigger from Layer:"
      style="display:inline-block; margin-right: 5px;"
      on:check={setlayer}
      bind:checked={$pStrand.tracks[track].layers[layer].trigDoLayer}
    />
    <input type="number"
      min="1" max={$tLayers}
      on:input={setlayer}
      bind:value={$pStrand.tracks[track].layers[layer].trigLayerNum}
      disabled={!$pStrand.tracks[track].layers[layer].trigDoLayer}
    />
  </div>

  <RadioButtonGroup
    legendText="Internal triggering:"
    labelPosition="left"
    on:change={settype}
    bind:selected={$pStrand.tracks[track].layers[layer].trigTypeStr}
    >
    <RadioButton labelText="None" value="none" />
    <RadioButton labelText="Once" value="once" />
    <RadioButton labelText="Auto" value="auto" />
  </RadioButtonGroup>

  <div style="margin: 0 15px 0 15px; opacity: {opc};">
    <div style="margin-top:12px; ">
      <span style="margin-right:9px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
      <input type="number"
        min="1" max="9999"
        on:input={setcount}
        bind:value={$pStrand.tracks[track].layers[layer].trigRepCount}
        disabled={disable_repcount}
      />
      <Checkbox labelText="Forever"
        style="display:inline-block; margin-left: 5px;"
        on:check={setcount}
        bind:checked={$pStrand.tracks[track].layers[layer].trigDoRepeat}
        disabled={disable_ttype}
      />
    </div>
    <div style="margin-top:8px; ">
      <span style="margin-right:8px">Minimum Time:&nbsp;</span>
      <input type="number"
        min="1" max="9999"
        on:input={setdmin}
        bind:value={$pStrand.tracks[track].layers[layer].trigDelayMin}
        disabled={disable_ttype}
      />&nbsp;&nbsp;secs
    </div>
    <div style="margin-top:8px; ">
      <span style="margin-right:8px">Random Period:</span>
      <input type="number"
        min="1" max="9999"
        on:input={setdrange}
        bind:value={$pStrand.tracks[track].layers[layer].trigDelayRange}
        disabled={disable_ttype}
      />&nbsp;&nbsp;secs
    </div>
  </div>
</div>

<p style="margin-top: 13px;">Trigger Force:</p>
<div style="margin-top: 8px; padding: 5px 0 5px 5px; background-color: #222322;">

  <Checkbox labelText="Random Value"
    on:check={setforce}
    bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
  />
  <SliderVal name='Fixed Value:'
    max={MAX_FORCE}
    onchange={setforce}
    bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
    disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
  />
</div>
