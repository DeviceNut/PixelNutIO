<script>

  import { Slider } from "carbon-components-svelte";

  export let name = "";
  export let min = 0;
  export let max = 100;
  export let cur = 0;
  export let disabled = undefined;
  export let onchange = 0;
  export let dolabels = false;

  let minLabel = ' ';
  let maxLabel = ' ';

  $: maxLabel = dolabels ? max : ' ';

  let lastval = 0;
  const dochange = () =>
  {
    if (lastval != cur) // on:change fires on each click!!
    {
      lastval = cur;
      if (!disabled) onchange();
    }
  }

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
