<script>

  import { Loading } from "carbon-components-svelte";

  import { devUpdate } from './globals.js';

  export let device;

  const moreinfo = () => { device.doshow = !device.doshow; }
  const doctrls = () => { device.start(device) }

</script>

<div class="devbox" class:expand={device.doshow}>
  {#if device.ready }
    <div on:click={moreinfo} class="devname" >{device.curname}</div>
    <button class="button"
      on:click={doctrls}
      >Controls
    </button>
  {:else if !device.ignore}
    <div class="devscan" >{device.curname}</div>
    <Loading style="display:inline-block; margin-left:20px;" small withOverlay={false} />
  {/if}
</div>
{#key $devUpdate}
  {#if device.doshow}
    <div class="infobox">
      <div>
        <span class="infotext1">Cmdlen={device.report.maxstrlen}</span>
        <span class="infotext1">Tracks={device.report.numtracks}</span>
        <span class="infotext1">Layers={device.report.numlayers}</span>
      </div>
      {#if (device.report.nplugins > 0 || device.report.npatterns > 0)}
        <div>
          <span class="infotext1">Custom Patterns={device.report.npatterns}</span>
          <span class="infotext1">Custom Effects={device.report.nplugins}</span>
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
              <span class="infotext2">Hue={strand.xt_hue}</span>
            </div>
            <div>
              <span class="infotext2">Delay={strand.delay}%</span>
              <span class="infotext2">White={strand.xt_white}%</span>
            </div>
            <div>
              <span class="infotext2">FirstPos={strand.first}</span>
              <span class="infotext2">Count={strand.xt_count}%</span>
            </div>
            {#if (strand.patname !== '')}
              <div class="pattern-name">
                <span>{strand.patname}:</span>
              </div>
            {/if}
            <div class="pattern-string">
              <span>{strand.patcmds}</span>
            </div>
          </div>          
        </div>
      {/each}
    </div>
  {/if}
{/key}

<style>
  .devbox {
    margin: 0 auto;
    text-align: left;
    width: 300px;
    padding: 12px 10px 10px 10px;
    color: var(--text-lines);
    background-color: var(--page-header);
  }
  .devbox.expand {
    border-bottom: 0;
  }
  .devscan {
    display: inline;
    padding: 2px;
    font-size:1.15em;
  }
  .devname {
    display: inline;
    padding: 2px;
    color: var(--text-names);
    font-size:1.15em;
  }
  .devname:hover {
    cursor: pointer;
    background-color: var(--panel-back);
  }
  .button {
    float: right;
    margin-top: -3px;
  }
  .infobox {
    margin: 0 auto;
    width: 300px;
    padding: 0 10px 10px 10px;
    color: var(--text-lines);
    background-color: var(--panel-back);
    border: 2px solid var(--page-border);
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
