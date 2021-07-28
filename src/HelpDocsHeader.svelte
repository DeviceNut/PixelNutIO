<script>

  import { get } from 'svelte/store';

  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  import {
    titleHelpDocs,
    curPageMode,
    prevPageMode
  } from './globals.js';

  export let menuOpen;

  const goback = () => { curPageMode.set(get(prevPageMode)); }

</script>

<div class="header">
  <div style="padding-top:5px;"></div>

  <span style="cursor:pointer;" on:click={()=>{menuOpen = !menuOpen}}>
    <Menu32 style="float:left; margin-left:5px;"/>
  </span>

  <span class="title">{titleHelpDocs}</span>

  <button on:click={goback} class="button" >Controls &gt;&gt;</button>
</div>

<style>
  .header {
    height: 45px;
    text-align: center;
    background-color: var(--bg-color-header);
  }
  .title {
    display: inline-block;
    margin-top: 7px;
    color: var(--color-title);
    font-family:'Trebuchet MS';
    font-size:1.5em;
  }
  .button {
    float: right;
    margin-right: 10px;
    padding: 7px;
  }
</style>
