<script>

  import { Row, Dropdown, Checkbox } from "carbon-components-svelte";
  import { pStrand, aEffectsDraw } from './globals.js';
  import {
    cmdNewPattern,
    cmdSetBright, cmdSetDelay,
    cmdSetStart, cmdSetFinish
  } from "./commands.js"
  import { makeCmdStr } from "./patterns.js";
  import SlidersPropsLocal from "./SlidersPropsLocal.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let track = 0;

  const setBright = () => { cmdSetBright(track, 1); }
  const setDelay  = () => { cmdSetDelay( track, 1); }
  const setStart  = () => { cmdSetStart( track, 1); }
  const setFinish = () => { cmdSetFinish(track, 1); }
  const newcmd    = () => { makeCmdStr(track, 1); }

  let setdir = 0;
  let overwrite = 0;

  </script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Draw Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      on:select={cmdNewPattern}
      bind:selectedIndex={$pStrand.tracks[track].layers[0].pluginID}
      bind:items={$aEffectsDraw}
    />
  </div>
  <div style="margin-top: 7px; margin-left: 50px;">
  <Checkbox labelText="Pixel Overwrite"
    on:check={newcmd}
    bind:checked={$pStrand.tracks[track].drawProps.orPixelValues}
  />
  </div>
</Row>

<SliderVal name='Bright'
  onchange={setBright}
  bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
/>

<SliderVal name='Delay&nbsp;'
  onchange={setDelay}
  bind:cur={$pStrand.tracks[track].drawProps.msecsDelay}
/>

<SlidersPropsLocal {track} />

<SliderVal name='Start&nbsp;'
  onchange={setStart}
  bind:cur={$pStrand.tracks[track].drawProps.pixStart}
/>

<SliderVal name='Finish'
  onchange={setFinish}
  bind:cur={$pStrand.tracks[track].drawProps.pixEnd}
/>

<Row style="margin: 13px 0 0 0;">
  <Checkbox labelText="Reverse Direction"
    on:check={newcmd}
    bind:checked={$pStrand.tracks[track].drawProps.reverseDir}
  />
</Row>
