<script>

  import {
    nStrands,
    pStrand,
    modeCustom
  } from './globals.js';

  import HeaderControls from "./HeaderControls.svelte"
  import MultiStrands from "./MultiStrands.svelte"
  import PanelMain from "./PanelMain.svelte"
  import PanelCustom from "./PanelCustom.svelte";

  export let devname;

  let pstr = '';
  $: pstr = ($modeCustom ? "^" : "Customizer");

  const toggleshow = () =>
  {
    $modeCustom = !$modeCustom;
    if ($modeCustom)
    {
      // force the pattern selector to say "custom" while in custom mode
      $pStrand.patternID = 0;
    }
  }

</script>

<main>
  <HeaderControls {devname}/>

  <div class="panel">
    {#if ($nStrands > 1) }
      <MultiStrands/>
      <div class="divider"></div>
    {/if}

    <PanelMain/>

    <div class="bdiv" class:select={$modeCustom} on:click={toggleshow} >
      <span class="btext" >{pstr}</span>
    </div>
  </div>

  {#if $modeCustom }
    <PanelCustom/>
  {/if}

</main>

<style>
  main {
    margin: 0 auto;
    padding: 5px;
  }
  .panel {
    margin: 0 auto;
    max-width: 550px;
    background-color:black;
  }
  .divider {
    margin-top: 5px;
    padding-top: 2px;
    background-color:#333433;
  }
  .bdiv {
    margin-top:10px;
    padding: 5px;
    text-align: center;
    background-color:#555655;
    cursor: pointer;
  }
  .btext {
    font-size: 1em;
    color: white;
  }
  .select {
    margin-top: 10px;
    padding: 2px 0 0 0;
  }
</style>
