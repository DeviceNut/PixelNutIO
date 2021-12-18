<script>

  import MediaQuery from "svelte-media-query";
  import { Checkbox } from "carbon-components-svelte";
  import { nStrands, aStrands, strandCombine } from './globals.js';
  import { userStrandSelect, userStrandCombine } from './cmduser2.js';

//    <span style="margin-right:5px; font-size:1.1em;">Strands:</span>

</script>

{#if ($nStrands > 1) }

  <div style="display:flex; justify-content:center;">
    <div style="margin-top:15px;">

      {#each $aStrands as _,n}
        <Checkbox labelText={n+1}
          style="display:inline-block; margin-left:20px;"
          on:change={()=> {userStrandSelect(n, $strandCombine); }}
          bind:checked={$aStrands[n].selected}
        />
      {/each}

      <Checkbox labelText='Dup'
        style="display:inline-block; margin-left:20px;"
        on:check={()=> {userStrandCombine($strandCombine = !$strandCombine);}}
      />

    </div>
  </div>
  <div class="divider"></div>

{/if}

<style>
.divider {
  margin-top: 10px;
  padding-top: 2px;
  background-color: var(--bg-color-divider);
}
</style>
