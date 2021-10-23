<script>

  import {
    Loading,
    Modal,
    Form,
    FormGroup,
    TextInput,
    Button,
    ButtonSet
  } from "carbon-components-svelte";

  import {
    MSECS_CHECK_TIMEOUT,
    MSECS_WAIT_CONNECTION,
    mqttBrokerIP,
    mqttBrokerFail,
    isConnected,
    deviceList
  } from './globals.js';

  import { storeBrokerWrite } from './browser.js';
  import { mqttConnect } from './mqtt.js';

  import HeaderDevices from './HeaderDevices.svelte';
  import ScanDevice from './ScanDevice.svelte';

  // when start this page, start "spinner" if:
  // 1) no valid brokerIP or devices in list
  // 2) just connected for first time (same as #1)
  // 3) returned from Controls after error or disconnect
  // but not if just returned from Controls or Docs normally

  let title;
  $: title = $isConnected ? `Connected (${$mqttBrokerIP})` : scanning ? 'Connecting...' : 'Disconnected';

  let scanning = false;
  let openForm = false;
  let openError = false;
  let waitcount;

  function doscan()
  {
    scanning = true;
    mqttConnect();

    waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
    docheck();
  }

  const docheck = () =>
  {
    if ($mqttBrokerFail === true)
    {
      scanning = false;
      openError = true;
    }
    // stop spinner if have device(s) or timeout
    else if (($deviceList.length > 0) || (--waitcount <= 0))
    {
      scanning = false;
      if (!$mqttBrokerFail) storeBrokerWrite();
    }
    else setTimeout(docheck, MSECS_CHECK_TIMEOUT);
  }

  const doretry = () =>
  {
    $mqttBrokerFail = false;
    doscan();
  }

  const dochange = () => { openForm = true; }

  const setaddr = () =>
  {
    openForm = false;
    $mqttBrokerFail = false;
    doscan();
  }

  if ($mqttBrokerIP === '') dochange();

  else if (!$isConnected || ($deviceList.length < 1))
    doscan();

</script>

<HeaderDevices/>

<div class="panel">

  <div class="scanbox">
    <p style="margin-bottom:15px;">{title}</p>
    {#if scanning }
      <Loading style="margin-left:42%;" withOverlay={false} />
    {:else}
      <button
        style="width:100px;"
        on:click={dochange}
        class="button"
        >Change
    </button>
      <button
        style="width:100px; margin-left:10px;"
        on:click={doretry}
        class="button"
        disabled={$isConnected}
        >Retry
    </button>
    {/if}
  </div>

  <p class="active">Available Devices:</p>

  <div class="listbox">
    {#each $deviceList as device }
      {#if !device.failed }
        <div class="listitem">
          <ScanDevice {device} />
        </div>
      {/if}
    {/each}
  </div>

  <div class="divider"></div>
</div>

<Modal
  passiveModal
  modalHeading="Connect to Message Server"
  bind:open={openForm}
  on:close
  >
  <Form on:submit={setaddr} >
    <FormGroup>
      <TextInput
        labelText="IP Address"
        bind:value={$mqttBrokerIP}
      />
    </FormGroup>
    <ButtonSet>
      <Button kind="secondary" on:click={() => {openForm = false;}}>Cancel</Button>
      <Button type="submit">Connect</Button>
    </ButtonSet>
  </Form>
</Modal>

<Modal
  passiveModal
  modalHeading={"Connection Failed"}
  bind:open={openError}
  on:close
  >
  <p>No Message Broker found at {$mqttBrokerIP}.</p><br>
  <Button kind="secondary" on:click={() => {openError = false; openForm = true;}}>Continue</Button>
</Modal>

<style>
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
    margin-top: 20px;
    padding: 8px;
    font-size:1.15em;
  }
  .divider {
    margin-top: 20px;
    padding-top: 5px;
    background-color: var(--bg-color-divider);
  }
</style>
