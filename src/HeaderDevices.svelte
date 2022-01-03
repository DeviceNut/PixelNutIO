<script>

  import {
    titleDevices,
    PAGEMODE_HELPDOCS,
    curPageMode,
    prevPageMode
  } from './globals.js';

  import UserOptions from './UserOptions.svelte';

  let openOptions = false;
  const doshow = () => // must toggle it here because value is not reset from within component
  {
    openOptions = false;
    openOptions = true;
  }

  const dodocs = () =>
  {
    $prevPageMode = $curPageMode;
    $curPageMode = PAGEMODE_HELPDOCS;
  }

</script>

<div class="header">
  <button class="button-left"
    on:click={doshow}
    >Options
  </button>
  <span class="title">{titleDevices}</span>
  <button class="button-rite"
    on:click={dodocs}
    >Docs &gt;&gt;
  </button>
</div>

<UserOptions {openOptions} />

<style>
  .header {
    height: 45px;
    max-width: 630px;
    margin: 0 auto;
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
  .button-left {
    float: left;
    margin-top: 5px;
    margin-left: 10px;
    padding: 7px;
  }
  .button-rite {
    float: right;
    margin-top: 5px;
    margin-right: 10px;
    padding: 7px;
  }
</style>
