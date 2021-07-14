<script>

  import { Row, Dropdown, Checkbox } from "carbon-components-svelte";
  import { pStrand, aEffectsDraw } from './globals.js';
  import {
    userSetDrawEffect,
    userSetBright, userSetDelay,
    userSetStart, userSetFinish,
    userSetOwrite, userSetDirect
  } from "./cmduser.js"
  import SlidersPropsLocal from "./SlidersPropsLocal.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let track = 0;

  const setEffect = () => { userSetDrawEffect(track); }
  const setBright = () => { userSetBright(track); }
  const setDelay  = () => { userSetDelay( track); }
  const setOwrite = () => { userSetOwrite(track); }
  const setDirect = () => { userSetDirect(track); }

  const setStart = () =>
  {
    if (userSetStart(track)) // update for new values
    {
      $pStrand.tracks[track].drawProps.pcentStart = $pStrand.tracks[track].drawProps.pcentStart;
      $pStrand.tracks[track].drawProps.pcentFinish = $pStrand.tracks[track].drawProps.pcentFinish;
    }
  }
  const setFinish = () =>
  {
    if (userSetFinish(track)) // update for new values
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
      bind:selectedIndex={$pStrand.tracks[track].layers[0].pluginIndex}
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
