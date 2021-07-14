<script>

  import {
    Row,
    Button, Checkbox, Dropdown,
    RadioButtonGroup, RadioButton,
  }
  from "carbon-components-svelte";

  import { aEffectsPre } from './globals.js'
  import SliderVal from "./SliderVal.svelte"

  export let tracknum = 0;
  export let layernum = 0;

  let trigtype = "once";
  let repcount = 1;
  let mintime = 1;
  let rantime = 0;
  let ranforce = false;

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
  <p style="margin: 7px 12px 0 0;">Choose Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      selectedIndex={0}
      bind:items={$aEffectsPre}
    />
  </div>
</Row>

<RadioButtonGroup
  orientation="vertical"
  legendText="Trigger Settings"
  bind:selected={trigtype}
  on:change={dotrigtype}
  >
  <RadioButton labelText="Once at startup" value="once" />
  <RadioButton labelText="Automatically" value="auto" />
  <RadioButton labelText="Manually" value="ext" />
  <RadioButton labelText="From Layer" value="layer" />
</RadioButtonGroup>

{#if (trigtype == "auto") }
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
{/if}

<div style="margin-top:22px;"></div>
<Checkbox
  labelText="Random Force"
  bind:checked={ranforce}
/>

<SliderVal disabled={ranforce} name='Force&nbsp;' />
