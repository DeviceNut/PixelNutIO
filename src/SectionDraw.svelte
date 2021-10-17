<script>

  import {
    Row,
    Dropdown,
    Checkbox
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    MAX_DELAY_VALUE
  } from './pixcmds.js';

  import {
    pStrand,
    aEffectsDraw,
    aEffDrawDesc
  } from './globals.js';

  import {
    pluginBit_DELAY,
    pluginBit_DIRECTION,
    pluginBit_ORIDE_DELAY,
    pluginBit_ORIDE_DIR,
    pluginBit_ORIDE_EXT
  } from './presets.js';

  import {
    userSetEffect,
    userSetBright,
    userSetDelay,
    userSetOffset,
    userSetLength,
    userSetOrPixs,
    userSetBackwards
  } from './cmduser.js'

  import SectionTrigger from './SectionTrigger.svelte';
  import SlidersPropsLocal from './SlidersPropsLocal.svelte';
  import SliderVal from './SliderVal.svelte';

  export let track;

  const setEffect = () => { userSetEffect(  track, DRAW_LAYER, $aEffectsDraw); }
  const setBright = () => { userSetBright(  track); }
  const setDelay  = () => { userSetDelay(   track); }
  const setOrPixs = () => { userSetOrPixs(  track); }
  const setOffset = () => { userSetOffset(  track); }
  const setLength = () => { userSetLength(  track); }
  const setBwards = () => { userSetBackwards(track); }

  let helpon = false;

</script>

<div style="margin-top:5px; padding-left:5px;">
  <Row>
    <Dropdown
      style="margin-bottom:10px;"
      size="sm"
      type="inline"
      on:select={setEffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex}
      bind:items={$aEffectsDraw}
    />
    <button
      class="button-help"
      on:click={() => {helpon = !helpon;}}
      >?
    </button>

    {#if (track > 0) }
      <div style="margin-left:20px;">
        <Checkbox labelText="Combine Pixels"
          on:check={setOrPixs}
          bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
        />
      </div>
    {/if}
  </Row>

  {#if helpon }
    <Row style="margin-left:-10px; margin-right:1px; padding:5px;
                color: var(--color-textbox);
                background-color: var(--bg-color-textbox);">
      <p style="font-size:.9em;">
        {$aEffDrawDesc[$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex]}
      </p>
    </Row>
  {/if}

  <div style="margin-left:10px; margin-bottom:10px;">
    <Row>
      <SliderVal name='Bright'
        onchange={setBright}
        bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
      />
    </Row>
    <Row>
      <SliderVal name='Delay&nbsp;'
        onchange={setDelay}
        min={-MAX_DELAY_VALUE}
        max={MAX_DELAY_VALUE}
        bind:cur={$pStrand.tracks[track].drawProps.msecsDelay}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_DELAY) ||
                   ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DELAY)}
      />
    </Row>
    <Row>
      <SliderVal name='Offset'
        onchange={setOffset}
        bind:cur={$pStrand.tracks[track].drawProps.pcentXoffset}
        disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
      />
    </Row>
    <Row>
      <SliderVal name='Length'
        onchange={setLength}
        bind:cur={$pStrand.tracks[track].drawProps.pcentXlength}
        disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
      />
    </Row>
    <Row style="margin-top:10px;">
      <Checkbox labelText="Move Backwards"
        on:check={setBwards}
        bind:checked={$pStrand.tracks[track].drawProps.dirBackwards}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_DIRECTION) ||
                   ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DIR)}
      />
    </Row>
  </div>

  <SlidersPropsLocal {track} />
  <SectionTrigger {track} />

</div>

<style>
  .button-help {
    width: 30px;
    height: 30px;
    padding: 3px;
    margin-right: 10px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
