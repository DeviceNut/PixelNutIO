<script>

  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  import {
    titleHelpDocs,
    PAGEMODE_DEVICES,
    curPageMode,
    prevPageMode,
    helpMenuOpen
  } from './globals.js';

  import UserOptions from './UserOptions.svelte';

  let prevPage;
  $: prevPage = ($prevPageMode == PAGEMODE_DEVICES) ? "Devices" : "Controls";

  let openOptions = false;
  const doshow = () => // must toggle it here because value is not reset from within component
  {
    openOptions = false;
    openOptions = true;
  }

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

<UserOptions {openOptions} />

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
