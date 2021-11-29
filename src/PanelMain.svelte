<script>

  import {
    Grid,
    Row,
    Column,
    TextInput
  } from "carbon-components-svelte";

  import {
    pStrand,
    patsMenuOpen
  } from './globals.js';

  import { MAX_FORCE_VALUE } from './devcmds.js';
  import { pluginBit_TRIGFORCE } from './presets.js';

  import {
    userSetBright,
    userSetDelay,
    userSetRotate,
    userSendTrigger
  } from './cmduser1.js';

  import MenuPatterns from './MenuPatterns.svelte';
  import ButtonsPatterns from './ButtonsPatterns.svelte';
  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

</script>

<Grid>

  <Row>
    <Column>
      {#if $patsMenuOpen }
        <MenuPatterns/>
      {:else}
        <div style="padding-top:20px;"></div>

        <div style="text-align:center;">
          <ButtonsPatterns/>
        </div>

        <div style="padding-top:20px;"></div>

        <div style="text-align:center;">
          <TextInput
            style="width:250px; margin:0 auto;"
            placeholder='Name of your pattern'
            bind:value={$pStrand.curPatternName}
            disabled={!$pStrand.showCustom}
            maxlength="32"
          />
        </div>

        <div style="padding-top:10px;"></div>
      {/if}
    </Column>

    <Column>

      <SliderVal name='Bright'
        onchange={userSetBright}
        bind:cur={$pStrand.pcentBright}
      />
      <SliderVal name='Delay&nbsp;'
        onchange={userSetDelay}
        bind:cur={$pStrand.pcentDelay}
      />
      <SliderVal name='Rotate'
        onchange={userSetRotate}
        bind:cur={$pStrand.pixelOffset}
        min={0}
        max={$pStrand.numPixels-1}
      />

      <SlidersPropsGlobal/>

      <SliderVal name='Force'
        max={MAX_FORCE_VALUE}
        bind:cur={$pStrand.forceValue}
        disabled={($pStrand.curPatternStr === '') ||
                  !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
        />

      <button class="button-trigger"
        on:click={userSendTrigger}
        disabled={($pStrand.curPatternStr === '') ||
                  !($pStrand.triggerUsed)}
        >Trigger
      </button>

    </Column>
  </Row>

</Grid>

<style>
  .button-trigger {
    height: 25px;
    width: 200px;
    margin: 5px 0 10px 60px;
    padding: 3px;
  }
</style>
