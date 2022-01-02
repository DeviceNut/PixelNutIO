<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";

  import { pStrand } from './globals.js';

  import {
    MAX_HUE_VALUE,
    pluginBit_COLOR,
    pluginBit_COUNT,
    pluginBit_ORIDE_HUE,
    pluginBit_ORIDE_WHITE,
    pluginBit_ORIDE_COUNT,
  } from './devcmds.js';

  import {
    userSetHue,
    userSetWhite,
    userSetCount,
    userSetOverrides
  } from './cmduser1.js';

  import SliderVal from './SliderVal.svelte';

  export let track;
  
  // remove mouse obj from call, and add track parm
  const sethue   = () => { userSetHue(track); }
  const setwhite = () => { userSetWhite(track); }
  const setcount = () => { userSetCount(track); }
  const setovers = () => { userSetOverrides(track); }

</script>

<div style="margin: 20px -5px 10px -5px;
            padding-top:15px; padding-bottom:10px;
            background-color: var(--bg-color-controls-area);
            ">

  <p style="margin-left:10px; font-size:.9em">Allow Property Overrides:</p>

  <Row style="margin:10px 0 5px 10px; width:300px;">
    <Checkbox labelText="Hue"
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overHue}
      disabled={ !($pStrand.tracks[track].trackBits & pluginBit_COLOR) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_HUE) }
    />
    <Checkbox labelText="White"
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overWhite}
      disabled={ !($pStrand.tracks[track].trackBits & pluginBit_COLOR) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_WHITE) }
    />
    <Checkbox labelText="Count"
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overCount}
      disabled={ !($pStrand.tracks[track].trackBits & pluginBit_COUNT) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_COUNT) }
    />
  </Row>
  <Row>
    <Column style="margin-left:10px;">
      <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
        max={MAX_HUE_VALUE}
        onchange={sethue}
        bind:cur={$pStrand.tracks[track].drawProps.valueHue}
        disabled={ ($pStrand.opropsUser.doEnable && $pStrand.tracks[track].drawProps.overHue) ||
                  !($pStrand.tracks[track].trackBits & pluginBit_COLOR)                       ||
                   ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_HUE) }
      />

      <SliderVal name='White&nbsp;'
        onchange={setwhite}
        bind:cur={$pStrand.tracks[track].drawProps.pcentWhite}
        disabled={($pStrand.opropsUser.doEnable && $pStrand.tracks[track].drawProps.overWhite) ||
                 !($pStrand.tracks[track].trackBits & pluginBit_COLOR)                         ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_WHITE)}
      />

      <SliderVal name='Count&nbsp;'
        onchange={setcount}
        bind:cur={$pStrand.tracks[track].drawProps.pcentCount}
        disabled={($pStrand.opropsUser.doEnable && $pStrand.tracks[track].drawProps.overCount) ||
                 !($pStrand.tracks[track].trackBits & pluginBit_COUNT)                         ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_COUNT)}
      />
    </Column>
  </Row>
</div>
