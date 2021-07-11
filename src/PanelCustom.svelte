<script>

  import {
    Grid, Row, Column,
    TextInput, Button, Modal,
    TooltipDefinition,
  } from "carbon-components-svelte";

  import { nTracks, curPatternStr } from './globalVars.js';
  import OneTrack from "./OneTrack.svelte"
  import SlidersMain from "./SlidersMain.svelte";
  import DropPatterns from "./DropPatterns.svelte"

  let open = false;
  
  const doshow = () =>
  {
    open = true;
  }

  const doload = () =>
  {
    open = false;
  }

  const dosave = () =>
  {
  }

  const doclear = () =>
  {
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

  {#each Array($nTracks) as _,n}
    <OneTrack tracknum={n+1} />
  {/each}
</Grid>

<!-- does not matter where you put this -->
<Modal
  bind:open
  modalHeading="Load Pattern"
  primaryButtonText="Set Pattern"
  secondaryButtonText="Cancel"
  on:click:button--secondary={doload}
  hasScrollingContent
  on:open
  on:close
  on:submit
  >
  <DropPatterns/>
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
