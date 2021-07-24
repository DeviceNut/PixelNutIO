<script>

  import MediaQuery from "svelte-media-query";
  import { Modal } from "carbon-components-svelte";

  import { deviceName } from './globals.js';

  import {
    userSetDevName,
    userSendPause
  } from "./cmduser.js"

  const goback = () => { history.back() }

  let isPaused = false;
  let textPause = '';
  $: textPause = (isPaused ? 'Resume' : 'Pause');

  const dopause = () => { userSendPause(isPaused = !isPaused); }

  let openlinks = false;
  const dolinks = () =>
  {
    console.log('Show Links Modal'); // TODO
    openlinks = !openlinks;
  }

  let opendocs = false;
  const dodocs = () =>
  {
    console.log('Show Docs Page'); // TODO
    opendocs = !opendocs;
  }

</script>

<MediaQuery query="(max-width: 650px)" let:matches>
  {#if matches}
    <div class="header">
      <input
        class="title"
        size=32 maxlength=32
        on:change={userSetDevName}
        bind:value={$deviceName}
      />
    </div>
    <div class="header2">
      <button on:click={goback}  class="button left" >&lt;&lt; Devices</button>
      <button on:click={dopause} class="button left" >{textPause}</button>
      <button on:click={dodocs}  class="button rite" >Docs &gt;&gt;</button>
      <button on:click={dolinks} class="button rite" >Links</button>
    </div>
  {/if}
</MediaQuery>
<MediaQuery query="(min-width: 650px)" let:matches>
  {#if matches }
    <div class="header">
      <button on:click={goback} class="button left" >&lt;&lt; Devices</button>
      <button on:click={dopause} class="button left" >{textPause}</button>
      <input
        class="title"
        size=32 maxlength=32
        on:change={userSetDevName}
        bind:value={$deviceName}
      />
      <button on:click={dodocs}  class="button rite" >Docs &gt;&gt;</button>
      <button on:click={dolinks} class="button rite" >Links</button>
    </div>
  {/if}
</MediaQuery>

<Modal
  bind:openlinks
  passiveModal
  modalHeading={"Links to Code and Websites"}
  on:close
  >
  <p>Text for links paragraph 1.</p><br>
  <p>Text for links paragraph 2.</p><br>
  <p>Visit our website <a href="https://www.devicenut.com">here</a>.</p>
</Modal>

<style>
  .header {
    padding: 2px 0 10px 0;
    text-align: center;
    background-color:#333433;
  }
  .header2 {
    height: 45px;
    background-color:#333433;
  }
  .title {
    margin: 5px 10px 0 10px;
    padding: 3px;
    font-style:italic;
    font-family:'Trebuchet MS';
    font-size:1.2em;
    color: #33aa66;
    background-color:#555655;
  }
  .button {
    float: left;
    padding: 7px;
    margin-top: 3px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button.left {
    float: left;
    margin-left: 10px;
  }
  .button.rite {
    float: right;
    margin-right: 10px;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
</style>
