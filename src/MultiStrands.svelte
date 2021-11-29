<script>

  import { Checkbox } from "carbon-components-svelte";
  import { aStrands, strandCombine } from './globals.js';
  import { userStrandSelect, userStrandCombine } from './cmduser2.js';

</script>

<div style="margin-top:15px; margin-bottom:10px; text-align: center;">
  <span style="margin-right:5px; font-size:1.2em;">Strands:</span>

  {#each $aStrands as _,n}
    <Checkbox labelText={n+1}
      style="display:inline-block; margin-left:20px;"
      on:change={()=> {userStrandSelect(n, $strandCombine); }}
      bind:checked={$aStrands[n].selected}
    />
  {/each}

  <Checkbox labelText='Duplicate'
    style="display:inline-block; margin-left:30px;"
    on:check={()=> {userStrandCombine($strandCombine = !$strandCombine);}}
  />
</div>
