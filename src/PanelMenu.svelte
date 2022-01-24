<script>

  import { TextInput } from "carbon-components-svelte";
  import { pStrand, patsMenuOpen, showCustom } from './globals.js';

  import MenuPatterns from './MenuPatterns.svelte';

</script>

{#if $patsMenuOpen }
  <MenuPatterns/>
{:else if ($pStrand.tactives !== 0) }
  <div style="margin-top:20px; text-align:center;">
    <TextInput
      style="width:250px; margin:0 auto;"
      placeholder='Name your pattern here'
      bind:value={$pStrand.curPatternName}
      disabled={!$showCustom}
      maxlength="32"
    />
  </div>
{/if}
