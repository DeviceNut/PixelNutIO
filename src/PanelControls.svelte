<script>

  import { pStrand } from './globals.js';

  import {
    MAX_FORCE_VALUE,
    pluginBit_TRIGFORCE
  } from './devcmds.js';

  import {
    userSetBright,
    userSetDelay,
    userSetRotate,
    userSendTrigger
  } from './cmduser1.js';

  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

</script>

<div style="display:flex; justify-content:center;">
  <div style="margin-bottom:10px;">

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

    <div style="margin-top:10px;"></div>

    <SlidersPropsGlobal/>

    <div style="margin-top:10px;"></div>

    <SliderVal name='Force'
      max={MAX_FORCE_VALUE}
      bind:cur={$pStrand.forceValue}
      disabled={ ($pStrand.tactives === 0) ||
                !($pStrand.triggerUsed)    ||
                !($pStrand.bitsEffects & pluginBit_TRIGFORCE) }
      />

    <button class="button-trigger"
      on:click={userSendTrigger}
      disabled={ ($pStrand.tactives === 0) ||
                !($pStrand.triggerUsed) }
      >Trigger
    </button>

  </div>
</div>

<style>
  .button-trigger {
    height: 25px;
    width: 200px;
    margin: 5px 0 15px 60px;
    padding: 3px;
  }
</style>
