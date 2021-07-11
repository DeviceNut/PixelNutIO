<script>

import { Dropdown } from "carbon-components-svelte";
  import { aPatterns, curPatternID } from './globalVars.js'
  import { newPatternID } from "./cmdsPatterns.js";

  const didselect = () => { newPatternID(); }
  let n = $curPatternID;

</script>

<Dropdown
  type="inline"
  titleText=""
  on:select={didselect}
  bind:selectedIndex={$curPatternID}
  bind:items={$aPatterns}
/>
