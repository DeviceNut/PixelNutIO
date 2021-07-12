<script>

  import {
    cmdStr_SetBright,
    cmdStr_SetDelay,
    cmdStr_SetFirst,
    sendCmd
  } from "./patterns.js"

  import { maxPixels } from './globals.js'

  import SliderVal from "./SliderVal.svelte"

  let bright = 80;
  let delay = 50;
  let firstpos = 0;

  let setBright = () => { sendCmd(cmdStr_SetBright, bright); }
  let setDelay  = () => { sendCmd(cmdStr_SetDelay,  delay); }
  let setFirstP = () => { sendCmd(cmdStr_SetFirst,  firstpos); }

</script>

<SliderVal name='Bright'      onchange={setBright} bind:cur={bright} />
<SliderVal name='Delay&nbsp;' onchange={setDelay}  bind:cur={delay} />
<SliderVal name='Rotate'      onchange={setFirstP} bind:cur={firstpos} min={1} max={$maxPixels} />
