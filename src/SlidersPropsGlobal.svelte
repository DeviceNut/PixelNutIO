<script>

  import {
    Row, Column,
    Checkbox
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    overBits_DegreeHue,
    overBits_PcentWhite,
    overBits_PcentCount,
  } from './pixelnut.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT
  } from "./presets.js";

  import {
    pStrand,
    bitsOverride,
    bitsEffects
  } from './globals.js';

  import {
    userSetOverMode,
    userSetProps
  } from "./cmduser.js"
  
  import SliderVal from "./SliderVal.svelte"

  // setprops is called with mouse event
  const setprops = ()=> { userSetProps(); }
  const docheck  = ()=> { userSetOverMode(); }

  let bgc = '';
  $: bgc = $pStrand.doOverride ? '#222322' : '#111211'

</script>

<Row style="margin-top: 15px; margin-bottom: 10px;">
  <Column style="background-color: {bgc}; margin-left: 13px;">

    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.degreeHue}
      disabled={!$pStrand.doOverride ||
                !($bitsOverride & overBits_DegreeHue) ||
                !($bitsEffects & pluginBit_COLOR)}
      max={359}
    />

    <SliderVal name='White&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentWhite}
      disabled={!$pStrand.doOverride ||
                !($bitsOverride & overBits_PcentWhite) ||
                !($bitsEffects & pluginBit_COLOR)}
    />

    <SliderVal name='Count&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentCount}
      disabled={!$pStrand.doOverride ||
                !($bitsOverride & overBits_PcentCount) ||
                !($bitsEffects & pluginBit_COUNT)}
    />

  </Column>
  <Column>
    <Checkbox labelText="Override"
      on:check={docheck}
      bind:checked={$pStrand.doOverride}
      disabled={$bitsOverride == 0}
    />
  </Column>
</Row>
