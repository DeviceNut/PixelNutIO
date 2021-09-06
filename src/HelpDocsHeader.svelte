<script>

  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  import {
    titleHelpDocs,
    PAGEMODE_DEVICES,
    curPageMode,
    prevPageMode,
    docsMenuOpen
  } from './globals.js';

  import ModalLinks from './ModalLinks.svelte';

  let prevPage;
  $: prevPage = ($prevPageMode == PAGEMODE_DEVICES) ? "Devices" : "Controls";

  let openlinks = false;
  const dolinks = () => { openlinks = !openlinks; }

  const goback = () => { $curPageMode = $prevPageMode; }

</script>

<div class="header">

  <span style="cursor:pointer;" on:click={()=>{$docsMenuOpen = !$docsMenuOpen}}>
    <Menu32 style="float:left; margin-left:10px;"/>
  </span>

  <span class="title">{titleHelpDocs}</span>

  <button on:click={goback}  class="button" >{prevPage} &gt;&gt;</button>
  <button on:click={dolinks} class="button" >Links</button>
</div>

<ModalLinks {openlinks} />

<style>
  .header {
    height: 45px;
    padding-top: 5px;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .title {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    min-width: 250px;
    margin-top: 5px;
    color: var(--color-title);
    font-size:1.5em;
  }
  .button {
    float: right;
    margin-right: 10px;
    padding: 7px;
  }
</style>
