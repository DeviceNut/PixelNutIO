<script>

  import MediaQuery from "svelte-media-query";

  import { Modal, Button } from "carbon-components-svelte";

  import {
    defDeviceName,
    PAGEMODE_DEVICES,
    PAGEMODE_HELPDOCS,
    curPageMode,
    prevPageMode,
    curDevice,
    showColors,
    devPaused
   } from './globals.js';

  import { userSetDevname, userSendPause } from './cmdhead.js';

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

  let textPause = '';
  $: textPause = ($devPaused ? 'Resume' : 'Pause');
  const dopause = () => { userSendPause($devPaused = !$devPaused); }

  const dodevs = () =>
  {
    $curPageMode = PAGEMODE_DEVICES;
  }
  const dodocs = () =>
  {
    $prevPageMode = $curPageMode;
    $curPageMode = PAGEMODE_HELPDOCS;
  }

</script>

<MediaQuery query="(max-width: 700.999px)" let:matches>
  {#if matches}
    <div class="header">
      <input class="editname"
        size=32 maxlength=32
        on:change={setname}
        bind:value={devname}
      />
    </div>
    <div class="header2">

      <button class="button center"
        on:click={dodevs}
        >&lt;&lt; Devices
      </button>

      <button class="button center"
        on:click={()=>{$showColors = !$showColors}}
        >Colors
      </button>

      <button class="button center fixwidth"
        class:paused={$devPaused}
        on:click={dopause}
        >{textPause}
      </button>

      <button class="button center"
        on:click={dodocs}
        >Docs &gt;&gt;
      </button>

    </div>
  {/if}
</MediaQuery>
<MediaQuery query="(min-width: 701px)" let:matches>
  {#if matches }
    <div class="header">

      <button class="button left"
        on:click={dodevs}
        >&lt;&lt; Devices
      </button>

      <button class="button left"
        on:click={()=>{$showColors = !$showColors}}
        >Colors
      </button>

      <input class="editname"
        size=32 maxlength=32
        on:change={setname}
        bind:value={devname}
      />

      <button class="button rite"
        on:click={dodocs}
        >Docs &gt;&gt;
      </button>

      <button class="button rite fixwidth"
        class:paused={$devPaused}
        on:click={dopause}
        >{textPause}
      </button>

      </div>
  {/if}
</MediaQuery>

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
    padding: 2px 0 10px 0;
    text-align: center;
    background-color: var(--page-header);
  }
  .header2 {
    height: 45px;
    text-align: center;
    background-color: var(--page-header);
  }
  .editname {
    margin: 5px 5px 0 5px;
    padding: 3px;
    color: var(--text-names);
    background-color: var(--panel-back);
    font-size:1.2em;
  }
  .button {
    margin-top: 3px;
    padding: 7px;
  }
  .button.center {
    margin: 3px;
  }
  .button.left {
    float: left;
    margin-left: 7px;
  }
  .button.rite {
    float: right;
    margin-right: 7px;
  }
  .button.fixwidth {
    width: 63px;
  }
  .button.paused {
    background-color: var(--btn-back-enabled);
    border: 2px solid var(--btn-bord-enabled);
  }
</style>
