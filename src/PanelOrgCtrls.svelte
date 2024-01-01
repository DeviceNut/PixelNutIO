<script>

  import {
    Checkbox,
  } from 'carbon-components-svelte';

  import {
    curDevice,
    pStrand,
  } from './globals.js';

  import {
    MAX_FORCE_VALUE,
    patBit_TrigForce,
    patBit_Triggering,
    patBits_Properties,
    patBit_DegreeHue,
    patBit_PcentWhite,
    patBit_PcentCount,
  } from './orgpatts.js';

  import {
    MAX_HUE_VALUE,
    cmdStr_OR_Bright,
    cmdStr_PullTrigger,
  } from './devcmds.js';

  import SliderVal from './SliderVal.svelte';

  // these have changed in new protocol:
  const cmdStr_OR_Delay   = ":";    // delay percent to apply
  const cmdStr_SetOride   = "_";    // 0=disable 1=enable override
  const cmdStr_OR_Props   = "=";    // followed by: hue white count

  // 8-bit signed value
  const MINVAL_DELAY      = -128;
  const MAXVAL_DELAY      = 127;
  const RANGE_DELAY       = 255;

  const userSetBright = () =>
  {
    $curDevice.send(cmdStr_OR_Bright + `${$pStrand.pcentBright}`);
  }

  const userSetDelay = () =>
  {
    // convert percent into +/- MAXVAL_DELAY
    const delay = Math.floor(($pStrand.pcentDelay / 100) * RANGE_DELAY) + MINVAL_DELAY;
    $curDevice.send(cmdStr_OR_Delay + `${delay}`);
  }

  const userSetOverMode = () =>
  {
    const overide = $pStrand.opropsUser.doEnable ? 1 : 0;
    $curDevice.send(cmdStr_SetOride + `${overide}`);
  }

  const userSetProps = () =>
  {
    const hue   = $pStrand.opropsUser.valueHue;
    const white = $pStrand.opropsUser.pcentWhite;
    const count = $pStrand.opropsUser.pcentCount;
    $curDevice.send(cmdStr_OR_Props + `${hue} ${white} ${count}`);
  }

  const userSendTrigger = () =>
  {
    $curDevice.send(cmdStr_PullTrigger + `${$pStrand.forceValue}`);
  }

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

    <div class="divider"></div>

    <div class="area">
      <Checkbox labelText="Override Properties"
        on:check={userSetOverMode}
        bind:checked={$pStrand.opropsUser.doEnable}
        disabled={!($pStrand.curPatternBits & patBits_Properties)}
      />
      <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
        max={MAX_HUE_VALUE}
        onchange={userSetProps}
        bind:cur={$pStrand.opropsUser.valueHue}
        disabled={!$pStrand.opropsUser.doEnable ||
                  !($pStrand.curPatternBits & patBit_DegreeHue)}
      />
      <SliderVal name='White&nbsp;'
        onchange={userSetProps}
        bind:cur={$pStrand.opropsUser.pcentWhite}
        disabled={!$pStrand.opropsUser.doEnable ||
                  !($pStrand.curPatternBits & patBit_PcentWhite)}
      />
      <SliderVal name='Count&nbsp;'
        onchange={userSetProps}
        bind:cur={$pStrand.opropsUser.pcentCount}
        disabled={!$pStrand.opropsUser.doEnable ||
                  !($pStrand.curPatternBits & patBit_PcentCount)}
      />
    </div>

    <div class="divider"></div>

    <SliderVal name='Force'
      max={MAX_FORCE_VALUE}
      bind:cur={$pStrand.forceValue}
      disabled={ !($pStrand.curPatternBits & patBit_TrigForce) }
      />

    <button class="button-trigger"
      disabled={ !($pStrand.curPatternBits & patBit_Triggering) }
      on:click={userSendTrigger}
      >Trigger
    </button>

  </div>
</div>

<style>
  .area {
    margin-top: 15px;
    max-width: 290px;
    padding: 10px;
    background-color: var(--panel-back);
  }
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
