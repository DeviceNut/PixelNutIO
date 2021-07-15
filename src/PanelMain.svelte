<script>

  import {
    Grid, Row, Column,
    Dropdown, Button, Modal
  } from "carbon-components-svelte";
  import Help32 from "carbon-icons-svelte/lib/Help32";

  import { MAX_FORCE } from "./pixelnut.js";

  import {
    pStrand,
    aPatterns, aPatHelp
  } from './globals.js'

  import {
    userSetPatternID,
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
        <p>{$aPatHelp[$pStrand.patternID]}</p>
      </Modal>
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
          />
        </Column>
        <Column>
          <div style="margin: 10px 0 10px 0;">
            <button on:click={userSendTrigger} class="button">Trigger</button>
          </div>
        </Column>
      </Row>
    </Column>
  </Row>
</Grid>

<style>
  .button {
    float: left;
    padding: 5px;
    margin-top: 3px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
</style>
