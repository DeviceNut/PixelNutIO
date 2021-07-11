<script>
  import { Dropdown } from "carbon-components-svelte";
  import { aEffectsPre } from './globalVars.js'
</script>

<Dropdown
  type="inline"
  titleText="Effect:"
  selectedIndex={0}
  bind:items={$aEffectsPre}
/>
