<script>

  import { Grid, Row, Checkbox } from "carbon-components-svelte";
  import { aStrands } from './globals.js'
  import { userStrandSelect, userStrandCombine } from './cmduser.js';

  let combine = false;

  const checkenables = () => { userStrandSelect(combine); }
  const checkowrite  = () => { userStrandCombine(combine = !combine); }

</script>

<Grid>
  <Row style="margin-top:7px; margin-left:-10px;">
    <p style="margin-right:17px;">Strands:</p>

    {#each $aStrands as _,n}
      <Checkbox labelText={n+1}
        on:check={checkenables}
        bind:checked={$aStrands[n].selected}
      />
    {/each}

    <Checkbox labelText="Duplicate"
      on:check={checkowrite}
    />
  </Row>
</Grid>
