<script>

  import {
    nStrands,
    pStrand
  } from './globals.js';

  import ControlsHeader from "./ControlsHeader.svelte"
  import MultiStrands from "./MultiStrands.svelte"
  import PanelMain from "./PanelMain.svelte"
  import PanelCustom from "./PanelCustom.svelte";

  let pstr = '';
  $: pstr = ($pStrand.showCustom ? "^" : "Customizer");

  const toggleshow = () =>
  {
    $pStrand.showCustom = !$pStrand.showCustom;
    if ($pStrand.showCustom)
    {
      // force the pattern selector to say "custom" while in custom mode
      $pStrand.patternID = 0;
    }
  }

</script>

<main>
  <ControlsHeader/>

  <div class="panel">

    {#if ($nStrands > 1) }
      <MultiStrands/>
      <div class="divider"></div>
    {/if}

    <PanelMain/>

    <div class="bdiv" class:select={$pStrand.showCustom} on:click={toggleshow} >
      <span class="btext" >{pstr}</span>
    </div>
  </div>

  {#if $pStrand.showCustom }
    <PanelCustom/>
  {/if}

</main>

<style>
  main {
    min-width: 320px;
    margin: 0 auto;
    padding: 5px;
  }
  .panel {
    max-width: 550px;
    margin: 0 auto;
    background-color: var(--bg-color-panel);
  }
  .divider {
    margin-top:5px;
    padding-top: 2px;
    background-color: var(--bg-color-divider);
  }
  .bdiv {
    cursor: pointer;
    margin-top:10px;
    padding: 5px;
    text-align: center;
    background-color: var(--bg-color-button);
  }
  .btext {
    color: var(--color-button);
  }
  .select {
    margin-top:10px;
    padding: 2px 0 0 0;
  }
</style>
