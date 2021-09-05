<script>

  import {
    PAGEMODE_DEVICES,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode
  } from './globals.js';

  import { mqttBrokerSearch } from './mqtt.js';
  import { storePatternsInit } from './userstore.js';
  import { presetsInit } from './presets.js';

  import PageDevices from './PageDevices.svelte';
  import PageControls from './PageControls.svelte';
  import PageHelpDocs from './PageHelpDocs.svelte';

  mqttBrokerSearch();
  storePatternsInit();
  presetsInit();

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
