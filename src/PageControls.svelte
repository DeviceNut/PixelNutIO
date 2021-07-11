<script>

  import { nStrands, customMode } from './globalVars.js';
  import MultiStrands from "./MultiStrands.svelte"
  import OperMode from "./OperMode.svelte"
  import PanelPreBuilt from "./PanelPreBuilt.svelte";
  import PanelCustom from "./PanelCustom.svelte";

  export let appname = '';

  </script>

<p class="header">{appname}</p>
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
  .header {
    margin: 0 0 7px 0;
    text-align:center;
    font-style:italic;
    font-family:'Trebuchet MS';
    font-size:1.7em;
    background-color:#333433;
  }
  .divider {
    margin-top: 10px;
    padding-top: 2px;
    background-color:#333433;
  }
</style>
