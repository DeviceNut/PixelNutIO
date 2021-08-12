<script>

  import { get } from 'svelte/store';
  import { Loading } from "carbon-components-svelte";

  import { isConnected, deviceList } from './globals.js';
  import { mqttConnect } from './mqtt.js';

  import DevicesHeader from './DevicesHeader.svelte';
  import ScanDevice from './ScanDevice.svelte';

  let MSECS_CHECK_TIMEOUT = 800;
  let scanning = false;
  let connected;
  let title;

  $: connected = get(isConnected);
  $: title = connected ? 'Connected' : scanning ? 'Connecting...' : 'Disconnected';

  // when start this page, start "spinner" if:
  // 1) no devices in list
  // 2) just connected for first time (same as #1)
  // 3) returned from Controls after error or disconnect
  // but not if just returned from Controls or Docs normally

  const docheck = () =>
  {
    // wait until get at least one device before stop spinner
    if (get(deviceList).length > 0) scanning = false;

    else setTimeout(docheck, MSECS_CHECK_TIMEOUT);
  }

  const doscan = () =>
  {
    scanning = true;

    if (!connected) mqttConnect();

    docheck();
  }

  if (!connected || (get(deviceList).length < 1))
    doscan();

</script>

<main>
  <DevicesHeader/>

  <div class="panel">

    <div class="scanbox">
      <p style="margin-bottom:15px;">{title}</p>
      {#if scanning }
        <Loading style="margin-left:42%;" withOverlay={false} />
      {:else}
        <button on:click={doscan} class="button" >Reconnect</button>
      {/if}
    </div>

    <p class="active">Available Devices:</p>

    <div class="listbox">
      {#each $deviceList as device }
        <div class="listitem">
          <ScanDevice {device} />
        </div>
      {/each}
    </div>

    <div class="divider"></div>
  </div>

</main>

<style>
  main {
    min-width: 320px;
  }
  .panel {
    max-width: 550px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--bg-color-panel);
  }
  .active {
    margin: 10px 0 10px 0;
    font-style: italic;
  }
  .scanbox {
    min-height: 160px;
    padding-top: 30px;
  }
  .listbox {
    max-width: 400px;
    margin: 0 auto;
    padding-bottom: 20px;
    background-color: var(--bg-color-controls-area);
  }
  .listitem {
    padding-top: 20px;
  }
  .button {
    margin-top: 30px;
    padding: 8px;
    font-size:1.15em;
  }
  .divider {
    margin-top: 20px;
    padding-top: 5px;
    background-color: var(--bg-color-divider);
  }
</style>
