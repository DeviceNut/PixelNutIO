<script>
  import { Slider } from "carbon-components-svelte";
  export let name = "";
  export let maxval = 100;
  export let curval = 50;
  export let disabled = undefined;
</script>

<Slider
  {disabled}
  min={0}
  max={maxval}
  value={curval}
  minLabel={name}
  maxLabel=" "
  hideTextInput
/>
