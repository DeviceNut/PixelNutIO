<script>

  import MediaQuery from "svelte-media-query";
  import { pStrand } from './globals.js';
  import TrackCols from './TrackCols.svelte';

  /* DISABLED: user editing pattern
    import { userEditPattern } from './cmduser.js';
    import PatternString from './PatternString.svelte';

    <div style="margin-left:5px; margin-right:5px;">
      <PatternString/>
    </div>
  */

</script>

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
