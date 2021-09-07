<script>

  import {
    PAGEMODE_DEVICES,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode
  } from './globals.js';

  import {
    storeGetBrokerIP,
    storePatternsInit
  } from './browser.js';

  import { helpInit } from './helpmain.js';
  import { presetsInit } from './presets.js';

  import PageDevices from './PageDevices.svelte';
  import PageControls from './PageControls.svelte';
  import PageHelpDocs from './PageHelpDocs.svelte';

  helpInit();
  presetsInit();
  storePatternsInit();
  storeGetBrokerIP();

  $curPageMode = PAGEMODE_DEVICES;

</script>

<main>
  {#if ($curPageMode === PAGEMODE_HELPDOCS)}
    <PageHelpDocs/>
  {:else if ($curPageMode === PAGEMODE_CONTROLS)}
    <PageControls/>
  {:else}
    <PageDevices/>
  {/if}
</main>

<style>
  main {
    min-width: 320px;
  }
</style>
