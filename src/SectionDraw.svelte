<script>

  import {
    Row,
    Dropdown,
    Checkbox
  } from "carbon-components-svelte";

  import { DRAW_LAYER } from './pixcmds.js';

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
    userDoRestart,
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
  const restart   = () => { userDoRestart(  track, DRAW_LAYER, $aEffectsDraw); }
  const setBright = () => { userSetBright(  track); }
  const setDelay  = () => { userSetDelay(   track); }
  const setOrPixs = () => { userSetOrPixs(  track); }
  const setOffset = () => { userSetOffset(  track); }
  const setLength = () => { userSetLength(  track); }
  const setBwards = () => { userSetBackwards(track); }

  let helpon = false;

</script>

<div style="margin-top:15px; padding-left:5px;">
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
    <button
      class="button-restart"
      on:click={restart}
      >Restart
    </button>
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

  <div style="margin-left:10px; margin-bottom:13px;">
    <Row>
      <SliderVal name='Bright'
        onchange={setBright}
        bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
      />
    </Row>
    <Row>
      <SliderVal name='Delay&nbsp;'
        onchange={setDelay}
        bind:cur={$pStrand.tracks[track].drawProps.pcentDelay}
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
    {#if (track > 0) }
      <Row style="margin-top:10px;">
        <Checkbox labelText="Combine Pixels"
          on:check={setOrPixs}
          bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
        />
      </Row>
    {/if}
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
   .button-restart {
     height: 30px;
     margin-left: 15px;
     padding: 3px;
   }
  .button-help {
    width: 30px;
    height: 30px;
    padding: 3px;
    margin-right: 10px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
