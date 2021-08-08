<script>

  import { pStrand } from './globals.js';
  import { MAX_BYTE_VALUE } from './pixelnut.js';
  import { pluginBit_DELAY } from './presets.js';

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
  disabled={$pStrand.patternCmds === ''}
/>

<SliderVal name='Delay&nbsp;'
  onchange={userSetDelay}
  bind:cur={$pStrand.msecsDelay}
  max={MAX_BYTE_VALUE}
  disabled={($pStrand.patternCmds === '') ||
            !($pStrand.bitsEffects & pluginBit_DELAY)}
  />

<SliderVal name='Rotate'
  onchange={userSetRotate}
  bind:cur={$pStrand.firstPixel}
  min={1}
  max={$pStrand.numPixels}
  disabled={$pStrand.patternCmds === ''}
/>
