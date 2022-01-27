<script>

  import MediaQuery from "svelte-media-query";
  import { Checkbox } from "carbon-components-svelte";

  import {
    nStrands,
    sStrands,
    aStrands,
    dupStrand
} from './globals.js';

  import {
    userStrandSelect,
    userStrandCombine
  } from './cmdmulti.js';

</script>

{#if ($nStrands > 1) }

  <div class="docenter">
    <div style="margin-top:15px;">

      <MediaQuery query="(max-width: 700px)" let:matches>
        {#if matches}
          <span style="display:block; text-align:center;
                       margin-bottom:10px; font-size:1.1em;"
            >Strands:
          </span>
        {/if}
      </MediaQuery>
      <MediaQuery query="(min-width: 701px)" let:matches>
        {#if matches}
          <span style="font-size:1.1em;">Strands:</span>
        {/if}
      </MediaQuery>
    
      {#each $aStrands as _,n}
        <Checkbox labelText={n+1}
          style="display:inline-block; margin-left:20px;"
          on:change={()=>{userStrandSelect($dupStrand, n);}}
          bind:checked={$aStrands[n].selected}
          disabled={$aStrands[n].selected && ($sStrands === 1)}
        />
      {/each}

      <Checkbox labelText='Dup'
        style="display:inline-block; margin-left:20px;"
        on:check={()=> {userStrandCombine($dupStrand = !$dupStrand);}}
      />

    </div>
  </div>
  <div class="divider"></div>

{/if}

<style>
  .docenter {
    display:flex;
    justify-content:center;
  }
  .divider {
    margin-top: 10px;
    padding-top: 2px;
    background-color: var(--bdc-page);
  }
</style>
