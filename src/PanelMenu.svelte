<script>

  import {
    pStrand,
    patsMenuOpen
  } from './globals.js';

  import MenuPatterns from './MenuPatterns.svelte';

  const setname = () =>
  {
    //console.log(`New name: ${$pStrand.curPatternName}`);
  }

</script>

{#if $patsMenuOpen }
  <MenuPatterns/>
{:else if ($pStrand.tactives !== 0) }
  <div style="margin-top:20px; text-align:center;">
    <input class="editname"
      placeholder='Name your pattern here'
      on:change={setname}
      bind:value={$pStrand.curPatternName}
      size=32 maxlength=32
    />
  </div>
{/if}

<style>
  .editname {
    margin: 5px 5px 0 5px;
    padding: 3px;
    color: var(--fgc-editname);
    background-color: var(--bgc-editname);
    font-size:1.1em;
  }
</style>
