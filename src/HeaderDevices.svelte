<script>

  import {
    titleDevices,
    PAGEMODE_HELPDOCS,
    curPageMode,
    prevPageMode
  } from './globals.js';

  import ModalLinks from './ModalLinks.svelte';

  let openlinks = false;
  const dolinks = () => { openlinks = !openlinks; }

  const dodocs = () =>
  {
    $prevPageMode = $curPageMode;
    $curPageMode = PAGEMODE_HELPDOCS;
  }

</script>

<div class="header">
  <span class="title">{titleDevices}</span>
  <button on:click={dodocs}  class="button" >Docs &gt;&gt;</button>
  <button on:click={dolinks} class="button" >Links</button>
</div>

<ModalLinks {openlinks} />

<style>
  .header {
    max-width: 625px;
    margin: 0 auto;
    height: 45px;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .title {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    min-width: 250px;
    margin-top: 10px;
    color: var(--color-title);
    font-size:1.5em;
  }
  .button {
    float: right;
    margin: 5px 10px 0 0;
    padding: 7px;
  }
</style>
