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

  /*
  <Column>
    <p class="overrides">Check to allow override from main controls:</p>
  </Column>
  <div style="width:100%;">
    <p class="overrides">Check to allow override from main controls:</p>
  </div>
  */  
</script>

<Row style="margin-top:5px; padding-top:5px;
            background-color: var(--bg-color-controls-area);">
  <Column>
    <p style="margin-left:60px; font-size:.9em;">
      Check to allow main control overrides:</p>
  </Column>
</Row>

<Row style="margin-right:-7px;
            background-color: var(--bg-color-controls-area);">

  <Column style="margin-left:-5px; max-width:270px;">
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
  </Column>

  <Column>
    <div style="margin-top:10px;"></div>
    <Checkbox
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overHue}
      disabled={!($pStrand.tracks[track].trackBits & pluginBit_COLOR) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_HUE)}
    />
    <div style="margin-top:20px;"></div>
    <Checkbox
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overWhite}
      disabled={!($pStrand.tracks[track].trackBits & pluginBit_COLOR) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_WHITE)}
    />
    <div style="margin-top:25px;"></div>
    <Checkbox
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overCount}
      disabled={!($pStrand.tracks[track].trackBits & pluginBit_COUNT) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_COUNT)}
    />
  </Column>
</Row>
