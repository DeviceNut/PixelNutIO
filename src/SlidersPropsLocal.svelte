<script>

  import {
    Row,
    Column,
    Checkbox
  } from "carbon-components-svelte";

  import { pStrand } from './globals.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT,
    pluginBit_ORIDE_HUE,
    pluginBit_ORIDE_WHITE,
    pluginBit_ORIDE_COUNT,
  } from './presets.js';

  import {
    userSetHue,
    userSetWhite,
    userSetCount,
    userSetOverrides
  } from './cmduser.js';

  import SliderVal from './SliderVal.svelte';

  export let track;
  
  // remove mouse obj from call, and add track parm
  const sethue   = () => { userSetHue(track); }
  const setwhite = () => { userSetWhite(track); }
  const setcount = () => { userSetCount(track); }
  const setovers = () => { userSetOverrides(track); }

  let helpon = false;

</script>

<div style="margin-left:-10px;
            padding-top:13px; padding-bottom:8px;
            background-color: var(--bg-color-controls-area);">
  <div>
    <button
      class="button-help"
      on:click={() => {helpon = !helpon;}}
      >?
    </button>
    <p style="display:inline-block; margin-left:25px; font-size:.9em;">
      Check for main control overrides:</p>

    {#if helpon }
        <div style="margin:15px 10px 0 10px; padding:5px;
                    color: var(--color-textbox);
                    background-color: var(--bg-color-textbox);">
          <p style="font-size:.9em;">
            Explain main control overrides.
          </p>
        </div>
    {/if}
  </div>

  <Row>
    <Column style="margin-left:10px;">
      <div style="max-width:245px;">
        <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
          max={359}
          onchange={sethue}
          bind:cur={$pStrand.tracks[track].drawProps.degreeHue}
          disabled={($pStrand.doOverride && $pStrand.tracks[track].drawProps.overHue) ||
                  !($pStrand.tracks[track].trackBits & pluginBit_COLOR)              ||
                    ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_HUE)}
        />

        <SliderVal name='White&nbsp;'
          onchange={setwhite}
          bind:cur={$pStrand.tracks[track].drawProps.pcentWhite}
          disabled={($pStrand.doOverride && $pStrand.tracks[track].drawProps.overWhite) ||
                  !($pStrand.tracks[track].trackBits & pluginBit_COLOR)                ||
                    ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_WHITE)}
        />

        <SliderVal name='Count&nbsp;'
          onchange={setcount}
          bind:cur={$pStrand.tracks[track].drawProps.pcentCount}
          disabled={($pStrand.doOverride && $pStrand.tracks[track].drawProps.overCount) ||
                  !($pStrand.tracks[track].trackBits & pluginBit_COUNT)                ||
                    ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_COUNT)}
        />
      </div>
    </Column>
    <Column>
      <div style="margin-top:10px;"></div>
      <Checkbox
        on:check={setovers}
        bind:checked={$pStrand.tracks[track].drawProps.overHue}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_COLOR) ||
                    ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_HUE)}
      />
      <div style="margin-top:22px;"></div>
      <Checkbox
        on:check={setovers}
        bind:checked={$pStrand.tracks[track].drawProps.overWhite}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_COLOR) ||
                    ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_WHITE)}
      />
      <div style="margin-top:20px;"></div>
      <Checkbox
        on:check={setovers}
        bind:checked={$pStrand.tracks[track].drawProps.overCount}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_COUNT) ||
                    ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_COUNT)}
      />
    </Column>
  </Row>
</div>

<style>
  .button-help {
    font-size: .8em;
    width: 25px;
    height: 25px;
    padding: 3px;
    margin-left: 15px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
