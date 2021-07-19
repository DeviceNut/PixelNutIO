<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Column,
    Dropdown,
    Checkbox,
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
    pluginBit_DELAY,
    pluginBit_DIRECTION,
    pluginBit_TRIGGER,
    pluginBit_ORIDE_DELAY,
    pluginBit_ORIDE_DIR
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

<div style="padding-left:5px;">
  <MediaQuery query="(max-width: 500px)" let:matches>
    {#if matches}
      <Row>
        <p style="font-size:.9em;">Draw Effect:</p>
      </Row>
    {/if}
  </MediaQuery>
  <Row>
    <MediaQuery query="(min-width: 501px)" let:matches>
      {#if matches}
        <p style="font-size:.9em; margin:10px 12px 0 0;">Draw Effect:</p>
      {/if}
    </MediaQuery>
    <Dropdown
      style="background-color: #333433;"
      type="inline"
      on:select={setEffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex}
      bind:items={$aEffectsDraw}
    />
    {#if ((track != 0) && ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex != 0)) }
      <div style="margin-top:7px; margin-left: 40px;">
        <Checkbox labelText="Pixel Overwrite"
          on:check={setOwrite}
          bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
        />
      </div>
    {/if}
  </Row>

  <Row style="margin-top:7px; margin-right:-10px; padding:5px; color:#888988; background-color:#333433;">
    <p style="font-size:.9em;">
      {$aEffDrawDesc[$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex]}
    </p>
  </Row>

  {#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex != 0) }

    <Row>
      <SliderVal name='Bright'
        onchange={setBright}
        bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
      />
    </Row>
    <Row>
      <SliderVal name='Delay&nbsp;'
        onchange={setDelay}
        bind:cur={$pStrand.tracks[track].drawProps.msecsDelay}
        disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_DELAY) ||
                  ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_DELAY)}
      />
    </Row>
    <Row>
      <SliderVal name='Start&nbsp;'
        onchange={setStart}
        bind:cur={$pStrand.tracks[track].drawProps.pcentStart}
      />
    </Row>
    <Row>
      <SliderVal name='Finish'
        onchange={setFinish}
        bind:cur={$pStrand.tracks[track].drawProps.pcentFinish}
      />
    </Row>

    <SlidersPropsLocal {track} />

    <Row style="margin-top:7px;">
      <Checkbox labelText="Reverse Direction"
        on:check={setDirect}
        bind:checked={$pStrand.tracks[track].drawProps.reverseDir}
        disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_DIRECTION) ||
                   ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_DIR)}
      />
    </Row>

    {#if ($aEffectsDraw[$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex].bits & pluginBit_TRIGGER) }
      <ControlsTrigger {track} />
    {:else}
      <div style="margin:7px 0 0 -13px; padding:5px 0 5px 5px; background-color:#222322;">
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
</div>

