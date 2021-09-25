<script>

  import MediaQuery from "svelte-media-query";

  import {
    Grid,
    Row,
    Column,
    Checkbox
  } from "carbon-components-svelte";

  import { MAX_FORCE_VALUE } from './pixcmds.js';
  import { pluginBit_TRIGFORCE } from './presets.js';

  import { pStrand } from './globals.js';

  import {
    userSetForce,
    userSendTrigger
  } from './cmduser.js'

  import PanelPatterns from './PanelPatterns.svelte';
  import SlidersMain from './SlidersMain.svelte';
  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

</script>

<Grid>
  <PanelPatterns/>
  <div class="divider" style="margin-top:25px;"></div>
  <Row style="margin-top:10px;">
    <Column style="margin-left:-5px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>
      <Row>
        <div style="max-width:280px; margin-left:15px;">
          <SliderVal name='Force'
            max={MAX_FORCE_VALUE}
            onchange={userSetForce}
            bind:cur={$pStrand.forceValue}
            disabled={($pStrand.curPatternStr === '') ||
                      !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
            />
        </div> 
        <button class="button"
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
  }
  .button {
    height: 35px;
    padding: 3px;
  }
</style>
