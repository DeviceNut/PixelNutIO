<script>

/*
  import { TextInput } from "carbon-components-svelte";
  import { pStrand, refreshCmdStr } from './globals.js';

  //TODO: import { userEditPattern } from './cmduser.js';

  // FIXME: hack to force updating display of command string
  // after change the value of sliders, for some reason?!
  $: {
    if ($refreshCmdStr)
    {
      $pStrand.curPatternStr = $pStrand.curPatternStr;
      $refreshCmdStr = false;
    }
  } 
*/
</script>

<!--
<div style="padding: 7px 0 5px 0; font-size: .9em;">
  <span>Custom Pattern:</span>
  {#if ($pStrand.patternName !== '')}
    <span style="float:right;">
      Original Pattern: "{$pStrand.patternName}"
    </span>
  {/if}
</div>

<TextInput
  size="sm" disabled
  on:change={userEditPattern}
  bind:value={$pStrand.curPatternStr}
/>

-->
