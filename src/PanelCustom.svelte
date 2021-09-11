<script>

  import MediaQuery from "svelte-media-query";
  import { pStrand } from './globals.js';
  import TrackCols from './TrackCols.svelte';

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
