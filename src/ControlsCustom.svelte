<script>

  import { Grid, Row } from "carbon-components-svelte";
  import { nTracks } from './globalVars.js';
  import OneTrack from "./OneTrack.svelte"
  import MainSliders from "./MainSliders.svelte";

</script>

<Grid>
  <Row style="margin-top:3px;">
    <MainSliders/>
  </Row>
</Grid>

<div class="divider"></div>

<Grid>
  <Row>
    <MainSliders/>
  </Row>

  <Row style="margin-top:10px;">
    {#each Array($nTracks) as _,n}
      <OneTrack tracknum={n+1} />
    {/each}
  </Row>
</Grid>

<style>
  .divider {
    margin: 12px;
    padding-top: 1px;
    background-color:#333433;
  }
</style>
