<script>

  import { nStrands, pStrand, modeCustom } from './globals.js';
  import MultiStrands from "./MultiStrands.svelte"
  import PanelMain from "./PanelMain.svelte"
  import PanelCustom from "./PanelCustom.svelte";

  let pstr = '';
  $: pstr = ($modeCustom ? "^" : "Customizer");

  const toggleshow = () =>
  {
    $modeCustom = !$modeCustom;
    if ($modeCustom)
    {
      $pStrand.patternID = 0;
    }
  }

</script>

<main>

  {#if ($nStrands > 1) }
    <MultiStrands/>
    <div class="divider"></div>
    {/if}

  <PanelMain/>
  <div class="divider"></div>

  <div class:outline={$modeCustom} style="margin-top: 7px;">
    <div class="bdiv" class:select={$modeCustom} on:click={toggleshow} >
      <span class="btext" >{pstr}</span>
    </div>
  
    {#if $modeCustom }
      <PanelCustom/>
    {/if}
  </div>

</main>

<style>
  main {
    margin: 0 auto;
    padding: 10px;
    max-width: 550px;
    background-color:black;
  }
  .divider {
    margin-top: 10px;
    padding-top: 2px;
    background-color:#333433;
  }
  .outline {
    border: 2px solid #333433;
  }
  .bdiv {
    padding: 5px;
    text-align: center;
    background-color:#555655;
    cursor: pointer;
  }
  .select {
    margin-top: -2px;
    padding: 2px 0 0 0;
  }
  .btext {
    font-size: 1em;
    color: white;
  }
</style>
