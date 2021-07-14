<script>

  import { nStrands } from './globals.js';
  import MultiStrands from "./MultiStrands.svelte"
  import PanelMain from "./PanelMain.svelte"
  import PanelCustom from "./PanelCustom.svelte";

  let doshow = false;
  let pstr = '';
  $: pstr = (doshow ? "^" : "Customizer");

</script>

<main>

  {#if ($nStrands > 1) }
    <MultiStrands/>
    <div class="divider"></div>
    {/if}

  <PanelMain/>
  <div class="divider"></div>

  <div class:outline={doshow} style="margin-top: 7px;">
    <div class="bdiv" class:select={doshow} on:click={()=>{doshow = !doshow}} >
      <span class="btext" >{pstr}</span>
    </div>
  
    {#if doshow }
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
