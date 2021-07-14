<script>

  import {
    Row,
    Checkbox, Dropdown,
    RadioButtonGroup, RadioButton,
  }
  from "carbon-components-svelte";
  import { pStrand, aEffectsFilter, tLayers } from './globals.js'
  import { makeCmdStr } from "./patterns.js";
  import {
    MAX_FORCE,
    cmdSetTriggerExt,
  } from "./commands.js"
  import SliderVal from "./SliderVal.svelte"

  export let track = 0;
  export let layer = 0;

  let trigtype = "once";
  let repcount = 1;
  let mintime = 1;
  let rantime = 0;

  const newcmd = () => { makeCmdStr(track, layer); }

  const trigext = () => { cmdSetTriggerExt(track, layer); }
  const trigauto = () => {}

  let dolayer = false;
  let layernum = 0;
  const checklayer = () => {

  }
  let disabled = 0;
  $: disabled = (dolayer ? undefined : true);

  const setforce = () => {}
  const dotrigtype = () =>
  {
    console.log(`TrigType: type=${trigtype}`);
  }

  const dotrigger = () =>
  {
    console.log(`Trigger: type=${trigtype}`);
  }

  // BUG: RadioButton on:click doesn't work?!
  // also on:click for RadioButtonGroup happens twice?
  // and when it does 'selected' hasn't changed yet
  // solution: use on:change on RadioButtonGroup

</script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Filter Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      on:select={newcmd}
      bind:selectedIndex={$pStrand.tracks[track].layers[layer].pluginID}
      bind:items={$aEffectsFilter}
    />
  </div>
</Row>

<p style="margin-top: 12px;">Trigger Controls:</p>
<div style="margin-top: 8px; padding: 5px 0 15px 5px; background-color: #222322;">

  <Checkbox labelText="Allow manual trigger"
    style="padding: 3px;"
    on:check={trigext}
    bind:checked={$pStrand.tracks[track].layers[layer].externTrigs}
  />

  <div style="margin-bottom: 5px; padding: 3px;">
    <Checkbox labelText="Trigger from Layer:"
      style="display:inline-block; margin-right: 5px;"
      on:check={checklayer}
      bind:checked={dolayer}
    />
    <input
      {disabled}
      type="number" min="1" max={$tLayers}
      bind:value={layernum}
    />
  </div>

  <RadioButtonGroup
    on:change={dotrigtype}
    bind:selected={trigtype}
    >
    <RadioButton labelText="None" value="none" />
    <RadioButton labelText="Once" value="once" />
    <RadioButton labelText="Auto" value="auto" />
  </RadioButtonGroup>

  <div style="margin-top:10px; ">
    <span style="margin-right:9px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
    <input type="number" min="1" max="9999" bind:value={repcount}/>
  </div>
  <div style="margin-top:10px; ">
    <span style="margin-right:8px">Minimum Time:&nbsp;</span>
    <input type="number" min="1" max="9999" bind:value={mintime}/>&nbsp;&nbsp;secs
  </div>
  <div style="margin-top:10px; ">
    <span style="margin-right:8px">Random Period:</span>
    <input type="number" min="1" max="9999" bind:value={rantime}/>&nbsp;&nbsp;secs
  </div>
  <div style="margin-top:-2px;"></div>
</div>

<p style="margin-top: 13px;">Trigger Force:</p>
<div style="margin-top: 8px; padding: 5px 0 5px 5px; background-color: #222322;">

  <Checkbox labelText="Random Value"
    on:check={newcmd}
    bind:checked={$pStrand.tracks[track].layers[layer].forceRandom}
  />
  <SliderVal name='Fixed Value:'
    max={MAX_FORCE}
    onchange={setforce}
    bind:cur={$pStrand.tracks[track].layers[layer].forceValue}
    disabled={$pStrand.tracks[track].layers[layer].forceRandom} 
  />
</div>
