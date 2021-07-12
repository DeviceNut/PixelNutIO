<script>

  import { Dropdown } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import { cmdSetBright, cmdSetDelay, cmdSetStart, cmdSetFinish } from "./commands.js"
  import { aEffectsDraw } from './globals.js'
  import SlidersPropsLocal from "./SlidersPropsLocal.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let tracknum = 0;

  let setBright = () => { cmdSetBright(tracknum, layernum); }
  let setDelay  = () => { cmdSetDelay( tracknum, layernum); }
  let setStart  = () => { cmdSetStart( tracknum, layernum); }
  let setFinish = () => { cmdSetFinish(tracknum, layernum); }

  </script>

<Dropdown
  type="inline"
  titleText="Effect:"
  selectedIndex={0}
  bind:items={$aEffectsDraw}
/>

<SliderVal name='Bright'
  onchange={setBright}
  bind:cur={$pStrand.tracks[tracknum-1].drawProps.pcentBright}
/>

<SliderVal name='Delay&nbsp;'
  onchange={setDelay}
  bind:cur={$pStrand.tracks[tracknum-1].drawProps.msecsDelay}
/>

<SlidersPropsLocal {tracknum} />

<SliderVal name='Start&nbsp;'
  onchange={setStart}
  bind:cur={$pStrand.tracks[tracknum-1].drawProps.pixStart}
/>

<SliderVal name='Finish'
  onchange={setFinish}
  bind:cur={$pStrand.tracks[tracknum-1].drawProps.pixEnd}
/>

<!-- TODO add checkboxes for GoUpwards and OverwritePixels 
-->
