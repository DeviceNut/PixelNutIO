<script>

  import { PAGEMODE_CONTROLS, curPageMode } from './globals.js';
  import { strandsDeviceSetup } from './strands.js';

  export let device;

  let showinfo = false;
  const moreinfo = () => {
    showinfo = !showinfo;
  }

  const doctrls = () => {
    console.log(`Connect to device ${device.name}`);
    strandsDeviceSetup(device);
    curPageMode.set(PAGEMODE_CONTROLS);
  }

</script>

<div class="devbox" class:expand={showinfo}>
  <div    on:click={moreinfo}  class="devname" >{device.name}</div>
  <button on:click={doctrls} class="button" >Controls</button>
</div>
{#if showinfo }
  <div class="infobox">
    <div class="infotext" >Strands: {device.scount}</div>
    <div class="infotext" >Pixels: {device.maxpixs}</div>
  </div>
{/if}

<style>
  .devbox {
    margin: 0 auto;
    text-align: left;
    width: 300px;
    padding: 10px;
    color: var(--color-devicename);
    background-color: var(--bg-color-textbox);
    border: 1px solid var(--color-textbox);
  }
  .devbox.expand {
    border-bottom: 0;
  }
  .devname {
    display: inline;
    padding: 5px;
    font-size:1.15em;
  }
  .devname:hover {
    cursor: pointer;
    background-color: var(--bg-color-button-hover);
  }
  .button {
    float: right;
    margin-top: -3px;
  }
  .infobox {
    margin: 0 auto;
    width: 300px;
    height: 100px;
    padding: 10px;
    color: var(--color-devicename);
    background-color: var(--bg-color-dropdown);
    border: 1px solid var(--color-textbox);
    border-top: 0;
    text-align: left;
    font-size:0.9em;
  }
  .infotext {
  }
</style>
