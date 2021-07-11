<script>
  import { Grid, Row, Checkbox } from "carbon-components-svelte";
  import { nStrands, eStrands, curStrandID } from './globalVars.js'

  let overwrite = false;

  const checkenables = () =>
  {
    for (let i = 0; i < $nStrands; ++i)
    {
      if (!overwrite && $eStrands[i] && ($curStrandID != i))
      {
        $eStrands[$curStrandID] = false;
        curStrandID.set(i);
      }
    }
  }

  const checkowrite = () =>
  {
    if (!(overwrite = !overwrite))
    {
      let list = [];
      for (let i = 0; i < $nStrands; ++i)
        list.push(false);

      list[$curStrandID] = true;
      eStrands.set(list);
    }
  }

  </script>

<Grid>
  <Row>
    <p style="margin-right:17px;">Strands:</p>
    {#each $eStrands as _,n}
      <Checkbox on:check={checkenables} labelText={n+1} bind:checked={$eStrands[n]}/>
    {/each}
    <Checkbox on:check={checkowrite} labelText="Overwrite" />
  </Row>
</Grid>
