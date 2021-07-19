<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Column,
    Checkbox
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER
  } from "./pixelnut.js";

  import {
    pStrand
  } from './globals.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT,
    pluginBit_ORIDE_HUE,
    pluginBit_ORIDE_WHITE,
    pluginBit_ORIDE_COUNT,
  } from './presets.js';

  import {
    userSetProps,
    userSetOverrides
  } from "./cmduser.js"

  import SliderVal from "./SliderVal.svelte"

  export let track = 0;
  
  const setprops = () => { userSetProps(track); }
  const setovers = () => { userSetOverrides(track); }

</script>

<Row style="margin-top:5px; background-color:#222322;">

  <Column>
    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.tracks[track].drawProps.degreeHue}
      disabled={($pStrand.doOverride && $pStrand.tracks[track].drawProps.overHue) ||
                !($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COLOR) ||
                ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_HUE)}
      max={359}
    />

    <SliderVal name='White&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.tracks[track].drawProps.pcentWhite}
      disabled={($pStrand.doOverride && $pStrand.tracks[track].drawProps.overWhite) ||
                !($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COLOR) ||
                ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_WHITE)}
    />

    <SliderVal name='Count&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.tracks[track].drawProps.pcentCount}
      disabled={($pStrand.doOverride && $pStrand.tracks[track].drawProps.overCount) ||
                !($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COUNT) ||
                ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_COUNT)}
    />
  </Column>

  <MediaQuery query="(min-width: 501px)" let:matches>
    {#if matches}
      <Column>
        <div style="margin-top: 8px;"></div>
        <Checkbox labelText="Override"
          on:check={setovers}
          bind:checked={$pStrand.tracks[track].drawProps.overHue}
          disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COLOR) ||
                    ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_HUE)}
        />
        <div style="margin-top: 8px;"></div>
        <Checkbox labelText="Override"
          on:check={setovers}
          bind:checked={$pStrand.tracks[track].drawProps.overWhite}
          disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COLOR) ||
                    ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_WHITE)}
        />
        <div style="margin-top: 8px;"></div>
        <Checkbox labelText="Override"
          on:check={setovers}
          bind:checked={$pStrand.tracks[track].drawProps.overCount}
          disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COUNT) ||
                    ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_COUNT)}
        />
      </Column>
    {/if}
  </MediaQuery>
</Row>

<MediaQuery query="(max-width: 500px)" let:matches>
  {#if matches}
    <Row style="padding-top:3px; background-color:#222322;">
      <Column>
        <Checkbox labelText="Overide Hue"
          on:check={setovers}
          bind:checked={$pStrand.tracks[track].drawProps.overHue}
          disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COLOR) ||
                    ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_HUE)}
        />
        <Checkbox labelText="Overide White"
          on:check={setovers}
          bind:checked={$pStrand.tracks[track].drawProps.overWhite}
          disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COLOR) ||
                    ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_WHITE)}
        />
        <Checkbox labelText="Overide Count"
          on:check={setovers}
          bind:checked={$pStrand.tracks[track].drawProps.overCount}
          disabled={!($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_COUNT) ||
                    ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_ORIDE_COUNT)}
        />
      </Column>
    </Row>
  {/if}
</MediaQuery>

