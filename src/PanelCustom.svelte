<script>

  import {
    Grid, Row,
    TextInput, Button,
  } from "carbon-components-svelte";

  import {
    pStrand,
    curPatternStr, curPatternID
  } from './globals.js'

  import OneTrack from "./OneTrack.svelte"
  import ButtonsAddDel from "./ButtonsAddDel.svelte";

  const dosave = () => {} // TODO

  const dosend = () => {} // TODO

  const doclear = () =>
  {
    curPatternID.set(0);
    curPatternStr.set('');
  }

</script>

<Grid>

  <div style="margin-top:12px;">
    <p style="margin-right:7px; font-size: .9em;">Command String</p>
    <TextInput size="sm" bind:value={$curPatternStr} />
    <div class="buttons">
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
        disabled
        on:click={dosend}
        >Send
      </Button>
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
    {#each Array($pStrand.tactives) as _,n}
      <OneTrack tracknum={n+1} />
    {/each}
  </div>

  <Row style="margin-top: 10px;">
    <ButtonsAddDel tracknum={0}/>
  </Row>

</Grid>

<style>
  .buttons {
    display: flex;
    justify-content: space-around;
    margin: 10px 0 25px 0;
  }
</style>
