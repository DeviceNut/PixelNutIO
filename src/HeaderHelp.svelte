<script>

  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  import {
    titleHelpDocs,
    PAGEMODE_DEVICES,
    curPageMode,
    prevPageMode,
    helpMenuOpen
  } from './globals.js';

  let prevPage;
  $: prevPage = ($prevPageMode == PAGEMODE_DEVICES) ? "Devices" : "Controls";

  const goback = () => { $curPageMode = $prevPageMode; }

</script>

<div class="header">

  <span style="cursor:pointer;"
    on:click={()=>{$helpMenuOpen = !$helpMenuOpen}}>
    <Menu32 style="float:left; margin-left:10px;"/>
  </span>

  <span class="title">{titleHelpDocs}</span>

  <button class="button-rite"
    on:click={goback}
    >{prevPage} &gt;&gt;
  </button>
</div>

<style>
  .header {
    height: 45px;
    padding-top: 5px;
    text-align: center;
    background-color: var(--bgc-header);
  }
  .title {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    margin-top: 5px;
    color: var(--fgc-title);
    font-size:1.5em;
  }
  .button-rite {
    float: right;
    margin-right: 10px;
    padding: 7px;
  }
</style>
