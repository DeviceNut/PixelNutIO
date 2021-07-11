<script>

  import {
    Button, Checkbox,
    RadioButtonGroup, RadioButton,
  }
  from "carbon-components-svelte";

  import EffectsPredraw from "./EffectsPredraw.svelte"
  import SliderVal from "./SliderVal.svelte"

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

<EffectsPredraw />

<RadioButtonGroup
  orientation="vertical"
  legendText="Trigger Settings"
  bind:selected={trigtype}
  on:change={dotrigtype}
  >
  <RadioButton labelText="Once at startup" value="once" />
  <RadioButton labelText="Automatically" value="auto" />
  <RadioButton labelText="External Source" value="ext" />
  <RadioButton labelText="From Layer" value="layer" />
</RadioButtonGroup>

{#if (trigtype == "auto") }
  <div style="margin-top:10px; ">
    <span style="margin-right:9px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
    <input type="number" min="1" max="9999" bind:value={repcount}/>
  </div>
  <div style="margin-top:10px; ">
    <span style="margin-right:8px">Minimum Time:&nbsp;</span>
    <input type="number" min="1" max="9999" bind:value={mintime}/>
  </div>
  <div style="margin-top:10px; ">
    <span style="margin-right:8px">Random Period:</span>
    <input type="number" min="1" max="9999" bind:value={rantime}/>
  </div>
  <div style="margin-top:-2px;"></div>
{/if}

<div style="margin-top: 22px;"></div>
<Checkbox labelText="Random Force" bind:checked={ranforce}></Checkbox>
<SliderVal disabled={ranforce} name='Force&nbsp;' />
<div style="margin-top:7px;"></div>
<Button
  size="small"
  kind="secondary"
  on:click={dotrigger}
  >Trigger
</Button>
