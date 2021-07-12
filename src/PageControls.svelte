<script>

  import { nStrands } from './globals.js';
  import MultiStrands from "./MultiStrands.svelte"
  import PanelBasic from "./PanelBasic.svelte";
  import PanelCustom from "./PanelCustom.svelte";

  let doshow = true;

</script>

<main>

  {#if ($nStrands > 1) }
    <MultiStrands/>
    <div class="divider"></div>
    {/if}

  <PanelBasic/>
  <div class="divider"></div>

  <div class="bdiv" class:select={doshow} on:click={()=>{doshow = !doshow}} >
    <span class="btext" >Customize Pattern </span>
  </div>

  {#if (doshow) }
    <PanelCustom/>
  {/if}

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
  .bdiv {
    margin-top: 10px;
    padding: 5px;
    text-align: center;
    background-color:#333433;
    cursor: pointer;
  }
  .select {
    background-color:#555655;
  }
  .btext {
    font-size: 1.2em;
    color: white;
  }
</style>
