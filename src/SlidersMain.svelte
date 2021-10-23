<script>

  import { pStrand } from './globals.js';

  import {
    userSetBright,
    userSetDelay,
    userSetRotate
  } from './cmduser.js';

  import SliderVal from './SliderVal.svelte';

</script>

<SliderVal name='Bright'
  onchange={userSetBright}
  bind:cur={$pStrand.pcentBright}
/>

<SliderVal name='Delay&nbsp;'
  onchange={userSetDelay}
  bind:cur={$pStrand.pcentDelay}
  />

<SliderVal name='Rotate'
  onchange={userSetRotate}
  bind:cur={$pStrand.pixelOffset}
  min={0}
  max={$pStrand.numPixels-1}
/>
