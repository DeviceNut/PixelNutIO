<script>

  import { Checkbox } from 'carbon-components-svelte';

  import {
    overBit_DegreeHue,
    overBit_PcentWhite,
    overBit_PcentCount,
  } from './devcmds.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT
  } from './presets.js';

  import { pStrand } from './globals.js';

  import {
    userSetOverMode,
    userSetProps
  } from './cmduser1.js';
  
  import SliderVal from './SliderVal.svelte';

  let bgc = '';
  $: bgc = $pStrand.doOverride ? '#222' : '#111';
  // cannot use css vars here, and style cannot access globals

</script>

<div style="margin-top:15px; max-width:290px;
            padding:10px; 0 3px 12px;
            background-color: {bgc};">

  <Checkbox labelText="Override Track Properties"
    on:check={userSetOverMode}
    bind:checked={$pStrand.doOverride}
    disabled={$pStrand.bitsOverride === 0}
  />

  <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.degreeHue}
    disabled={!$pStrand.doOverride                          ||
              !($pStrand.bitsOverride & overBit_DegreeHue)  ||
              !($pStrand.bitsEffects  & pluginBit_COLOR)}
    max={359}
  />
  <SliderVal name='White&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.pcentWhite}
    disabled={!$pStrand.doOverride                          ||
              !($pStrand.bitsOverride & overBit_PcentWhite) ||
              !($pStrand.bitsEffects  & pluginBit_COLOR)}
  />
  <SliderVal name='Count&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.pcentCount}
    disabled={!$pStrand.doOverride                          ||
              !($pStrand.bitsOverride & overBit_PcentCount) ||
              !($pStrand.bitsEffects  & pluginBit_COUNT)}
  />
</div>
