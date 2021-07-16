<script>

  import {
    Row,
    Dropdown,
    Checkbox
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER
  } from "./pixelnut.js";

  import {
    pStrand,
    aEffectsDraw,
    aEffDrawDesc
  } from './globals.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT,
    pluginBit_DELAY,
    pluginBit_DIRECTION,
    pluginBit_TRIGGER
  } from './presets.js';

  import {
    userSetDrawEffect,
    userSetBright,
    userSetDelay,
    userSetStart,
    userSetFinish,
    userSetOwrite,
    userSetDirect,
    userSetTrigManual
  } from "./cmduser.js"

  import ControlsTrigger from './ControlsTrigger.svelte'
  import SlidersPropsLocal from "./SlidersPropsLocal.svelte"
  import SliderVal from "./SliderVal.svelte"

  export let track;

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

  let dotrigger = true;
  const settrigger = () =>
  {
    $pStrand.tracks[track].layers[DRAW_LAYER].trigTypeStr = (dotrigger ? 'once' : 'none');
  }

  const setmanual = () => { userSetTrigManual(track); }

</script>

<Row style="margin: 3px 0 5px 0;">
  <p style="margin: 7px 12px 0 0;">Draw Effect:</p>
  <div style="background-color: #333433;">
    <Dropdown
      type="inline"
      on:select={setEffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex}
      bind:items={$aEffectsDraw}
    />
  </div>
  {#if ((track != 0) && ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex != 0)) }
    <div style="margin-top: 7px; margin-left: 50px;">
    <Checkbox labelText="Pixel Overwrite"
      on:check={setOwrite}
      bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
    />
    </div>
  {/if}
</Row>

<Row style="margin: 15px 0 10px 0; padding: 5px; color: #888988; background-color: #333433;">
  <span>
    {$aEffDrawDesc[$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex]}
  </span>
</Row>

{#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex != 0) }

  <SliderVal name='Bright'
    onchange={setBright}
    bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
  />

  <SliderVal name='Delay&nbsp;'
    onchange={setDelay}
    bind:cur={$pStrand.tracks[track].drawProps.msecsDelay}
    disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_DELAY)}
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
      disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_DIRECTION)}
    />
  </Row>

  {#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_TRIGGER) }
    <ControlsTrigger {track} />
  {:else}
    <div style="margin-top: 8px; padding: 5px 0 5px 5px; background-color: #222322;">
      <Row style="margin:0;">
        <Checkbox labelText="Trigger once at start"
          style="padding: 3px;"
          on:check={setmanual}
          bind:checked={dotrigger}
        />
      </Row>
      <Row style="margin:0;">
        <Checkbox labelText="Allow manual trigger"
          style="padding: 3px;"
          on:check={setmanual}
          bind:checked={$pStrand.tracks[track].layers[DRAW_LAYER].trigDoManual}
        />
      </Row>
    </div>
  {/if}

{/if}
