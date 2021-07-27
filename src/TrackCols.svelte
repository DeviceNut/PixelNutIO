<script>

  import { Grid, Row, Column } from "carbon-components-svelte";
  import { pStrand } from './globals.js';

  import OneTrack from "./OneTrack.svelte"
  import ButtonsAddDel from "./ButtonsAddDel.svelte";

  export let numcols;

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
    <div style="margin:10px 0 5px 0;">
      <div style="margin:0 auto; text-align:center;">
        <ButtonsAddDel track={-1}/>
      </div>
    </div>
  </Grid>
</div>

<style>
  .panel {
    margin: 0 auto;
    border: 2px solid var(--bg-color-panel-border);
    background-color: var(--bg-color-panel);
  }
  .col1 {
    /* min-width:320px; FIXME*/
    max-width:550px;
  }
  .col2 {
    min-width:1100px;
    max-width:1100px;
  }
</style>
