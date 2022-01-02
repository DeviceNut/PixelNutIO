<script>

  import { Checkbox } from 'carbon-components-svelte';

  import { pStrand } from './globals.js';

  import {
    overBit_DegreeHue,
    overBit_PcentWhite,
    overBit_PcentCount 
  } from './strands.js';

  import {
    MAX_HUE_VALUE,
    pluginBit_COLOR,
    pluginBit_COUNT
  } from './devcmds.js';

  import {
    userSetOverMode,
    userSetProps
  } from './cmduser1.js';
  
  import SliderVal from './SliderVal.svelte';

  let bgc = '';
  $: bgc = $pStrand.opropsUser.doEnable ? '#222' : '#111';
  // cannot use css vars here, and style cannot access globals

</script>

<div style="margin-top:15px; max-width:290px;
            padding:10px; 0 3px 12px;
            background-color: {bgc};">

  <Checkbox labelText="Override Track Properties"
    on:check={userSetOverMode}
    bind:checked={$pStrand.opropsUser.doEnable}
    disabled={$pStrand.bitsOverride === 0}
  />

  <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
    max={MAX_HUE_VALUE}
    onchange={userSetProps}
    bind:cur={$pStrand.valueHue}
    disabled={!$pStrand.opropsUser.doEnable                 ||
              !($pStrand.bitsOverride & overBit_DegreeHue)  ||
              !($pStrand.bitsEffects  & pluginBit_COLOR)}
  />
  <SliderVal name='White&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.pcentWhite}
    disabled={!$pStrand.opropsUser.doEnable                 ||
              !($pStrand.bitsOverride & overBit_PcentWhite) ||
              !($pStrand.bitsEffects  & pluginBit_COLOR)}
  />
  <SliderVal name='Count&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.pcentCount}
    disabled={!$pStrand.opropsUser.doEnable                 ||
              !($pStrand.bitsOverride & overBit_PcentCount) ||
              !($pStrand.bitsEffects  & pluginBit_COUNT)}
  />
</div>
