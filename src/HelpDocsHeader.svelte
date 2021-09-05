<script>

  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  import {
    titleHelpDocs,
    PAGEMODE_DEVICES,
    curPageMode,
    prevPageMode
  } from './globals.js';

  export let menuOpen;

  let prevPage;
  $: prevPage = ($prevPageMode == PAGEMODE_DEVICES) ? "Devices" : "Controls";

  const goback = () => { $curPageMode = $prevPageMode; }

</script>

<div class="header">
  <div style="padding-top:5px;"></div>

  <span style="cursor:pointer;" on:click={()=>{menuOpen = !menuOpen}}>
    <Menu32 style="float:left; margin-left:5px;"/>
  </span>

  <span class="title">{titleHelpDocs}</span>

  <button on:click={goback} class="button" >{prevPage} &gt;&gt;</button>
</div>

<style>
  .header {
    height: 45px;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .title {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    min-width: 250px;
    margin-top: 7px;
    color: var(--color-title);
    font-size:1.5em;
  }
  .button {
    float: right;
    margin-right: 10px;
    padding: 7px;
  }
</style>
