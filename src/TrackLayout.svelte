<script>

  import { afterUpdate } from 'svelte';

  import {
    Grid,
    Row,
    Column
  } from "carbon-components-svelte";

  import {
    pStrand,
    allowUpdates
  } from './globals.js';

  import TrackLayers from './TrackLayers.svelte';

  afterUpdate(() => {
		//console.log('TrackLayout: updated');
    $allowUpdates = true;
	});

  export let numcols;

</script>

<div class="panel"
  class:col1={numcols === 1}
  class:col2={numcols === 2}
  class:col3={numcols === 3}
  >
  <Grid>
    <Row>
      <Column>
        {#each Array($pStrand.tactives) as _,track}
          {#if ((track % numcols) === 0) }
            <TrackLayers {track} />
          {/if}
        {/each}
      </Column>
      {#if (numcols > 1) }
        <Column style="margin-left:5px;">
          {#each Array($pStrand.tactives) as _,track}
            {#if ((track % numcols) === 1) }
              <TrackLayers {track} />
            {/if}
          {/each}
        </Column>
      {/if}
      {#if (numcols > 2) }
        <Column style="margin-left:5px;">
          {#each Array($pStrand.tactives) as _,track}
            {#if ((track % numcols) === 2) }
              <TrackLayers {track} />
            {/if}
          {/each}
        </Column>
      {/if}
    </Row>
  </Grid>
</div>

<style>
  .panel {
    margin: 0 auto;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border: 2px solid var(--bg-color-panel-border);
    background-color: var(--bg-color-panel);
  }
  .col1 {
    max-width:630px;
  }
  .col2 {
    min-width:1050px;
    max-width:1050px;
  }
  .col3 {
    min-width:1550px;
    max-width:1550px;
  }
</style>
