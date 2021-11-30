<script>

  import MediaQuery from "svelte-media-query";
  import {
    Grid,
    Row,
    Column
  } from "carbon-components-svelte";

  import {
    nStrands,
    pStrand
  } from './globals.js';

  import HeaderControls from './HeaderControls.svelte';
  import MultiStrands from './MultiStrands.svelte';
  import PanelMenu from './PanelMenu.svelte';
  import PanelControls from './PanelControls.svelte';
  import TrackLayout from './TrackLayout.svelte';

  let pstr = '';
  $: pstr = ($pStrand.showCustom ? "^" : "Customize");

  const toggleshow = () => { $pStrand.showCustom = !$pStrand.showCustom; }

</script>

<div class="panel">

  <HeaderControls/>

  {#if ($nStrands > 1) }
    <MultiStrands/>
    <div class="divider"></div>
  {/if}

  <Grid>
    <MediaQuery query="(max-width: 1100px)" let:matches>
      {#if matches}
        <Row>
          <Column>
            <PanelMenu/>
            <div class="divider"></div>
            <PanelControls/>
          </Column>
        </Row>
      {/if}
    </MediaQuery>
    <MediaQuery query="(min-width: 1101px)" let:matches>
      {#if matches }
        <Row>
          <Column>
            <PanelMenu/>
          </Column>
          <Column>
            <PanelControls/>
          </Column>
        </Row>
      {/if}
    </MediaQuery>

    <Row>
      <Column>
        <div class="bdiv" on:click={toggleshow}>
          <span class="btext" >{pstr}</span>
        </div>
      </Column>
    </Row>
    
  </Grid>
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
    max-width: 1100px;
    margin: 0 auto;
    background-color: var(--bg-color-panel);
    border: 2px solid var(--bg-color-panel-border);
  }
  .divider {
    margin-top: 20px;
    margin-bottom: 15px;
    padding-top: 2px;
    background-color: var(--bg-color-divider);
  }
  .bdiv {
    cursor: pointer;
    height: 18px;
    margin-top: 10px;
    padding-top: 2px;
    text-align: center;
    background-color: var(--bg-color-button);
  }
  .btext {
    color: var(--color-button);
  }
</style>
