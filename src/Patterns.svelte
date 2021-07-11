<script>
  import { Dropdown } from "carbon-components-svelte";
  import { aPatterns, curPatternID } from './globalVars.js'
  import { sendPattern } from "./pixCmds.js";

  let didselect = () => { sendPattern($curPatternID); }
</script>

<Dropdown
  type="inline"
  titleText="Pattern:"
  on:select={didselect}
  bind:selectedIndex={$curPatternID}
  bind:items={$aPatterns}
/>
