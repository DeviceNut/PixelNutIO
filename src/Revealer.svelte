<script>
 
  import CaretUp32 from "carbon-icons-svelte/lib/CaretUp32";
  import CaretDown32 from "carbon-icons-svelte/lib/CaretDown32";

  export let name;
  export let num;
  export let isopen;

</script>

<span style="cursor:pointer;" on:click={()=>{isopen = !isopen}}>
  {#if isopen }
    <CaretUp32 style="float:left; margin:3px 0 0 -15px;"/>
  {:else}
    <CaretDown32 style="float:left; margin:0 0 3px -15px;"/>
  {/if}
  <button
    class="button"
    > {name} {num}
  </button>
</span>

<style>
  .button {
    padding: 5px;
    background-color: inherit;
    border: none;
    font-size: 1.1em;
  }
</style>