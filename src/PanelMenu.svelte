<script>

  import {
    pStrand,
    patsMenuOpen,
  } from './globals.js';

  import { sendStrandName } from './cmdsend.js';

  import NewPatMenu from './NewPatMenu.svelte';

  const setname = () =>
  {
    //console.log(`New name: ${$pStrand.curPatternName}`);
    sendStrandName();
  }

</script>

{#if $patsMenuOpen }
  <NewPatMenu/>
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
    color: var(--text-names);
    background-color: var(--panel-back);
    font-size:1.1em;
  }
</style>
