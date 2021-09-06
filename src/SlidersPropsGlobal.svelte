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
  } from './pixcmds.js';

  import {
    pluginBit_COLOR,
    pluginBit_COUNT
  } from './presets.js';

  import { pStrand } from './globals.js';

  import {
    userSetOverMode,
    userSetProps
  } from './cmduser.js';
  
  import SliderVal from './SliderVal.svelte';

  let bgc = '';
  $: bgc = $pStrand.doOverride ? '#222' : '#111'
  // cannot use css vars here, and <Row> cannot take a class

</script>

<Row style="margin:15px 0 10px 0; padding:3px 0 5px 0; background-color: {bgc};">

  <Column style="margin-left:-10px;">
    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={userSetProps}
      bind:cur={$pStrand.degreeHue}
      disabled={!$pStrand.doOverride                  ||
                !($pStrand.bitsOverride & overBit_DegreeHue)  ||
                !($pStrand.bitsEffects  & pluginBit_COLOR)}
      max={359}
    />
    <SliderVal name='White&nbsp;'
      onchange={userSetProps}
      bind:cur={$pStrand.pcentWhite}
      disabled={!$pStrand.doOverride                  ||
                !($pStrand.bitsOverride & overBit_PcentWhite) ||
                !($pStrand.bitsEffects  & pluginBit_COLOR)}
    />
    <SliderVal name='Count&nbsp;'
      onchange={userSetProps}
      bind:cur={$pStrand.pcentCount}
      disabled={!$pStrand.doOverride                  ||
                !($pStrand.bitsOverride & overBit_PcentCount) ||
                !($pStrand.bitsEffects  & pluginBit_COUNT)}
    />
  </Column>

  <MediaQuery query="(max-width:500px)" let:matches>
    {#if matches}
      <Row style="margin:5px 0 3px 2px;">
        <Column>
          <Checkbox labelText="Override Properties"
            on:check={userSetOverMode}
            bind:checked={$pStrand.doOverride}
            disabled={$pStrand.bitsOverride === 0}
          />
        </Column>
      </Row>
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width:501px)" let:matches>
    {#if matches}
      <Column>
        <Checkbox labelText="Override"
          on:check={userSetOverMode}
          bind:checked={$pStrand.doOverride}
          disabled={$pStrand.bitsOverride === 0}
        />
      </Column>
    {/if}
  </MediaQuery>

</Row>
