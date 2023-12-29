<script>

  import {
    pStrand,
    selectBLE,
  } from './globals.js';

  import {
    MAX_FORCE_VALUE,
    pluginBit_TRIGFORCE
  } from './devcmds.js';

  import {
    userSetBright,
    userSetDelay,
    userSetRotate,
    userSendTrigger
  } from './cmdctrls.js';

  import SelectOrides from './SelectOrides.svelte';
  import SliderVal    from './SliderVal.svelte';

</script>

<div class="docenter">
  <div style="margin-bottom:10px;">

    <SliderVal name='Bright'
      onchange={userSetBright}
      bind:cur={$pStrand.pcentBright}
    />
    <SliderVal name='Delay&nbsp;'
      onchange={userSetDelay}
      bind:cur={$pStrand.pcentDelay}
    />
    {#if !$selectBLE}
      <SliderVal name='Rotate'
        onchange={userSetRotate}
        bind:cur={$pStrand.pixelOffset}
        min={0}
        max={$pStrand.numPixels-1}
      />
    {/if}

    <div class="divider"></div>
    <SelectOrides/>
    <div class="divider"></div>

    <SliderVal name='Force'
      max={MAX_FORCE_VALUE}
      bind:cur={$pStrand.forceValue}
      disabled={ ($pStrand.tactives === 0) ||
                !($pStrand.triggerUsed)    ||
                !($pStrand.bitsEffects & pluginBit_TRIGFORCE) }
      />

    <button class="button-trigger"
      on:click={userSendTrigger}
      disabled={ ($pStrand.tactives === 0) || !$pStrand.triggerUsed }
      >Trigger
    </button>

  </div>
</div>

<style>
  .docenter {
    display:flex;
    justify-content:center;
  }
  .divider {
    margin-top: 10px;
  }
  .button-trigger {
    height: 25px;
    width: 200px;
    margin: 5px 0 15px 60px;
    padding: 1px 3px 3px 3px;
  }
</style>
