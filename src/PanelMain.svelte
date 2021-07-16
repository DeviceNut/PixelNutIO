<script>

  import {
    Grid, Row, Column,
    Dropdown, Button, Modal
  } from "carbon-components-svelte";
  import Help32 from "carbon-icons-svelte/lib/Help32";

  import { MAX_FORCE } from "./pixelnut.js";

  import {
    pStrand,
    aPatterns,
    aPatternsHelp,
    mainEnabled
  } from './globals.js'

  import {
    userSetPatternID,
    userClearPattern,
    userSavePattern,
    userSetForce,
    userSendTrigger
  } from "./cmduser.js";

  import SlidersMain from "./SlidersMain.svelte";
  import SlidersPropsGlobal from "./SlidersPropsGlobal.svelte";
  import SliderVal from "./SliderVal.svelte"

  /* BUG in tooltips: sliders knob bleeds through "whiting out" the text!
    <Tooltip style="margin-top:12px; float: right;"
      direction="right"
      triggerText=""
      >
      <p>Explanation of what selected pattern does.</p>
    </Tooltip>
  */

  let open = false;

  const doclear = () => { userClearPattern(); }
  const dosave = () => { userSavePattern(); }

</script>

<Grid>
  <Row style="margin-top: 10px;">
    <p style="margin: 7px 12px 0 0;">Choose Pattern:</p>
    <div style="background-color: #333433;">
      <Dropdown
        type="inline"
        on:select={userSetPatternID}
        bind:selectedIndex={$pStrand.patternID}
        bind:items={$aPatterns}
      />
    </div>
    {#if ($pStrand.patternID > 0) }
      <Button style="margin-left:20px;"
        size="small"
        kind="ghost"
        hasIconOnly icon={Help32}
        iconDescription="Pattern description"
        tooltipPosition="right"
        on:click={()=>open=true}
      />
      <Modal
        bind:open
        passiveModal
        modalHeading={$aPatterns[$pStrand.patternID].text}
        on:close
        >
        {#each $aPatternsHelp[$pStrand.patternID] as s,n}
          <p>{s}</p><br>
        {/each}
      </Modal>
    {:else}
      <button
        class="button button-pattern"
        on:click={doclear}
        disabled={$pStrand.patternStr == ''}
        >Clear
      </button>
      <button
        class="button button-pattern"
        on:click={dosave}
        disabled={$pStrand.patternStr == ''}
        >Save
      </button>
    {/if}
  </Row>

  <Row style="margin-top: 7px;">
    <Column style="margin-left: -15px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>
      <Row>
        <Column style="margin-top: 10px; max-width:300px">
          <SliderVal name='Force'
            max={MAX_FORCE}
            onchange={userSetForce}
            bind:cur={$pStrand.forceValue}
            disabled={!$mainEnabled}
            />
        </Column>
        <Column>
          <div style="margin: 10px 0 10px 0;">
            <button
              class="button button-trigger"
              on:click={userSendTrigger}
              disabled={!$mainEnabled}
              >Trigger
            </button>
          </div>
        </Column>
      </Row>
    </Column>
  </Row>
</Grid>

<style>
  .button {
    float:left;
    padding: 5px;
    width: 60px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button-pattern {
    margin: 5px 0 0 25px;
    height: 35px;
  }
  .button-trigger {
    margin-top: 3px;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
  button:disabled,button[disabled] {
    pointer-events: none;
    opacity: 0.35;
  }
</style>
