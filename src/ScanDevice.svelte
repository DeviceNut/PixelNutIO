<script>

  import { PAGEMODE_CONTROLS, curPageMode } from './globals.js';
  import { strandsDeviceSetup } from './strands.js';

  export let device;

  let showinfo = false;
  const moreinfo = () => { showinfo = !showinfo; }

  const doctrls = () =>
  {
    console.log(`Connect to: "${device.name}"`);
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
    <div>
      <span class="infotext1">Cmdlen={device.report.maxlen}</span>
      <span class="infotext1">Tracks={device.report.numtracks}</span>
      <span class="infotext1">Layers={device.report.numlayers}</span>
    </div>
    {#each device.report.strands as strand,i }
      <div style="margin-top:10px;">
        <span class="strand">Strand: {i+1}</span>
        <div style="margin-top:5px; margin-left:10px;">
          <div>
            <span class="infotext2">Pixels={strand.pixels}</span>
            <span class="infotext2">Overrides:</span>
          </div>
          <div>
            <span class="infotext2">Bright={strand.bright}%</span>
            <span class="infotext2">Enabled={strand.xt_mode ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span class="infotext2">Delay={strand.delay}%</span>
            <span class="infotext2">Hue={strand.xt_hue}</span>
          </div>
          <div>
            <span class="infotext2">FirstPos={strand.first}</span>
            <span class="infotext2">White={strand.xt_white}%</span>
          </div>
          <div>
            <span class="infotext2">Direction={strand.direct ? 'Up' : 'Down'}</span>
            <span class="infotext2">Count={strand.xt_count}%</span>
          </div>
          <div class="pattern">
            <span>"{strand.pattern}"</span>
          </div>
        </div>          
      </div>
    {/each}
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
    padding: 10px;
    color: var(--color-devicename);
    background-color: var(--bg-color-dropdown);
    border: 1px solid var(--color-textbox);
    border-top: 0;
    text-align: left;
    font-size: 0.9em;
  }
  .infotext1 {
    display: inline-block;
    margin-top: 5px;
    margin-right: 10px;
  }
  .infotext2 {
    display: inline-block;
    margin-top: 5px;
    width: 120px;
  }
  .strand {
    font-style: italic;
  }
  .pattern {
    margin-top: 10px;
    font-size: 0.8em;
  }
</style>
