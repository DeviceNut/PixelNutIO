<script>

  import MediaQuery from "svelte-media-query";

  import {
    nStrands,
    pStrand
  } from './globals.js';

  import HeaderControls from './HeaderControls.svelte';
  import MultiStrands from './MultiStrands.svelte';
  import PanelMain from './PanelMain.svelte';
  import TrackLayout from './TrackLayout.svelte';

  let pstr = '';
  $: pstr = ($pStrand.showCustom ? "^" : "Customize");

  const toggleshow = () => { $pStrand.showCustom = !$pStrand.showCustom; }

</script>

<HeaderControls/>

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
  <MediaQuery query="(max-width: 1100px)" let:matches>
    {#if matches}
      <TrackLayout numcols={1} />
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width: 1101px) and (max-width: 1600px)" let:matches>
    {#if matches }
      <TrackLayout numcols={($pStrand.tactives < 2) ? ($pStrand.tactives) : 2} />
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width: 1601px)" let:matches>
    {#if matches }
      <TrackLayout numcols={($pStrand.tactives < 3) ? ($pStrand.tactives) : 3} />
    {/if}
  </MediaQuery>
{/if}

<style>
  .panel {
    max-width: 625px;
    margin: 0 auto;
    background-color: var(--bg-color-panel);
  }
  .divider {
    margin-top: 5px;
    padding-top: 2px;
    background-color: var(--bg-color-divider);
  }
  .bdiv {
    cursor: pointer;
    margin-top: 10px;
    padding: 5px;
    text-align: center;
    background-color: var(--bg-color-button);
  }
  .btext {
    color: var(--color-button);
  }
  .select {
    margin-top: 10px;
    padding: 2px 0 0 0;
  }
</style>
