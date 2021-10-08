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
    userSetDrawEffect,
    userSetBright,
    userSetDelay,
    userSetOffset,
    userSetLength,
    userSetOwrite,
    userSetDirect
  } from './cmduser.js'

  import SectionTrigger from './SectionTrigger.svelte';
  import SlidersPropsLocal from './SlidersPropsLocal.svelte';
  import SliderVal from './SliderVal.svelte';

  export let track;

  const setEffect = () => { userSetDrawEffect(track); }
  const setBright = () => { userSetBright(track); }
  const setDelay  = () => { userSetDelay( track); }
  const setOwrite = () => { userSetOwrite(track); }
  const setOffset = () => { userSetOffset(track); }
  const setLength = () => { userSetLength(track); }
  const setDirect = () => { userSetDirect(track); }

  let helpon = false;

</script>

<div style="margin-top:5px; padding-left:5px;">
  <Row>
    <Dropdown
      style="margin-bottom:-13px;"
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

    {#if ((track !== 0) && ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex !== 0)) }
      <div style="margin-left:20px;">
        <Checkbox labelText="Overwrite"
          on:check={setOwrite}
          bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
        />
      </div>
    {/if}
  </Row>

  {#if helpon }
    <Row style="margin-right:-10px; padding:5px;
                color: var(--color-textbox);
                background-color: var(--bg-color-textbox);">
      <p style="font-size:.9em;">
        {#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex === 0) }
          Explain drawing effect menu.
        {:else}
          {$aEffDrawDesc[$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex]}
        {/if}
      </p>
    </Row>
  {/if}

  {#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex !== 0) }

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
          bind:cur={$pStrand.tracks[track].drawProps.pcentOffset}
          disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
        />
      </Row>
      <Row>
        <SliderVal name='Length'
          onchange={setLength}
          bind:cur={$pStrand.tracks[track].drawProps.pcentExtent}
          disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
        />
      </Row>
      <Row style="margin-top:10px;">
        <Checkbox labelText="Reverse Direction"
          on:check={setDirect}
          bind:checked={$pStrand.tracks[track].drawProps.reverseDir}
          disabled={!($pStrand.tracks[track].trackBits & pluginBit_DIRECTION) ||
                     ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DIR)}
        />
      </Row>
    </div>

    <SlidersPropsLocal {track} />
    <SectionTrigger {track} />

  {/if}
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
