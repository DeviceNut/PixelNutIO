<script>

  import {
    Grid, Row,
    TextInput, Button,
  } from "carbon-components-svelte";

  import { pStrand, refreshCmdStr } from './globals.js'
  import { userSetPatternStr, userClearPattern } from './cmduser.js';

  import OneTrack from "./OneTrack.svelte"
  import ButtonsAddDel from "./ButtonsAddDel.svelte";

  const dosave = () => {} // TODO
  const dosend = () => {} // TODO

  const doclear = () => { userClearPattern(); }

  // hack to force updating display of command string
  // after change the value of sliders, for some reason
  $: {
    if ($refreshCmdStr)
    {
      $pStrand.patternStr = $pStrand.patternStr;
      $refreshCmdStr = false;
    }
  } 

</script>

<Grid>

  <div style="margin-top:12px;">
    <p style="margin-right:7px; font-size: .9em;">Command String:</p>
    <TextInput
      size="sm"
      on:change={userSetPatternStr}
      bind:value={$pStrand.patternStr}
    />
    <div class="buttons">
      <Button
        style="margin-right:13px;"
        size="small"
        kind="secondary"
        disabled
        on:click={dosave}
        >Save
      </Button>
      <!--
      <Button
        style="margin-right:13px;"
        size="small"
        kind="secondary"
        disabled
        on:click={dosend}
        >Send
      </Button>
      -->
      <Button
        style="margin-right:13px;"
        size="small"
        kind="secondary"
        on:click={doclear}
        >Clear
      </Button>
    </div>
  </div>

  <div style="background-color: #444544;">
    {#each Array($pStrand.tactives) as _,track}
      <OneTrack {track} />
    {/each}
  </div>

  <Row style="margin-top: 10px;">
    <ButtonsAddDel track={-1}/>
  </Row>

</Grid>

<style>
  .buttons {
    display: flex;
    justify-content: space-around;
    margin: 10px 0 25px 0;
  }
</style>
