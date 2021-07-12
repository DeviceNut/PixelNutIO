<script>

  import {
    Grid, Row,
    TextInput, Button,
    Modal, Dropdown
  } from "carbon-components-svelte";

  import {
    pStrand,
    aPatterns,
    curPatternStr, curPatternID
  } from './globals.js'

  import { newPatternID } from "./commands.js";
  import OneTrack from "./OneTrack.svelte"
  import SlidersMain from "./SlidersMain.svelte";
  import ButtonsAddDel from "./ButtonsAddDel.svelte";

  let open = false;
  let pid = $curPatternID;

  const doshow = () => { open = true; }

  const doload = () =>
  {
    open = false;
    curPatternID.set(pid);
    newPatternID();
  }

  const dosave = () => {} // TODO

  const doclear = () =>
  {
    curPatternID.set(0);
    curPatternStr.set('');
  }

  /*
      <TooltipDefinition
        direction="top"
        align="start"
        tooltipText="IBM Corporate Headquarters is based in Armonk, New York."
        >
        <Button kind="secondary" size="small" on:click={doshow}>Load</Button>
      </TooltipDefinition>
  */

</script>

<Grid>
  <Row style="margin-top:12px;">
    <p style="margin-right:7px;">Pattern:</p>
    <TextInput size="sm" bind:value={$curPatternStr} />
  </Row>
  <Row style="margin-top:12px; margin-left:50px;">
      <Button
        style="margin-right:13px;"
        size="small"
        kind="secondary"
        on:click={doshow}
        >Load
      </Button>
      <Button
        style="margin-right:13px;"
        size="small"
        kind="secondary"
        disabled
        on:click={dosave}
        >Save
      </Button>
      <Button
        style="margin-right:13px;"
        size="small"
        kind="secondary"
        on:click={doclear}
        >Clear
      </Button>
  </Row>
</Grid>

<div class="divider"></div>

<Grid>
  <Row>
    <SlidersMain/>
  </Row>

  <div style="background-color: #444544;">
    {#each Array($pStrand.tactives) as _,n}
      <OneTrack tracknum={n+1} />
    {/each}
  </div>
  <Row style="margin-top: 10px;">
    <ButtonsAddDel tracknum={0}/>
  </Row>
</Grid>

<!-- does not matter where you put this -->
<Modal
  bind:open
  modalHeading="Load Pattern"
  secondaryButtonText="Cancel"
  primaryButtonText="Set Pattern"
  on:submit={doload}
  on:click:button--secondary={()=>{open=false}}
  hasScrollingContent
  on:open
  on:close
  on:submit
  >
  <Dropdown
    type="inline"
    titleText=""
    bind:selectedIndex={pid}
    bind:items={$aPatterns}
  />
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
  <p>&nbsp;</p>
</Modal>

<style>
  .divider {
    margin: 12px;
    padding-top: 1px;
    background-color:#333433;
  }
</style>
