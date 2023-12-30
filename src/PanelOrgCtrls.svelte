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
  } from './orgpatts.js';

  import {
    MAX_HUE_VALUE,
    cmdStr_OR_Bright,
    cmdStr_OR_Delay,
    cmdStr_SetOride,
    cmdStr_PullTrigger,
    pluginBit_COLOR,
    pluginBit_COUNT,
    pluginBit_TRIGFORCE
  } from './devcmds.js';

  import {
    overBit_DegreeHue,
    overBit_PcentWhite,
    overBit_PcentCount 
  } from './strands.js';

  import SliderVal from './SliderVal.svelte';

  const userSetBright = () =>
  {
    $curDevice.send(cmdStr_OR_Bright + `${$pStrand.pcentBright}`);
  }

  const userSetDelay = () =>
  {

  }

  const userSetOverMode = () =>
  {

  }

  const userSetProps = () =>
  {

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
      <Checkbox labelText="Override Track Properties"
        on:check={userSetOverMode}
        bind:checked={$pStrand.opropsUser.doEnable}
        disabled={$pStrand.bitsOverride === 0}
      />
      <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
        max={MAX_HUE_VALUE}
        onchange={userSetProps}
        bind:cur={$pStrand.opropsUser.valueHue}
        disabled={!$pStrand.opropsUser.doEnable                 ||
                  !($pStrand.bitsOverride & overBit_DegreeHue)  ||
                  !($pStrand.bitsEffects  & pluginBit_COLOR)}
      />
      <SliderVal name='White&nbsp;'
        onchange={userSetProps}
        bind:cur={$pStrand.opropsUser.pcentWhite}
        disabled={!$pStrand.opropsUser.doEnable                 ||
                  !($pStrand.bitsOverride & overBit_PcentWhite) ||
                  !($pStrand.bitsEffects  & pluginBit_COLOR)}
      />
      <SliderVal name='Count&nbsp;'
        onchange={userSetProps}
        bind:cur={$pStrand.opropsUser.pcentCount}
        disabled={!$pStrand.opropsUser.doEnable                 ||
                  !($pStrand.bitsOverride & overBit_PcentCount) ||
                  !($pStrand.bitsEffects  & pluginBit_COUNT)}
      />
    </div>

    <div class="divider"></div>

    <SliderVal name='Force'
      max={MAX_FORCE_VALUE}
      bind:cur={$pStrand.forceValue}
      disabled={ !($pStrand.bitsEffects & pluginBit_TRIGFORCE) }
      />

    <button class="button-trigger"
      disabled={ !($pStrand.bitsEffects & pluginBit_TRIGFORCE) }
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
