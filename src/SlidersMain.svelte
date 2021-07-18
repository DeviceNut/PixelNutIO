<script>

  import {
    pStrand,
    maxPixels,
    mainEnabled,
    bitsEffects
  } from './globals.js';

  import {
    pluginBit_DELAY
  } from './presets.js';

  import {
    userSetBright,
    userSetDelay,
    userSetRotate
  } from "./cmduser.js"

  import SliderVal from "./SliderVal.svelte"

</script>

<SliderVal name='Bright'
  onchange={userSetBright}
  bind:cur={$pStrand.pcentBright}
  disabled={!$mainEnabled}
/>

<SliderVal name='Delay&nbsp;'
  onchange={userSetDelay}
  bind:cur={$pStrand.msecsDelay}
  disabled={!$mainEnabled || !($bitsEffects & pluginBit_DELAY)}
  />

<SliderVal name='Rotate'
  onchange={userSetRotate}
  bind:cur={$pStrand.firstPixel}
  min={1}
  max={$maxPixels}
  disabled={!$mainEnabled}
/>
