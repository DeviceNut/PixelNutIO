<script>
 
  import CaretUp32 from "carbon-icons-svelte/lib/CaretUp32";
  import CaretDown32 from "carbon-icons-svelte/lib/CaretDown32";

  export let name;
  export let isopen;

</script>

<div style="cursor:pointer;" on:click={()=>{isopen = !isopen}}>
  {#if isopen }
    <CaretUp32 style="float:left; margin:4px 0 0 -15px;"/>
  {:else}
    <CaretDown32 style="float:left; margin:3px 0 3px -15px;"/>
  {/if}
  <button class="button"> {name} </button>
</div>

<style>
  .button {
    border: none;
    padding: 5px;
    margin-top: 3px;
    background-color: inherit;
    font-size: 1.1em;
  }
</style>