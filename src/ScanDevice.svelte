<script>

  import { Loading } from "carbon-components-svelte";

  import { devUpdate } from './globals.js';

  export let device;

  const moreinfo = () =>
  {
    device.doshow = !device.doshow;
    if (device.doshow && device.doquery)
    {
      device.doquery = false;
      device.query(device);
    }
  }
  const doctrls  = () => { device.start(device) }
  const dostop   = () => { device.stop(device) }

</script>

<div class="devbox" class:expand={device.doshow}
  on:click={moreinfo}
  >
  <button class="button-left"
    disabled={!device.ready}
    on:click={dostop}
    >X
  </button>
  {#if device.ready }
    <div class="namebox">
      <div class="devname" >{device.curname}</div>
    </div>
  {:else}
    <Loading style="display:inline-block; margin-top:7px;" small withOverlay={false} />
  {/if}
  <button class="button-rite"
    disabled={!device.ready}
    on:click={doctrls}
    >&gt;&gt;
  </button>
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
              <span>{strand.patstr}</span>
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
    height: 30px;
    max-width: 400px;
    color: var(--text-lines);
    background-color: var(--page-header);
  }
  .devbox:hover {
    cursor: pointer;
  }
  .devbox.expand {
    border-bottom: 0;
  }
  .namebox {
    display: inline;
  }
  .namebox:hover {
    cursor: pointer;
    background-color: var(--btn-back-selected);
  }
  .devname {
    float: left;
    padding-top: 7px;
    color: var(--text-names);
    font-size: 1.2em;
  }
  .button-left {
    float: left;
    margin-right: 15px;
    width: 30px;
    height: 30px;
    border: none;
    z-index: 2;
  }
  .button-rite {
    float: right;
    width: 40px;
    height: 30px;
    border: none;
    z-index: 2;
  }
  .infobox {
    margin: 0 auto;
    max-width: 400px;
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
