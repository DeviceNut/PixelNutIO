<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import { cmdSetProps } from "./commands.js"
  import SliderVal from "./SliderVal.svelte"

  // setprops is called with mouse event
  const setprops = ()=> { cmdSetProps(); }
  const docheck = ()=>
  {
    // if turning ON the override send the props
    // (doOverride value here is before the toggle)
    if (!$pStrand.doOverride) cmdSetProps();
  }

  let bgc = '';
  $: bgc = $pStrand.doOverride ? '#222322' : '#111211'

</script>

<Row style="margin-top: 10px; margin-bottom: 10px;">
  <!-- max-wdith prevents putting second col on separate line >670px for some reason -->
  <Column style="background-color: {bgc}; margin-left: 13px; max-width:350px">

    <SliderVal
      name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.degreeHue}
      disabled={!$pStrand.doOverride}
      max={359}
    />

    <SliderVal
      name='White&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentWhite}
      disabled={!$pStrand.doOverride}
    />

    <SliderVal
      name='Count&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.percentPixs}
      disabled={!$pStrand.doOverride}
    />

  </Column>
  <Column>
    <Checkbox
      labelText="Override"
      bind:checked={$pStrand.doOverride}
      on:change={docheck}
    />
  </Column>
</Row>
