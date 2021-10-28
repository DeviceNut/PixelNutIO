<script>

  import { Grid, Row, Column } from "carbon-components-svelte";
  import { pStrand, nTracks } from './globals.js';
  import { strandClearTrack } from './strands.js';
  import OneTrack from './OneTrack.svelte';

  export let numcols;

  let add_disabled;
  $: add_disabled = ($pStrand.tactives >= $nTracks);

  const doadd = () =>
  {
    strandClearTrack($pStrand.tactives);
    ++($pStrand.tactives);
  }

</script>

<div class="panel" class:col1={numcols === 1} class:col2={numcols === 2}>
  <Grid>
    <Row>
      <Column>
        {#each Array($pStrand.tactives) as _,track}
          {#if ((track % numcols) === 0) }
            <OneTrack {track} />
          {/if}
        {/each}
      </Column>
      {#if (numcols > 1) }
        <Column style="margin-left:5px;">
          {#each Array($pStrand.tactives) as _,track}
            {#if ((track % numcols) === 1) }
              <OneTrack {track} />
            {/if}
          {/each}
        </Column>
      {/if}
      {#if (numcols > 2) }
        <Column style="margin-left:5px;">
          {#each Array($pStrand.tactives) as _,track}
            {#if ((track % numcols) === 2) }
              <OneTrack {track} />
            {/if}
          {/each}
        </Column>
      {/if}
    </Row>
  </Grid>
  {#if ($pStrand.tactives < $nTracks)}
    <div style="margin:10px 5px 5px 5px;">
      <button class="button-add"
        on:click={doadd}
        disabled={add_disabled}
        >Add New Track
      </button>
    </div>
  {/if}
</div>

<style>
  .panel {
    margin: 0 auto;
    border: 2px solid var(--bg-color-panel-border);
    background-color: var(--bg-color-panel);
  }
  .col1 {
    max-width:550px;
  }
  .col2 {
    min-width:1100px;
    max-width:1100px;
  }
  .button-add {
    width: 100%;
    padding: 2px;
  }
</style>
