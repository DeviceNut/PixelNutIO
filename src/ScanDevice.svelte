<script>

  import { Loading } from "carbon-components-svelte";
  import { deviceStartup } from './devstart.js';

  export let device;

  let showinfo = false;
  const moreinfo = () => { showinfo = !showinfo; }

  const doctrls = () => { deviceStartup(device) }

</script>

<div class="devbox" class:expand={showinfo}>
  {#if device.ready }
    <div on:click={moreinfo} class="devname" >{device.curname}</div>
    <button class="button"
      on:click={doctrls}
      >Controls
    </button>
  {:else}
    <div class="devscan" >{device.curname}</div>
    <Loading style="display:inline-block; margin-left: 20px;" small withOverlay={false} />
  {/if}
</div>
{#if showinfo }
  <div class="infobox">
    <div>
      <span class="infotext1">Cmdlen={device.report.maxstrlen}</span>
      <span class="infotext1">Tracks={device.report.numtracks}</span>
      <span class="infotext1">Layers={device.report.numlayers}</span>
    </div>
    {#if (device.report.nplugins > 0 || device.report.npatterns > 0)}
      <div>
        <span class="infotext1">Custom Effects={device.report.nplugins}</span>
        <span class="infotext1">Custom Patterns={device.report.npatterns}</span>
      </div>
    {/if}
    {#each device.report.strands as strand,i }
      <div style="margin-top:10px;">
        <span class="strand">Strand: {i+1}</span>
        <div style="margin-top:5px; margin-left:10px;">
          <div>
            <span class="infotext2">Pixels={strand.pixels}</span>
            <span class="infotext2">Override={strand.xt_mode ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span class="infotext2">Bright={strand.bright}%</span>
            <span class="infotext2" class:disprops={!strand.xt_mode}>Hue={strand.xt_hue}</span>
          </div>
          <div>
            <span class="infotext2">Delay={strand.delay}%</span>
            <span class="infotext2" class:disprops={!strand.xt_mode}>White={strand.xt_white}%</span>
          </div>
          <div>
            <span class="infotext2">FirstPos={strand.first}</span>
            <span class="infotext2" class:disprops={!strand.xt_mode}>Count={strand.xt_count}%</span>
          </div>
          {#if (strand.patname !== '')}
            <div class="pattern-name">
              <span>{strand.patname}:</span>
            </div>
          {/if}
          <div class="pattern-string">
            <span>{strand.patstr}</span>
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
  .devscan {
    display: inline;
    padding: 5px;
    font-size:1.15em;
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
    padding: 0 10px 10px 10px;
    color: var(--color-devicename);
    background-color: var(--bg-color-dropdown);
    border: 1px solid var(--color-textbox);
    border-top: 0;
    text-align: left;
    font-size: 0.9em;
  }
  .infotext1 {
    display: inline-block;
    margin-top: 10px;
    margin-right: 10px;
  }
  .infotext2 {
    display: inline-block;
    margin-top: 5px;
    width: 120px;
  }
  .disprops {
    color: var(--color-text-disabled);
  }
  .strand {
    font-style: italic;
  }
  .pattern-name {
    margin-top: 10px;
  }
  .pattern-string {
    margin-top: 10px;
    font-size: 0.8em;
  }
</style>
