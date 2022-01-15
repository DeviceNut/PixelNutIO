<script>

  import {
    Loading,
    Modal,
    Button
  } from "carbon-components-svelte";

  import {
    MSECS_CHECK_TIMEOUT,
    MSECS_WAIT_CONNECTION,
    mqttBrokerIP,
    mqttConnected,
    mqttConnFail,
    deviceList,
    msgTitle,
    msgDesc
  } from './globals.js';

  import {
    mqttDisconnect,
    mqttConnect
  } from './mqtt.js';

  import HeaderDevices from './HeaderDevices.svelte';
  import ScanDevice from './ScanDevice.svelte';

  const WAITSTATE_NONE        = 0;
  const WAITSTATE_DISCONNECT  = 1;
  const WAITSTATE_CONNECTING  = 2;
  const WAITSTATE_DEVICES     = 3;
  let waitstate = WAITSTATE_NONE;

  let title;
  $: title = $mqttConnected ? `Connected` : scanning ? 'Connecting...' : 'Disconnected';

  let scanning = false;
  let openError = false;
  let waitcount;

  const waitfor = () =>
  {
    //console.log(`waitfor: state=${waitstate}`);

    if ($mqttConnFail)
    {
      scanning = false;
      waitstate = WAITSTATE_NONE;
      return;
    }

    let done = false;
    switch (waitstate)
    {
      case WAITSTATE_DISCONNECT:
      {
        if (!$mqttConnected)
        {
          mqttConnect($mqttBrokerIP);

          waitstate = WAITSTATE_CONNECTING;
          waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
        }
        //else console.log('Waiting on disconnection...')
        break;
      }
      case WAITSTATE_CONNECTING:
      {
        if ($mqttConnected)
        {
          //console.log('Now connected')

          waitstate = WAITSTATE_DEVICES;
          //waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
        }
        else console.log('Waiting on connection...')
        break;
      }
      case WAITSTATE_DEVICES:
      {
        if ($deviceList.length > 0)
        {
          waitstate = WAITSTATE_NONE;
          // wait one more cycle
        }
        //else console.log('Waiting for devices found...')
        break;
      }
      default:
      {
        done = true;
        break;        
      }
    }

    if (!done && (--waitcount <= 0))
      done = true;

    if (done) scanning = false;
    else setTimeout(waitfor, MSECS_CHECK_TIMEOUT);
  }

  function doscan()
  {
    mqttDisconnect();
    waitstate = WAITSTATE_DISCONNECT;

    scanning = true;
    waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
    waitfor();
  }

  function didfail()
  {
    openError = false;
    $mqttConnFail = false;
  }

  if (!$mqttConnFail && !$mqttConnected) doscan();

  $: {
    if ($mqttConnFail)
    {
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
    {:else if !$mqttConnected }
      <button class="button"
        style="margin-left:10px;"
        on:click={doscan}
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
  modalHeading={"Connection Failed"}
  bind:open={openError}
  on:close
  >
  <p>No PixelNut Hub found, retry again later.</p><br>
  <Button kind="secondary" on:click={didfail}>Continue</Button>
</Modal>

<Modal
  passiveModal
  modalHeading={$msgTitle}
  bind:open={openMessage}
  on:close
  >
  <p>{$msgDesc}</p><br>
  <Button kind="secondary" on:click={()=> {openMessage=false; $msgTitle='';}}>Continue</Button>
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
