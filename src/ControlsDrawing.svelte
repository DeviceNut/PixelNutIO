<script>

  import { Row, Dropdown, Checkbox } from "carbon-components-svelte";
  import { pStrand, aEffectsDraw } from './globals.js';
  import {
    cmdSetDrawEffect,
    cmdSetBright, cmdSetDelay,
    cmdSetStart, cmdSetFinish,
    cmdSetOwrite, cmdSetDirect
  } from "./commands.js"
  import SlidersPropsLocal from "./SlidersPropsLocal.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let track = 0;

  const setEffect = () => { cmdSetDrawEffect(track); }
  const setBright = () => { cmdSetBright(track); }
  const setDelay  = () => { cmdSetDelay( track); }
  const setOwrite = () => { cmdSetOwrite(track); }
  const setDirect = () => { cmdSetDirect(track); }

  const setStart = () =>
  {
    if (cmdSetStart(track)) // update for new values
    {
      $pStrand.tracks[track].drawProps.pcentStart = $pStrand.tracks[track].drawProps.pcentStart;
      $pStrand.tracks[track].drawProps.pcentFinish = $pStrand.tracks[track].drawProps.pcentFinish;
    }
  }
  const setFinish = () =>
  {
    if (cmdSetFinish(track)) // update for new values
    {
      $pStrand.tracks[track].drawProps.pcentStart = $pStrand.tracks[track].drawProps.pcentStart;
      $pStrand.tracks[track].drawProps.pcentFinish = $pStrand.tracks[track].drawProps.pcentFinish;
    }
  }

  let setdir = 0;
  let overwrite = 0;

  </script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Draw Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      on:select={setEffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[0].pluginID}
      bind:items={$aEffectsDraw}
    />
  </div>
  {#if (track != 0) }
    <div style="margin-top: 7px; margin-left: 50px;">
    <Checkbox labelText="Pixel Overwrite"
      on:check={setOwrite}
      bind:checked={$pStrand.tracks[track].drawProps.orPixelValues}
    />
    </div>
  {/if}
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
  bind:cur={$pStrand.tracks[track].drawProps.pcentStart}
/>

<SliderVal name='Finish'
  onchange={setFinish}
  bind:cur={$pStrand.tracks[track].drawProps.pcentFinish}
/>

<Row style="margin: 13px 0 0 0;">
  <Checkbox labelText="Reverse Direction"
    on:check={setDirect}
    bind:checked={$pStrand.tracks[track].drawProps.reverseDir}
  />
</Row>
