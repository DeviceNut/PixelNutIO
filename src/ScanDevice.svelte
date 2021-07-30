<script>

  import { PAGEMODE_CONTROLS, curPageMode } from './globals.js';

  export let device;

  let name = '1234567890123456 ...';
  let info = 'alsdfl;kjsd flsajd fsdf';

  let showinfo = false;
  const moreinfo = () => {
    showinfo = !showinfo;
  }

  const doconnect = () => {
    console.log('device=', device);
    curPageMode.set(PAGEMODE_CONTROLS);
  }

</script>

<div class="devbox" class:expand={showinfo}>
  <div    on:click={moreinfo}  class="devname" >{name}</div>
  <button on:click={doconnect} class="button" >Connect</button>
</div>
{#if showinfo }
  <div class="infobox">
    <div class="infotext" >{info}</div>
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
