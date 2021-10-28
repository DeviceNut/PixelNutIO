<script>

  import { Checkbox } from "carbon-components-svelte";

  import { aStrands } from './globals.js';
  
  import {
    userStrandSelect,
    userStrandCombine
  } from './cmduser2.js';

  let combine = false;

  const checkenables = () => { userStrandSelect(combine); }
  const checkowrite  = () => { userStrandCombine(combine = !combine); }

</script>

<div style="margin-top:7px; margin-left:5px; text-align: center;">
  <span style="margin-right:5px;">Strands:</span>

  {#each $aStrands as _,n}
    <Checkbox
      style="display:inline-block; margin-left:5px;"
      labelText={n+1}
      on:check={checkenables}
      bind:checked={$aStrands[n].selected}
    />
  {/each}

  <Checkbox labelText="Duplicate"
  style="display:inline-block; margin-left:15px;"
    on:check={checkowrite}
  />
</div>
