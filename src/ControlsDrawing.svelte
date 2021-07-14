<script>

  import { Row, Dropdown } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import { cmdSetBright, cmdSetDelay, cmdSetStart, cmdSetFinish } from "./commands.js"
  import { aEffectsDraw } from './globals.js'
  import SlidersPropsLocal from "./SlidersPropsLocal.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let tracknum = 0;

  const setBright = () => { cmdSetBright(tracknum, 1); }
  const setDelay  = () => { cmdSetDelay( tracknum, 1); }
  const setStart  = () => { cmdSetStart( tracknum, 1); }
  const setFinish = () => { cmdSetFinish(tracknum, 1); }

</script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Choose Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      selectedIndex={0}
      bind:items={$aEffectsDraw}
    />
  </div>
</Row>

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
