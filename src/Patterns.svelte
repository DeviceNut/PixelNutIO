<script>
  import { Dropdown } from "carbon-components-svelte";
  import { aPatterns, patternID } from './globalVars.js'
  import { sendPattern } from "./pixCmds.js";

  const didselect = () => { sendPattern($patternID); }
</script>

<Dropdown
  type="inline"
  titleText="Pattern:"
  on:select={didselect}
  bind:selectedIndex={$patternID}
  bind:items={$aPatterns}
/>
