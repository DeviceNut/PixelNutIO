<script>

  import { Loading } from "carbon-components-svelte";
  import DevicesHeader from "./DevicesHeader.svelte"
  import ScanDevice from "./ScanDevice.svelte"

  export let devlist = [ '1', '2' ];

  let scanning = false;
  const doscan = () => {
    scanning = true;
    setTimeout(() => {  scanning = false; }, 3000);
  }

</script>

<main>
  <DevicesHeader/>

  <div class="panel">

    <div class="scanbox">
      {#if scanning }
        <div style="padding-top:30px;"></div>
        <Loading style="margin-left:42%;" withOverlay={false} />
      {:else}
        <button on:click={doscan} class="button" >Rescan</button>
      {/if}
    </div>

    <p class="active">Active Devices:</p>

    <div class="listbox">
      {#each devlist as device }
      <div class="listitem">
        <ScanDevice {device} />
      </div>
      {/each}
    </div>

    <div class="divider"></div>
  </div>

</main>

<style>
  main {
    min-width: 320px;
  }
  .panel {
    max-width: 550px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--bg-color-panel);
  }
  .active {
    margin: 10px 0 10px 0;
    font-style: italic;
  }
  .scanbox {
    min-height: 130px;
  }
  .listbox {
    max-width: 400px;
    margin: 0 auto;
    padding-bottom: 20px;
    background-color: var(--bg-color-controls-area);
  }
  .listitem {
    padding-top: 20px;
  }
  .button {
    margin-top: 30px;
    padding: 8px;
    font-size:1.15em;
  }
  .divider {
    margin-top: 20px;
    padding-top: 5px;
    background-color: var(--bg-color-divider);
  }
</style>
