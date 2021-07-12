<script>

  import { pStrand, maxPixels } from './globals.js';
  import { cmdSetBright, cmdSetDelay, cmdSetRotate } from "./commands.js"
  import SliderVal from "./SliderVal.svelte"

</script>

<SliderVal
  name='Bright'
  onchange={cmdSetBright}
  bind:cur={$pStrand.pcentBright}
/>

<SliderVal
  name='Delay&nbsp;'
  onchange={cmdSetDelay}
  bind:cur={$pStrand.msecsDelay}
/>

<SliderVal
  name='Rotate'
  onchange={cmdSetRotate}
  bind:cur={$pStrand.firstPixel}
  min={1}
  max={$maxPixels}
/>
