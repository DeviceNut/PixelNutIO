<script>

import {
    Grid,
    Row,
    Column
  } from "carbon-components-svelte";

import DevicesHeader from "./DevicesHeader.svelte"

</script>

<main>
  <DevicesHeader/>

  <Grid>
    <Row>
      <Column>
      </Column>
    </Row>
  </Grid>

  <div class="panel">

    <div style="padding:100px;"></div>
    <div class="divider"></div>

  </div>

</main>

<style>
  main {
    min-width: 320px;
    margin: 0 auto;
    padding: 5px;
  }
  .panel {
    max-width: 550px;
    margin: 0 auto;
    background-color: var(--bg-color-panel);
  }
  .divider {
    margin-top:5px;
    padding-top:5px;
    background-color: var(--bg-color-divider);
  }
</style>
