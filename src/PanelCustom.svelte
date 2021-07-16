<script>

  import { Grid, Row, TextInput } from "carbon-components-svelte";
  import { pStrand, refreshCmdStr } from './globals.js'
  import { userSetPatternStr } from './cmduser.js';

  import OneTrack from "./OneTrack.svelte"
  import ButtonsAddDel from "./ButtonsAddDel.svelte";

  // hack to force updating display of command string
  // after change the value of sliders, for some reason FIXME?
  $: {
    if ($refreshCmdStr)
    {
      $pStrand.patternStr = $pStrand.patternStr;
      $refreshCmdStr = false;
    }
  } 

  // FIXME: enable editing command string below

</script>

<Grid>

  <div style="margin: 12px 0 15px 0;">
    <div style="margin-bottom:5px;">
      <span style="margin-right:7px; font-size: .9em;">
        Command String
      </span>
      {#if ($pStrand.patternName != '')}
        <span style="float:right; margin-right:7px; font-size: .9em;">
          Original Pattern: {$pStrand.patternName}
        </span>
      {/if}
    </div>
    <TextInput
      size="sm" disabled
      on:change={userSetPatternStr}
      bind:value={$pStrand.patternStr}
    />
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
