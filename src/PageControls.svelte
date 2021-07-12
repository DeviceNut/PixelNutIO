<script>

  import { nStrands, customMode } from './globals.js';
  import MultiStrands from "./MultiStrands.svelte"
  import OperMode from "./OperMode.svelte"
  import PanelPreBuilt from "./PanelPreBuilt.svelte";
  import PanelCustom from "./PanelCustom.svelte";

</script>

<main>

  {#if ($nStrands > 1) }
    <MultiStrands/>
  {/if}

  <div style="margin-top:5px;"></div>

  <OperMode/>

  <div class="divider"></div>

  {#if $customMode}
    <PanelCustom/>
  {:else}
    <PanelPreBuilt/>
  {/if}

  <div class="divider"></div>

</main>

<style>
  main {
    margin: 0 auto;
    max-width: 500px;
    background-color:black;
  }
  .divider {
    margin-top: 10px;
    padding-top: 2px;
    background-color:#333433;
  }
</style>
