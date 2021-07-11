<script>
  import {
    Row, Column,
    Button,
    RadioButtonGroup, RadioButton,
  }
  from "carbon-components-svelte";

  import EffectsPredraw from "./EffectsPredraw.svelte"
  import SliderVal from "./SliderVal.svelte"

  let trigtype = "once";
  let repcount = 1;
  let mintime = 1;
  let rantime = 0;

  const dotrigger = () =>
  {
    console.log(`Trigger: type=${trigtype}`);
  }

  //<NumberInput hideLabel bind:value={repcount} />

</script>

<EffectsPredraw />

<RadioButtonGroup
  orientation="vertical"
  legendText="Trigger Type"
  bind:selected={trigtype}
>
  <RadioButton labelText="Once at startup" value="once" />
  <RadioButton labelText="Automatically" value="auto" />
  <RadioButton labelText="External Source" value="ext" />
  <RadioButton labelText="From Layer" value="layer" />
</RadioButtonGroup>

{#if (trigtype == "auto") }
  <div style="margin-top:10px; ">
    <span style="margin-right:8px">Repeat Count:&nbsp;&nbsp;&nbsp;</span>
    <input type="number" min="1" max="9999" bind:value={repcount}/>
  </div>
  <div>
    <span style="margin-right:8px">Minimum Time:&nbsp;</span>
    <input type="number" min="1" max="9999" bind:value={mintime}/>
  </div>
  <div>
    <span style="margin-right:8px">Random Period:</span>
    <input type="number" min="1" max="9999" bind:value={rantime}/>
  </div>
  <div style="margin-top:-2px;"></div>
{/if}

<div style="margin-top:7px;"></div>
<Row>
  <Column style="background-color:green" sm={1} md={4} lg={8} >
    <SliderVal name='Force&nbsp;' />
  </Column>
  <Column  style="background-color:blue" sm={1} md={2} lg={2}>
    <Button size="small" kind="secondary" on:click={dotrigger}>Trigger</Button>
  </Column>
  <Column style="background-color:red" sm={1} md={1} lg={1}>
    <Button size="small" kind="secondary" on:click={dotrigger}>Trigger</Button>
  </Column>
  <Column style="background-color:pink" sm={1} md={1} lg={1}>
  </Column>
</Row>
<div style="margin-top:5px;"></div>
