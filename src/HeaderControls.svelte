<script>

  import MediaQuery from "svelte-media-query";

  import {
    Modal,
    Button
  } from "carbon-components-svelte";

  import {
    defDeviceName,
    PAGEMODE_DEVICES,
    PAGEMODE_HELPDOCS,
    curPageMode,
    prevPageMode,
    curDevice,
    selectSource,
    selectPattern
   } from './globals.js';

  import {
    userSetDevname,
    userSendPause
  } from './cmduser.js';

  import ModalLinks from './ModalLinks.svelte';

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

  let isPaused = false;
  let textPause = '';
  $: textPause = (isPaused ? 'Resume' : 'Pause');
  const dopause = () => { userSendPause(isPaused = !isPaused); }

  let openlinks = false;
  const dolinks = () => { openlinks = !openlinks; }

  const dodevs = () =>
  {
    $curPageMode = PAGEMODE_DEVICES;
  }
  const dodocs = () =>
  {
    $selectSource = false;  // prevent changing source
    $selectPattern = false; // or pattern when return

    $prevPageMode = $curPageMode;
    $curPageMode = PAGEMODE_HELPDOCS;
  }

</script>

<MediaQuery query="(max-width: 620px)" let:matches>
  {#if matches}
    <div class="header">
      <input
        class="title"
        size=32 maxlength=32
        on:change={setname}
        bind:value={devname}
      />
    </div>
    <div class="header2">
      <button on:click={dodevs}  class="button center" >&lt;&lt; Devices</button>
      <button on:click={dopause} class="button center" >{textPause}</button>
      <button on:click={dolinks} class="button center" >Links</button>
      <button on:click={dodocs}  class="button center" >Docs &gt;&gt;</button>
    </div>
  {/if}
</MediaQuery>
<MediaQuery query="(min-width: 621px)" let:matches>
  {#if matches }
    <div class="header">
      <button on:click={dodevs}  class="button left" >&lt;&lt; Devices</button>
      <button on:click={dopause} class="button left" >{textPause}</button>
      <input
        class="title"
        size=32 maxlength=32
        on:change={setname}
        bind:value={devname}
      />
      <button on:click={dodocs}  class="button rite" >Docs &gt;&gt;</button>
      <button on:click={dolinks} class="button rite" >Links</button>
    </div>
  {/if}
</MediaQuery>

<ModalLinks {openlinks} />

<Modal
  passiveModal
  modalHeading={"Setting Device Name"}
  bind:open={openError}
  on:close
  >
  <p>Cannot use chars `,/\ in device name.</p><br>
  <Button kind="secondary" on:click={() => {openError = false;}}>Continue</Button>
</Modal>

<style>
  .header {
    max-width: 625px;
    margin: 0 auto;
    height: 45px;
    padding: 2px 0 10px 0;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .header2 {
    height: 45px;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .title {
    margin: 5px 10px 0 10px;
    padding: 3px;
    color: var(--color-title);
    background-color: var(--bg-color-title);
    font-size:1.2em;
  }
  .button {
    margin-top: 3px;
    padding: 7px;
  }
  .button.center {
    margin: 5px;
  }
  .button.left {
    float: left;
    margin-left: 10px;
  }
  .button.rite {
    float: right;
    margin-right: 10px;
  }
</style>
