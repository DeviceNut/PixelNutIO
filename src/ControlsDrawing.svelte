<script>

  import { Dropdown } from "carbon-components-svelte";

  import {
    cmdStr_SetBright,
    cmdStr_SetDelay,
    cmdStr_SetStart,
    cmdStr_SetFinish,
    sendCmd
  } from "./patterns.js"

  import { aEffectsDraw } from './globals.js'
  import SlidersProps from "./SlidersProps.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let tracknum = 0;
  export let layernum = 0;

  let extcontrol = false;

  let bright = 80;
  let delay = 50;
  let start = 0;
  let finish = 100;

  let setBright = () => { sendCmd(cmdStr_SetBright,   bright, tracknum, layernum); }
  let setDelay  = () => { sendCmd(cmdStr_SetDelay,    delay,  tracknum, layernum); }
  let setStart  = () => { sendCmd(cmdStr_SetStart,    start,  tracknum, layernum); }
  let setFinish = () => { sendCmd(cmdStr_SetFinish,   finish, tracknum, layernum); }

  </script>

<Dropdown
  type="inline"
  titleText="Effect:"
  selectedIndex={0}
  bind:items={$aEffectsDraw}
/>

<SliderVal name='Bright'      onchange={setBright} bind:cur={bright} />
<SliderVal name='Delay&nbsp;' onchange={setDelay}  bind:cur={delay} />

<SlidersProps {tracknum} {layernum} {extcontrol} />

<SliderVal name='Start&nbsp;' onchange={setStart}  bind:cur={start} />
<SliderVal name='Finish'      onchange={setFinish} bind:cur={finish} />
