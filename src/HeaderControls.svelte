<script>

  import { Modal, Button } from "carbon-components-svelte";

  import {
    defDeviceName,
    PAGEMODE_DEVICES,
    curPageMode,
    curDevice,
    showColors,
  } from './globals.js';

  import { userSetDevname } from './cmdhead.js';

  let openError = false;
  let devname = $curDevice.curname;
  const setname = () =>
  {
    if (devname === '') devname = defDeviceName;
    if (!userSetDevname(devname))
    {
      openError = true;
      devname = $curDevice.curname;
    }
  }

  const dodevs = () =>
  {
    $curDevice.doshow = false; // close info panel
    $curDevice.doquery = true; // force query when open
    $curPageMode = PAGEMODE_DEVICES;
  }

</script>

<div class="header">

  <button class="button left"
    on:click={dodevs}
    >&lt;&lt;
  </button>

  <input class="editname"
    on:change={setname}
    bind:value={devname}
  />

  <button class="button rite"
    on:click={()=>{$showColors = !$showColors}}
    >Colors
  </button>

</div>

<Modal
  size="sm"
  passiveModal
  preventCloseOnClickOutside
  modalHeading={"Setting Device Name"}
  bind:open={openError}
  on:close
  >
  <p>Cannot use chars `,/\ in device name.</p><br>
  <Button kind="secondary" on:click={() => {openError = false;}}>Continue</Button>
</Modal>

<style>
  .header {
    margin: 0 auto;
    height: 45px;
    text-align: center;
    background-color: var(--page-header);
  }
  .editname {
    max-width: 190px;
    margin-top: 5px;
    padding: 3px;
    color: var(--text-names);
    background-color: var(--panel-back);
    font-size:1.2em;
  }
  .button {
    margin-top: 3px;
    padding: 7px;
  }
  .button.left {
    float: left;
    margin-left: 7px;
  }
  .button.rite {
    float: right;
    margin-right: 7px;
  }
</style>
