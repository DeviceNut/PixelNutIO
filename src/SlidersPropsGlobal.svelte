<script>

  import { Checkbox } from 'carbon-components-svelte';

  import {
    overBit_DegreeHue,
    overBit_PcentWhite,
    overBit_PcentCount,
  } from './devcmds.js';

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
  $: bgc = $pStrand.doOverride ? '#222' : '#111';
  // cannot use css vars here, and style cannot access globals

  let helpon = false;

</script>

<div style="margin-top:15px; padding:10px; background-color: {bgc};">

  <div style="margin-bottom:5px;">

    <Checkbox labelText="Override Track Properties"
      style="display:inline-block;"
      on:check={userSetOverMode}
      bind:checked={$pStrand.doOverride}
      disabled={$pStrand.bitsOverride === 0}
    />
    <button
      class="button-help"
      on:click={() => {helpon = !helpon;}}
      >?
    </button>

    {#if helpon }
      <div style="margin-top:5px; margin-bottom:5px; padding:5px;
                  color: var(--color-textbox);
                  background-color: var(--bg-color-textbox);">
        <p style="font-size:.9em;">
          Explain override track properties.
        </p>
      </div>
    {/if}

  </div>

  <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.degreeHue}
    disabled={!$pStrand.doOverride                          ||
              !($pStrand.bitsOverride & overBit_DegreeHue)  ||
              !($pStrand.bitsEffects  & pluginBit_COLOR)}
    max={359}
  />
  <SliderVal name='White&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.pcentWhite}
    disabled={!$pStrand.doOverride                          ||
              !($pStrand.bitsOverride & overBit_PcentWhite) ||
              !($pStrand.bitsEffects  & pluginBit_COLOR)}
  />
  <SliderVal name='Count&nbsp;'
    onchange={userSetProps}
    bind:cur={$pStrand.pcentCount}
    disabled={!$pStrand.doOverride                          ||
              !($pStrand.bitsOverride & overBit_PcentCount) ||
              !($pStrand.bitsEffects  & pluginBit_COUNT)}
  />
</div>

<style>
  .button-help {
    font-size: .8em;
    width: 25px;
    height: 25px;
    padding: 3px;
    margin-left: 20px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
