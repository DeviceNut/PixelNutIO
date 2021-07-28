<script>

  import { get } from 'svelte/store';

  import {
    titleDevices,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode,
    prevPageMode
  } from './globals.js';

  const dodocs = () =>
  {
    prevPageMode.set(get(curPageMode));
    curPageMode.set(PAGEMODE_HELPDOCS);
  }

</script>

<div class="header">
  <div style="padding-top:10px;"></div>
  <span class="title">{titleDevices}</span>
  <button on:click={dodocs}  class="button" >Docs &gt;&gt;</button>
</div>

<style>
  .header {
    height: 45px;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .title {
    color: var(--color-title);
    font-family:'Trebuchet MS';
    font-size:1.5em;
  }
  .button {
    float: right;
    margin-top: -5px;
    margin-right: 10px;
    padding: 7px;
  }
</style>
