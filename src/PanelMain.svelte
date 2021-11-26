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
  import ButtonsPaterns from './ButtonsPaterns.svelte';
  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

//<div style="height:300px; width:300px;"></div>

</script>

<Grid>

  {#if $patsMenuOpen }
    <MenuPatterns/>
  {:else}
    <div style="padding-top:20px;"></div>

    <div style="text-align:center;">
      <ButtonsPaterns/>
    </div>

    <div style="padding-top:20px;"></div>

    <div style="text-align:center;">
      <TextInput
        style="width:250px; margin:0 auto;"
        placeholder='Name of your pattern'
        bind:value={$pStrand.curPatternName}
        maxlength="32"
      />
    </div>
  {/if}

  <div class="divider" style="margin-top:20px;"></div>

  <Row style="margin-top:10px; margin-bottom:15px;">
    <Column style="margin-left:-5px;">

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

      <Row style="margin-top:10px;">
        <div style="max-width:280px; margin-left:17px;">
          <SliderVal name='Force'
            max={MAX_FORCE_VALUE}
            bind:cur={$pStrand.forceValue}
            disabled={($pStrand.curPatternStr === '') ||
                      !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
            />
        </div> 
        <button class="button-trigger"
          on:click={userSendTrigger}
          disabled={($pStrand.curPatternStr === '') ||
                    !($pStrand.triggerUsed)}
          >Trigger
        </button>
      </Row>

    </Column>
  </Row>

</Grid>

<style>
  .divider {
    margin-top: 15px;
    padding-top: 2px;
    background-color: var(--bg-color-divider);
  }  .button-trigger {
    height: 35px;
    padding: 3px;
    margin-top: 5px;
  }
</style>
