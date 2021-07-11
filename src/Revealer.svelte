<script>
 
  import CaretUp32 from "carbon-icons-svelte/lib/CaretUp32";
  import CaretDown32 from "carbon-icons-svelte/lib/CaretDown32";

  export let name = '';
  export let num = 0;
  export let isopen = false;

</script>

<span style="cursor:pointer;" on:click={()=>{isopen = !isopen}}>
  {#if isopen }
    <CaretUp32 style="float:left; margin: 3px 0 0 -15px;"/>
  {:else}
    <CaretDown32 style="float:left; margin: 0 0 3px -15px;"/>
  {/if}
  <button class="button"> {name} {num} </button>
</span>

<style>
  .button {
    margin: 0 0 0 8px;
    padding: 5px;
    cursor: pointer;
    font-size: 1.2em;
    border: none;
    color: white;
    background-color: inherit;
  }
</style>