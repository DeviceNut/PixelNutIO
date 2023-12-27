<script>

  import {
    Loading,
    Modal,
    Button
  } from "carbon-components-svelte";

  import {
    bleSupported,
    bleConnect,
  } from './ble-com.js';

  import HeaderDevices from './HeaderDevices.svelte';
  import ScanDevice from './ScanDevice.svelte';

  let haveBlue = false;
  let device = null;

  async function CheckForBlue()
  {
    haveBlue = await bleSupported();
  }
  CheckForBlue();

  const doBlue = async () =>
  {
    device = null;
    device = await bleConnect();
  }

</script>

<div class="page">

  <HeaderDevices/>

  {#if !haveBlue}
    <p>Bluetooth not supported in this browser</p>

  {:else if device}
    <ScanDevice {device} />

  {:else}
    <button class="button"
      style="margin-left:10px;"
      on:click={doBlue}
      >Select Bluetooth Device
    </button>
  {/if}
</div>

<style>
  .page {
    max-width: 630px;
    min-height: 400px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--page-back);
    border: 2px solid var(--page-border);
  }
  .button {
    margin: 50px 0 30px 0;
    padding: 10px;
    font-size:1.1em;
  }
  .divider {
    margin-top: 20px;
    padding-top: 5px;
    background-color: var(--page-border);
  }
</style>
