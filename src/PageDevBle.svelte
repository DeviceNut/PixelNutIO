<script>

  import {
    Loading,
  } from "carbon-components-svelte";

  import {
    curDevice,
    deviceList,
  } from './globals.js';

  import {
    bleRequest,
    bleConnect,
    bleSetup,
  } from './ble.js';

  import HeaderDevices from './HeaderDevices.svelte';
  import ScanDevice from './ScanDevice.svelte';

  let scanning = false;
  let scanmesg = '';

  const doBlue = async () =>
  {
    scanning = true;
    scanmesg = 'Scanning for devices...';
    const success = await bleRequest();

    if (success)
    {
      scanmesg = 'Connecting to device...';
      await bleConnect();
      scanning = false;

      if ($deviceList.length)
      {
        await bleSetup($deviceList[0]);
        $deviceList = $deviceList; // make reactive
      }
    }
    else scanning = false;
  }

  if ($curDevice && $curDevice.doquery)
  {
    $curDevice.doquery = false;
    $curDevice.query($curDevice);
  }

</script>

<div class="page">

  <HeaderDevices/>

  <div class="controls">

    {#if scanning }
      <p>{scanmesg}</p>
      <Loading style="margin: 25px 0 10px 42%;" withOverlay={false} />
    {:else}
      <!-- TODO: disable if any device query is active -->
      <button class="button"
        on:click={doBlue}
        >Select Bluetooth Device
      </button>
    {/if}

    {#if $deviceList.length}
      <div style="margin-top:50px;">
        <ScanDevice device={$deviceList[0]} />
      </div>
    {/if}
  </div>

</div>

<style>
  .page {
    max-width: 630px;
    min-height: 400px;
    margin: 0 auto;
    padding: 5px;
    text-align: center;
    background-color: var(--page-back);
    border: 2px solid var(--page-border);
  }
  .controls {
    margin: 50px 0 30px 0;
  }
  .button {
    padding: 10px;
    font-size:1.1em;
  }
</style>
