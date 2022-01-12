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
    mqttConnected,
    mqttChangeIP,
    deviceList,
    msgTitle,
    msgDesc
  } from './globals.js';

  import {
    storeBrokerRead,
    storeBrokerWrite
  } from './browser.js';

  import { mqttConnect } from './mqtt.js';

  import HeaderDevices from './HeaderDevices.svelte';
  import ScanDevice from './ScanDevice.svelte';

  // when start this page, start "spinner" if:
  // 1) no valid brokerIP or devices in list
  // 2) just connected for first time (same as #1)
  // 3) returned from Controls after error or disconnect
  // but not if just returned from Controls or Docs normally

  let title;
  $: title = $mqttConnected ? `Connected` : scanning ? 'Connecting...' : 'Disconnected';

  let scanning = false;
  let openForm = false;
  let openError = false;
  let waitcount;

  const docheck = () =>
  {
    console.log(`docheck: isconnected=${$mqttConnected}`);
    if ($deviceList.length > 0) // successful
    {
      scanning = false;

      if ($mqttChangeIP) storeBrokerWrite();
    }
    else if (--waitcount <= 0) // no devices found
    {
      scanning = false;
    }

    if (scanning) setTimeout(docheck, MSECS_CHECK_TIMEOUT);
  }

  function rescan()
  {
    console.log('rescan...');
    $mqttConnected = false;
    doscan();
  }

  function doscan()
  {
    console.log('doscan...');
    scanning = true;

    if (!$mqttConnected) mqttConnect();

    waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
    docheck();
  }

  const doretry = () =>
  {
    console.log('doretry...');
    openError = false;

    if (!$mqttChangeIP)
    {
      $mqttChangeIP = true;

      storeBrokerRead(); // retrieve from browser store
      if ($mqttBrokerIP !== '')
      {
        doscan();
        return;
      }
    }

    openForm = true;
  }

  if (!$mqttBrokerFail && !$mqttConnected)
  {
    console.log('starting PageDevices...');
    doscan();
  }

  $: {
    if ($mqttBrokerFail)
    {
      console.log('broker failed...');
      $mqttBrokerFail = false;
      scanning = false;
      openError = true;
    }
  }

  let openMessage;
  $: openMessage = $msgTitle !== '';

</script>

<HeaderDevices/>

<div class="panel">

  <div class="scanbox">
    <p style="margin-bottom:10px;">{title}</p>
    {#if scanning }
      <Loading style="margin: 25px 0 10px 42%;" withOverlay={false} />
    {:else if $mqttChangeIP }
      <button class="button"
        on:click={()=> {openForm = true;}}
        >Change
      </button>
      <button class="button"
        style="margin-left:10px;"
        on:click={doscan}
        disabled={$mqttConnected}
        >Retry
      </button>
    {/if}
  </div>

  <p class="active">Available Devices:</p>

  <div class="listbox">
    {#each $deviceList as device }
      {#if !device.ignore }
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
  <Form on:submit={() => {openForm = false; rescan();}} >
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
  <p>No Message Broker at {$mqttBrokerIP}.</p><br>
  <Button kind="secondary" on:click={doretry}>Continue</Button>
</Modal>

<Modal
  passiveModal
  modalHeading={$msgTitle}
  bind:open={openMessage}
  on:close
  >
  <p>{$msgDesc}</p><br>
  <Button kind="secondary" on:click={() => {openMessage = false; $msgTitle = '';}}>Continue</Button>
</Modal>

<style>
  .panel {
    max-width: 630px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--bg-color-panel);
  }
  .scanbox {
    margin-top: 30px;
  }
  .active {
    margin-top: 30px;
    margin-bottom: 10px;
    font-style: italic;
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
    width: 100px;
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
