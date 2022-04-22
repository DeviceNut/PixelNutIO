<script>

  import {
    Loading,
    Modal,
    Form,
    FormGroup,
    TextInput,
    Checkbox,
    ButtonSet,
    Button
  } from "carbon-components-svelte";

  import {
    MSECS_CHECK_TIMEOUT,
    MSECS_WAIT_CONNECTION,
    MSECS_WAIT_DEVICES,
    selectBroker,
    ipAddrServer,
    ipAddrBrowser,
    ipAddrBroker,
    mqttConnected,
    mqttConnFail,
    deviceList,
    msgTitle,
    msgDesc
  } from './globals.js';

  import { storeBrokerWrite } from './browser.js';

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

  let openMessage;
  $: openMessage = $msgTitle !== '';

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
          mqttConnect($ipAddrBroker);

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
          waitcount = (MSECS_WAIT_DEVICES / MSECS_CHECK_TIMEOUT);
        }
        //else console.log('Waiting on connection...')
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

  function clearfail()
  {
    openError = false;
    $mqttConnFail = false;
  }

  function doscan()
  {
    clearfail();

    mqttDisconnect();
    waitstate = WAITSTATE_DISCONNECT;

    scanning = true;
    waitcount = (MSECS_WAIT_CONNECTION / MSECS_CHECK_TIMEOUT);
    waitfor();
  }

  if (!$mqttConnFail && !$mqttConnected)
    doscan();

  $: {
    if ($mqttConnFail)
    {
      scanning = false;
      openError = true;
    }
  }

  let openbroker = false;
  let saveaddr = false;
  let brokerip;

  $: {
    if ($selectBroker)
    {
      $selectBroker = false; 
      brokerip = $ipAddrBroker;
      openbroker = true;
    }
  }

  function rescan()
  {
    openbroker = false;
    $ipAddrBroker = brokerip;
    console.log(`broker IP <= ${brokerip}`);

    if (saveaddr)
    {
      saveaddr = false;
      $ipAddrBrowser = brokerip;
      storeBrokerWrite();
    }

    doscan();
  }

</script>

<div class="page">

  <HeaderDevices/>

  <div class="scanbox">
    <p style="margin-bottom:10px;">{title}</p>
    {#if !scanning && !$mqttConnected }
      <button class="button"
        style="margin-left:10px;"
        on:click={doscan}
        >Reconnect
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

  {#if scanning }
    <Loading style="margin: 25px 0 10px 42%;" withOverlay={false} />
  {/if}
  <div class="divider"></div>
</div>

<Modal
  size="sm"
  passiveModal
  preventCloseOnClickOutside
  modalHeading={$msgTitle}
  bind:open={openMessage}
  on:close
  >
  <p>{$msgDesc}</p><br>
  <Button kind="secondary" on:click={()=> {openMessage=false; $msgTitle='';}}>Continue</Button>
</Modal>

<Modal
  size="sm"
  passiveModal
  preventCloseOnClickOutside
  modalHeading={"Connection Failed"}
  bind:open={openError}
  on:close
  >
  <p>No PixelNut Hub found, retry again later.</p><br>
  <Button kind="secondary" on:click={clearfail}>Continue</Button>
</Modal>

<Modal
passiveModal
preventCloseOnClickOutside
modalHeading="Select Hub Address"
bind:open={openbroker}
on:close
>
  <Form on:submit={rescan} >
    <FormGroup>

      <ButtonSet>
        <Button
          kind="ghost"
          on:click={()=>{brokerip = $ipAddrServer}}
          disabled={brokerip === $ipAddrServer}
          >Server
        </Button>
        <Button
          kind="ghost"
          on:click={()=>{brokerip = $ipAddrBrowser}}
          disabled={$ipAddrBrowser === '' || brokerip === $ipAddrBrowser}
          >Saved
        </Button>
      </ButtonSet>
  
      <div style="margin-top:20px;"></div>
      <TextInput bind:value={brokerip} />
    </FormGroup>

    <Checkbox
      labelText="Save address to browser"
      style="margin-top:-7px; margin-bottom:20px;"
      bind:checked={saveaddr}
      disabled={brokerip === '' || brokerip === $ipAddrBrowser}
      />
    <ButtonSet>
      <Button type="submit" disabled={brokerip === ''}>Connect</Button>
      <Button kind="secondary" on:click={() => {openbroker = false;}}>Cancel</Button>
    </ButtonSet>

  </Form>
</Modal>

<style>
  .page {
    max-width: 630px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--page-back);
    border: 2px solid var(--page-border);
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
    margin: 0 auto;
    padding-bottom: 20px;
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
    background-color: var(--page-border);
  }
</style>
