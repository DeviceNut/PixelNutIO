<script>

  import MediaQuery from "svelte-media-query";

  import {
    Grid,
    Row,
    Column
  } from "carbon-components-svelte";

  import {
    curDevice,
    curPageMode,
    PAGEMODE_DEVICES,
    mqttConnected,
    pStrand
  } from './globals.js';

  import { defCustomCmd } from './devcmds.js';
  import { userSetPattern } from './cmdpats.js';

  import HeaderControls from './HeaderControls.svelte';
  import MultiStrands from './MultiStrands.svelte';
  import ButtonsPatterns from './ButtonsPatterns.svelte';
  import PanelMenu from './PanelMenu.svelte';
  import PanelControls from './PanelControls.svelte';
  import TrackLayout from './TrackLayout.svelte';

  let pstr = '';
  $: pstr = ($pStrand.showCustom ? '^' : 'Customize');

  const toggleshow = () =>
  {
    $pStrand.showCustom = !$pStrand.showCustom;
    $pStrand.userCustom = $pStrand.showCustom;

    if ($pStrand.showCustom && ($pStrand.tactives === 0))
      userSetPattern(defCustomCmd);
  }

  $: if (!$mqttConnected || !$curDevice) $curPageMode = PAGEMODE_DEVICES;

</script>

<Grid style="margin-top:10px;">
  <MediaQuery query="(max-width: 1100px)" let:matches>
    {#if matches}
      <div class="panel panel1">
        <Row>
          <Column>
            <HeaderControls/>
            <MultiStrands/>
          </Column>
        </Row>
        <Row>
          <Column>
            <div style="margin:15px; 20px; 0 20px;">
              <ButtonsPatterns/>
              <PanelMenu/>
            </div>
            <div class="divider"></div>
            <div style="padding-left:10px;">
              <PanelControls/>
            </div>
            <div class="bdiv" class:bdiv2={$pStrand.showCustom}
              on:click={toggleshow}>
              <span class="btext" >{pstr}</span>
            </div>
          </Column>
        </Row>
      </div>
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width: 1101px)" let:matches>
    {#if matches }
      <div class="panel panel2">
        <Row>
          <Column>
            <HeaderControls/>
            <MultiStrands/>
          </Column>
        </Row>
        <Row style="margin:10px 0 10px 10px;">
          <Column>
            <ButtonsPatterns/>
            <PanelMenu/>
          </Column>
          <div class="vertdiv"></div>
          <Column>
            <PanelControls/>
          </Column>
        </Row>
        <Row>
          <Column>
            <div class="bdiv" class:bdiv2={$pStrand.showCustom}
              on:click={toggleshow}>
              <span class="btext" >{pstr}</span>
            </div>
          </Column>
        </Row>
      </div>
    {/if}
  </MediaQuery>
</Grid>

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
{:else}
  <div style="margin-top:10px;"></div>
{/if}

<style>
  .panel {
    margin: 0 auto;
    background-color: var(--bgc-panel);
    border: 2px solid var(--bgc-panel-border);
  }
  .panel1 {
    max-width: 630px;
  }
  .panel2 {
    max-width: 1050px;
  }
  .vertdiv {
    width: 3px;
    background-color: var(--bgc-panel-border);
  }
  .divider {
    margin-top: 20px;
    margin-bottom: 15px;
    padding-top: 2px;
    background-color: var(--bgc-divider);
  }
  .bdiv {
    cursor: pointer;
    height: 18px;
    padding-top: 2px;
    text-align: center;
    background-color: var(--bgc-button);
  }
  .bdiv2 {
    padding-top: 5px;
  }
  .btext {
    color: var(--fgc-button);
  }
</style>
