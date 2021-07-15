<script>

  import {
    Row,
    Checkbox, Dropdown,
    RadioButtonGroup, RadioButton,
  }
  from "carbon-components-svelte";

  import {
    nTracks, tLayers,
    pStrand, aEffectsFilter
  } from './globals.js'

  import { MAX_FORCE } from "./pixelnut.js";

  import {
    userSetFilterEffect,
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
  export let layer;

  const seteffect = () => { userSetFilterEffect(track, layer); }
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
      bind:selectedIndex={$pStrand.tracks[track].layers[layer].pluginIndex}
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
    <Checkbox labelText="Trigger from Track/Layer:"
      style="display:inline-block;"
      on:check={setlayer}
      bind:checked={$pStrand.tracks[track].layers[layer].trigDoLayer}
    />
    <input type="number"
      style="margin-left: 5px;"
      min="1" max={$nTracks}
      on:change={settnums}
      bind:value={$pStrand.tracks[track].layers[layer].trigTrackNum}
      disabled={!$pStrand.tracks[track].layers[layer].trigDoLayer}
    />
    <input type="number"
      style="margin-left: 5px;"
      min="1" max={$tLayers}
      on:change={settnums}
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
        on:change={setcount}
        bind:value={$pStrand.tracks[track].layers[layer].trigRepCount}
        disabled={disable_repcount}
      />
      <Checkbox labelText="Forever"
        style="display:inline-block; margin-left: 5px;"
        on:check={setrandom}
        bind:checked={$pStrand.tracks[track].layers[layer].trigDoRepeat}
        disabled={disable_ttype}
      />
    </div>
    <div style="margin-top:8px; ">
      <span style="margin-right:8px">Minimum Time:&nbsp;</span>
      <input type="number"
        min="1" max="9999"
        on:change={setdmin}
        bind:value={$pStrand.tracks[track].layers[layer].trigDelayMin}
        disabled={disable_ttype}
      />&nbsp;&nbsp;secs
    </div>
    <div style="margin-top:8px; ">
      <span style="margin-right:8px">Random Period:</span>
      <input type="number"
        min="0" max="9999"
        on:change={setdrange}
        bind:value={$pStrand.tracks[track].layers[layer].trigDelayRange}
        disabled={disable_ttype}
      />&nbsp;&nbsp;secs
    </div>
  </div>
</div>

<p style="margin-top: 13px;">Trigger Force:</p>
<div style="margin-top: 8px; padding: 5px 0 5px 5px; background-color: #222322;">

  <Checkbox labelText="Random Value"
    on:check={setftype}
    bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
  />
  <SliderVal name='Fixed Value:'
    max={MAX_FORCE}
    onchange={setfvalue}
    bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
    disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
  />
</div>
