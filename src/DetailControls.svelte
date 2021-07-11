<script>
  import Track from "./Track.svelte"
  import { nTracks } from './globalVars.js';
</script>

{#each Array($nTracks) as _,n}
  <Track tracknum={n+1} />
{/each}
