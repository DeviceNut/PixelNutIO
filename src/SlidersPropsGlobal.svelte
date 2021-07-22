<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Column,
    Checkbox
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    overBit_DegreeHue,
    overBit_PcentWhite,
    overBit_PcentCount,
  } from './pixelnut.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT,
    pluginBit_ORIDE_HUE,
    pluginBit_ORIDE_WHITE,
    pluginBit_ORIDE_COUNT
  } from "./presets.js";

  import {
    pStrand,
    bitsOverride,
    bitsEffects
  } from './globals.js';

  import {
    userSetOverMode,
    userSetProps
  } from "./cmduser.js"
  
  import SliderVal from "./SliderVal.svelte"

  // setprops is called with mouse event
  const setprops = ()=> { userSetProps(); }
  const docheck  = ()=> { userSetOverMode(); }

  let bgc = '';
  $: bgc = $pStrand.doOverride ? '#222322' : '#111211'

/* FIXME
($bitsEffects  & pluginBit_ORIDE_HUE)
($bitsEffects  & pluginBit_ORIDE_WHITE)
($bitsEffects  & pluginBit_ORIDE_COUNT)
*/
</script>

<Row style="margin:15px 0 10px 0; padding:3px 0 5px 0; background-color:{bgc};">

  <Column style="margin-left:-10px;">
    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.degreeHue}
      disabled={!$pStrand.doOverride                  ||
                !($bitsOverride & overBit_DegreeHue)  ||
                !($bitsEffects  & pluginBit_COLOR)}
      max={359}
    />
    <SliderVal name='White&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentWhite}
      disabled={!$pStrand.doOverride                  ||
                !($bitsOverride & overBit_PcentWhite) ||
                !($bitsEffects  & pluginBit_COLOR)}
    />
    <SliderVal name='Count&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.pcentCount}
      disabled={!$pStrand.doOverride                  ||
                !($bitsOverride & overBit_PcentCount) ||
                !($bitsEffects  & pluginBit_COUNT)}
    />
  </Column>

  <MediaQuery query="(max-width:500px)" let:matches>
    {#if matches}
      <Row style="margin:5px 0 3px 2px;">
        <Column>
          <Checkbox labelText="Override Properties"
            on:check={docheck}
            bind:checked={$pStrand.doOverride}
            disabled={$bitsOverride == 0}
          />
        </Column>
      </Row>
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width:501px)" let:matches>
    {#if matches}
      <Column>
        <Checkbox labelText="Override"
          on:check={docheck}
          bind:checked={$pStrand.doOverride}
          disabled={$bitsOverride == 0}
        />
      </Column>
    {/if}
  </MediaQuery>

</Row>
