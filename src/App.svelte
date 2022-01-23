<script>

  import "carbon-components-svelte/css/all.css";

  import {
    mqttBrokerIP,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode
  } from './globals.js';

  import { storePatternsInit } from './browser.js';
  import { helpInit } from './helpmain.js';

  import PageHelp from './PageHelp.svelte';
  import PageDevices from './PageDevices.svelte';
  import PageControls from './PageControls.svelte';
  import UserOptions from './UserOptions.svelte';

  storePatternsInit();
  helpInit();

  let hip = window.location.origin;
  console.log(`Served from host: ${hip}`);

  let ipaddr = window.location.hostname;
  if (ipaddr === 'localhost')
       $mqttBrokerIP = '192.168.8.222'; // DEBUG ONLY
  else $mqttBrokerIP = ipaddr;

  // "white", "g10", "g80", "g90", "g100"
  $: document.documentElement.setAttribute("theme", "g100");

</script>

<main>

  {#if ($curPageMode === PAGEMODE_HELPDOCS)}
    <PageHelp/>
  {:else if ($curPageMode === PAGEMODE_CONTROLS)}
    <PageControls/>
  {:else}
    <PageDevices/>
  {/if}

  <UserOptions/>

</main>
