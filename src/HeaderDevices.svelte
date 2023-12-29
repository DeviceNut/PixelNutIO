<script>

  import {
    titleDevices,
    PAGEMODE_HELPDOCS,
    curPageMode,
    prevPageMode,
    selectBLE,
    selectBroker
  } from './globals.js';

  const dodocs = () =>
  {
    $prevPageMode = $curPageMode;
    $curPageMode = PAGEMODE_HELPDOCS;
  }

</script>

<div class="header">
  {#if !$selectBLE}
    <button class="button-left"
      on:click={()=>{$selectBroker = true}}
      >Configure
    </button>
  {/if}
  <span class="title">{titleDevices}</span>
  <button class="button-rite"
    on:click={dodocs}
    >Docs &gt;&gt;
  </button>
</div>

<style>
  .header {
    height: 45px;
    max-width: 630px;
    margin: 0 auto;
    text-align: center;
    background-color: var(--page-header);
  }
  .title {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    min-width: 250px;
    margin-top: 10px;
    font-size:1.5em;
    font-style: italic;
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
