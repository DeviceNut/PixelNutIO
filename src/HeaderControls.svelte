<script>

  import { Modal } from "carbon-components-svelte";
  import { userSetDevName, userSendPause } from "./cmduser.js"

  export let devname;

  const goback = () => { history.back() }

  let isPaused = false;
  let textPause = '';
  $: textPause = (isPaused ? 'Resume' : 'Pause');

  const dopause = () =>
  {
    userSendPause(isPaused = !isPaused);
  }

  let open = false;
  //const goweb = () =>  { window.open("https://www.devicenut.com", "_blank"); }
  const golinks = () =>  { open = !open; }

  const dodocs = () =>
  {
    console.log('Show Docs Page'); // TODO
  }

</script>

<div class="header">
  <button on:click={goback} class="button left" >&lt;&lt; Devices</button>
  <button on:click={dopause} class="button left" >{textPause}</button>
  <input
    class="title"
    size=32 maxlength=32
    on:change={userSetDevName}
    bind:value={devname}
  />
  <button on:click={dodocs}  class="button rite" >Docs &gt;&gt;</button>
  <button on:click={golinks} class="button rite" >Links</button>
</div>

<Modal
  bind:open
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
    padding: 2px 0 8px 0;
    height: 44px;
    text-align: center;
    background-color:#333433;
  }
  .title {
    margin: 3px 10px 0 10px;
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
    margin-right: 15px;
  }
  .button:hover {
    cursor: pointer;
    background-color:#444544;
  }
</style>
