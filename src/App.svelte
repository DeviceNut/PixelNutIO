<script>

  import { onMount } from "svelte";

  import "carbon-components-svelte/css/g100.css";

  import {
    reqStrForIP,
    mqttFetchingIP,
    mqttBrokerIP,
    mqttChangeIP,
    PAGEMODE_DEVICES,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode
  } from './globals.js';

  import {
    storePatternsInit,
    storeBrokerRead
  } from './browser.js';

  import { helpInit } from './helpmain.js';

  import PageHelp from './PageHelp.svelte';
  import PageDevices from './PageDevices.svelte';
  import PageControls from './PageControls.svelte';

  storePatternsInit();
  helpInit();

  let hip = window.location.origin;
  console.log(`Served from host: ${hip}`);

  onMount(async () => {
    await fetch(hip + reqStrForIP)
      .then(resp => resp.json())
      .then(data => {
        const ipaddr = data.mqttip;
        console.log(`App: MqttIP=${ipaddr}`);
        mqttBrokerIP.set(ipaddr);
        mqttFetchingIP.set(false);
      })
      .catch(error => {
        console.log('App: MqttIP not found');
        storeBrokerRead(); // retrieve from browser store
        mqttFetchingIP.set(false);
        mqttChangeIP.set(true);
      });
  });

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
