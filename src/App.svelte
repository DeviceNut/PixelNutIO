<script>

  import "carbon-components-svelte/css/g100.css";

  import {
    PAGEMODE_DEVICES,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode
  } from './globals.js';

  import {
    storeBrokerRead,
    storePatternsInit
  } from './browser.js';

  import { helpInit } from './helpmain.js';
  import { presetsInit } from './presets.js';

  import PageHelp from './PageHelp.svelte';
  import PageDevices from './PageDevices.svelte';
  import PageControls from './PageControls.svelte';

  helpInit();
  presetsInit();
  storePatternsInit();
  storeBrokerRead();

  $curPageMode = PAGEMODE_DEVICES;

</script>

<main>
  {#if ($curPageMode === PAGEMODE_HELPDOCS)}
    <PageHelp/>
  {:else if ($curPageMode === PAGEMODE_CONTROLS)}
    <PageControls/>
  {:else}
    <PageDevices/>
  {/if}
</main>
