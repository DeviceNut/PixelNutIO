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
    mqttChangeIP,
    mqttBrokerIP,
    mqttConnected,
    mqttConnFail,
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

  let title;
  $: title = $mqttConnected ? `Connected` : scanning ? 'Connecting...' : 'Disconnected';

  let scanning = false;
  let openForm = false;
  let openError = false;
  let waitcount;

  const docheck = () =>
  {
    console.log('docheck');

    if ($mqttConnFail)
    {
      scanning = false;
    }
    else if ($mqttConnected)
    {
      scanning = false;

      if ($mqttChangeIP) storeBrokerWrite();
    }
    else if (--waitcount <= 0)
    {
      scanning = false;
      openForm = true;
    }

    else setTimeout(docheck, MSECS_CHECK_TIMEOUT);
  }

  function doscan()
  {
    console.log('doscan...');
    scanning = true;

    if (!$mqttConnected) mqttConnect();

    waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
    docheck();
  }

  let ipaddr = $mqttBrokerIP;
  function rescan()
  {
    console.log(`rescan: ${ipaddr}`);
    if (ipaddr !== '')
    {
      openForm = false;

      //if ($mqttBrokerIP !== ipaddr)
      {
        $mqttBrokerIP = ipaddr;
        $mqttConnected = false;
        doscan();
      }
    }
  }

  const doretry = () =>
  {
    console.log('doretry');
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
    ipaddr = $mqttBrokerIP;
    //$mqttBrokerIP = '';
  }

  if (!$mqttConnFail && !$mqttConnected)
  {
    console.log(`PageDevices: IP=${$mqttBrokerIP}`);
    if ($mqttBrokerIP === '') openForm = true;
    else doscan();
  }

  $: {
    if ($mqttConnFail)
    {
      console.log('broker failed...');

      $mqttConnFail = false;
      //$mqttBrokerIP = '';
      ipaddr = '';

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
    {:else}
      {#if $mqttChangeIP }
        <button class="button"
          on:click={()=> {openForm = true;}}
          >Change
        </button>
      {/if}
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

{#if $mqttChangeIP }
  <Modal
    passiveModal
    modalHeading="Connect to PixelNut Hub"
    bind:open={openForm}
    on:close
    >
    <Form on:submit={rescan} >
      <FormGroup>
        <TextInput
          labelText="Address"
          bind:value={ipaddr}
        />
      </FormGroup>
      <ButtonSet>
        <Button kind="secondary" on:click={() => {openForm = false;}}>Cancel</Button>
        {#if ipaddr !== '' }
          <Button type="submit">Connect</Button>
        {/if}
      </ButtonSet>
    </Form>
  </Modal>
{/if}

<Modal
  passiveModal
  modalHeading={"Connection Failed"}
  bind:open={openError}
  on:close
  >
  <p>No PixelNut Hub ({$mqttBrokerIP}).</p><br>
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
