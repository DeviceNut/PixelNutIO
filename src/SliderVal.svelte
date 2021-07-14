<script>

  import { Slider } from "carbon-components-svelte";

  export let name = "";
  export let min = 0;
  export let max = 100;
  export let cur = 0;
  export let disabled = undefined;
  export let dolabels = false;
  export let onchange;

  // remove event parameter from call
  let dochange = () => { onchange(); }

  // on:click doesn't always fire !!

  let maxLabel;
  $: maxLabel = dolabels ? max : ' ';

</script>

<Slider style="margin-bottom:5px;"
  {disabled}
  {min} {max}
  bind:value={cur}
  minLabel={name}
  on:change={dochange}
  {maxLabel}
  hideTextInput
/>
