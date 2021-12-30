<script>

  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  import {
    titleHelpDocs,
    PAGEMODE_DEVICES,
    curPageMode,
    prevPageMode,
    helpMenuOpen
  } from './globals.js';

  import ModalLinks from './ModalLinks.svelte';

  let prevPage;
  $: prevPage = ($prevPageMode == PAGEMODE_DEVICES) ? "Devices" : "Controls";

  let openOptions = false;
  const doshow = () => { openOptions = !openOptions; }

  const goback = () => { $curPageMode = $prevPageMode; }

</script>

<div class="header">

  <span style="cursor:pointer;" on:click={()=>{$helpMenuOpen = !$helpMenuOpen}}>
    <Menu32 style="float:left; margin-left:10px;"/>
  </span>

  <button on:click={doshow} class="button-left" >Options</button>

  <span class="title">{titleHelpDocs}</span>

  <button on:click={goback}  class="button-rite" >{prevPage} &gt;&gt;</button>
</div>

<ModalLinks {openOptions} />

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
    margin-top: 5px;
    color: var(--color-title);
    font-size:1.5em;
  }
  .button-left {
    float: left;
    margin-left: 10px;
    padding: 7px;
  }
  .button-rite {
    float: right;
    margin-right: 10px;
    padding: 7px;
  }
</style>
