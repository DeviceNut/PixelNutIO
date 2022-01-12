<script>

  import "carbon-components-svelte/css/g100.css";

  import { Loading } from "carbon-components-svelte";

  import {
    reqStrForIP,
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

  let promise = fetch(hip + reqStrForIP)
      .then(resp => resp.json())
      .then(data => {
        const ipaddr = data.mqttip;
        console.log(`App: MqttIP=${ipaddr}`);
        $mqttBrokerIP = ipaddr;
      })
      .catch(error => {
        console.log('App: MqttIP not found');
        storeBrokerRead(); // retrieve from browser store
        $mqttChangeIP = true;
      });

</script>

<main>

  {#await promise}
    <p style="margin-bottom:100px;">Connecting to server...</p>
    <Loading style="margin: 30px 0 0 42%;" withOverlay={false} />
  {:then}
    {#if ($curPageMode === PAGEMODE_HELPDOCS)}
      <PageHelp/>
    {:else if ($curPageMode === PAGEMODE_CONTROLS)}
      <PageControls/>
    {:else if ($curPageMode === PAGEMODE_DEVICES)}
      <PageDevices/>
    {/if}
  {/await}

</main>
