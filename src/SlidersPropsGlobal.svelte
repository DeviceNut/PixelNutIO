<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import { userSetOverMode, userSetProps } from "./cmduser.js"
  import SliderVal from "./SliderVal.svelte"

  // setprops is called with mouse event
  const setprops = ()=> { userSetProps(); }
  const docheck = ()=>
  {
    // value here is before the toggle
    let enable = !$pStrand.doOverride;

    userSetOverMode(enable);
    if (enable) userSetProps();
  }

  let bgc = '';
  $: bgc = $pStrand.doOverride ? '#222322' : '#111211'

</script>

<Row style="margin-top: 15px; margin-bottom: 10px;">
  <!-- max-wdith prevents putting Checkbox on separate line >670px for some reason -->
  <Column style="background-color: {bgc}; margin-left: 13px; max-width:350px">

    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.degreeHue}
      disabled={!$pStrand.doOverride}
      max={359}
    />

    <SliderVal name='White&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentWhite}
      disabled={!$pStrand.doOverride}
    />

    <SliderVal name='Count&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentCount}
      disabled={!$pStrand.doOverride}
    />

  </Column>
  <Column>
    <Checkbox labelText="Override"
      on:change={docheck}
      bind:checked={$pStrand.doOverride}
    />
  </Column>
</Row>
