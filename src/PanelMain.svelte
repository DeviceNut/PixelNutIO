<script>

  import {
    Grid,
    Row,
    Column
  } from "carbon-components-svelte";

  import { MAX_FORCE_VALUE } from './devcmds.js';
  import { pluginBit_TRIGFORCE } from './presets.js';
  import { pStrand } from './globals.js';
  import { userSendTrigger } from './cmduser1.js'

  import PanelPatterns from './PanelPatterns.svelte';
  import SlidersMain from './SlidersMain.svelte';
  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

  const setforce = () => {} // nothing to do here

</script>

<Grid>
  <PanelPatterns/>
  <div class="divider" style="margin-top:20px;"></div>
  <Row style="margin-top:10px; margin-bottom:15px;">

    <Column style="margin-left:-5px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>

      <Row style="margin-top:10px;">
        <div style="max-width:280px; margin-left:17px;">
          <SliderVal name='Force'
            max={MAX_FORCE_VALUE}
            onchange={setforce}
            bind:cur={$pStrand.forceValue}
            disabled={($pStrand.curPatternStr === '') ||
                      !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
            />
        </div> 
        <button
          class="button"
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
    margin-top: 5px;
  }
</style>
