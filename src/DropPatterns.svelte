<script>

import { Dropdown } from "carbon-components-svelte";
  import { aPatterns, curPatternID } from './globals.js'
  import { newPatternID } from "./patterns.js";

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
