<script>
  import MediaQuery from "svelte-media-query";
  import { Grid } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import TrackCols from "./TrackCols.svelte"

  /* DISABLED: user editing pattern
    import { userEditPattern } from './cmduser.js';
    import PatternString from "./PatternString.svelte"

    <div style="margin-left:5px; margin-right:5px;">
      <PatternString/>
    </div>
  */

/*
  {#if ($pStrand.tactives <= 1) }
    <div class="panel col1">
      <div style="margin:0 20px 0 20px;">
        {#each Array($pStrand.tactives) as _,track}
          <OneTrack {track} />
        {/each}
      </div>
      <div style="margin: 10px 0 5px 0;">
        <div style="margin:0 auto; text-align:center;">
          <ButtonsAddDel track={-1}/>
        </div>
      </div>
    </div>
  {:else}

        <div class="panel col1">
          <div style="margin:0 25px 0 25px;">
            {#each Array($pStrand.tactives) as _,track}
              <OneTrack {track} />
            {/each}
          </div>
          <div style="margin: 10px 0 5px 0;">
            <div style="margin:0 auto; text-align:center;">
              <ButtonsAddDel track={-1}/>
            </div>
          </div>
        </div>

<style>
  .panel {
    margin: 0 auto;
    border: 2px solid #333433;
    background-color: black;
  }
  .col1 {
    min-width:550px;
    max-width:550px;
  }
</style>
*/
</script>

<Grid>

    <MediaQuery query="(max-width: 1100px)" let:matches>
      {#if matches}
        <TrackCols numcols={1} />
      {/if}
    </MediaQuery>
    <MediaQuery query="(min-width: 1101px) and (max-width: 1700px)" let:matches>
      {#if matches }
        <TrackCols numcols={($pStrand.tactives < 2) ? ($pStrand.tactives) : 2} />
      {/if}
    </MediaQuery>
    <MediaQuery query="(min-width: 1701px)" let:matches>
      {#if matches }
        <TrackCols numcols={($pStrand.tactives < 3) ? ($pStrand.tactives) : 3} />
      {/if}
    </MediaQuery>

</Grid>
