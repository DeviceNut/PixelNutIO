<script>

  import { Slider } from "carbon-components-svelte";

  export let name = "";
  export let min = 0;
  export let max = 100;
  export let cur = 50;
  export let disabled = undefined;
  export let onchange = 0;

</script>

<Slider style="margin-bottom:5px;"
  {disabled}
  {min} {max}
  bind:value={cur}
  minLabel={name}
  on:click={onchange}
  maxLabel=" "
  hideTextInput
/>
