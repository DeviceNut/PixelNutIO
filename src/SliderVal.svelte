<script>

  import { Slider } from "carbon-components-svelte";

  export let name = "";
  export let min = 0;
  export let max = 100;
  export let cur = 0;
  export let disabled = undefined;
  export let onchange = 0;
  export let dolabels = false;

  // remove event parameter from call
  let dochange = () => { onchange(); }

  // on:change triggers twice per click !!

  let maxLabel = ' ';
  $: maxLabel = dolabels ? max : ' ';

</script>

<Slider style="margin-bottom:5px;"
  {disabled}
  {min} {max}
  bind:value={cur}
  minLabel={name}
  on:click={dochange}
  {maxLabel}
  hideTextInput
/>
