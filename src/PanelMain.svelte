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
    userSendTrigger,
    userSetDirect
  } from './cmduser.js'

  import PanelPatterns from './PanelPatterns.svelte';
  import SlidersMain from './SlidersMain.svelte';
  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

  const setDirect = () => { userSetDirect(); }

  </script>

<Grid>

  <PanelPatterns/>
  <div class="divider"></div>

  <Row style="margin-top:10px;">
    <Column style="margin-left:-5px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>
      <Row>
        <Column>
          <SliderVal name='Force'
            max={MAX_FORCE_VALUE}
            onchange={userSetForce}
            bind:cur={$pStrand.forceValue}
            disabled={($pStrand.curPatternStr === '') ||
                     !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
            />
        </Column>
        <MediaQuery query="(min-width:501px)" let:matches>
          {#if matches}
            <Column style="margin-top:5px;">
              <button
                class="button"
                on:click={userSendTrigger}
                disabled={($pStrand.curPatternStr === '') ||
                         !($pStrand.triggerUsed)}
                >Trigger
              </button>
            </Column>
          {/if}
        </MediaQuery>
      </Row>
    </Column>
  </Row>

  <MediaQuery query="(max-width:500px)" let:matches>
    {#if matches}
      <Row style="margin-top:5px; margin-bottom:15px;">
        <Column style="margin-left:-5px;">
          <button
            class="button"
            on:click={userSendTrigger}
            disabled={($pStrand.curPatternStr === '') ||
                         !($pStrand.triggerUsed)}
            >Trigger
          </button>
        </Column>
      </Row>
    {/if}
  </MediaQuery>

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
