<script>

  import { Grid, Row, Checkbox } from "carbon-components-svelte";
  import { aStrands } from './globals.js'
  import { userStrandSelect, userStrandCombine } from './cmduser.js';

  let combine = false;

  const checkenables = () => { userStrandSelect(combine); }
  const checkowrite  = () => { userStrandCombine(combine = !combine); }

  // BUG in CheckBox: first box is lower vertically than the others !!!

</script>

<Grid>
  <Row>
    <p style="margin-right:17px;">Strands:</p>

    {#each $aStrands as _,n}
      <Checkbox labelText={n+1}
        on:check={checkenables}
        bind:checked={$aStrands[n].selected}
      />
    {/each}

    <Checkbox labelText="Combine"
      on:check={checkowrite}
    />
  </Row>
</Grid>
