<script>

  import { Grid, Row, Checkbox } from "carbon-components-svelte";
  import { nStrands, eStrands, curStrandID } from './globals.js'

  let overwrite = false;

  const checkenables = () =>
  {
    for (let i = 0; i < $nStrands; ++i)
    {
      if (!overwrite && $eStrands[i] && ($curStrandID != i))
      {
        $eStrands[$curStrandID] = false;
        curStrandID.set(i);
        break; // just one switch
      }
      else if (overwrite && !$eStrands[i] && ($curStrandID == i))
      {
        // disabled what was current strand, so set to first enabled one
        for (let j = 0; j < $nStrands; ++j)
        {
          if ($eStrands[j])
          {
            curStrandID.set(j);
            break;
          }
        }
      }
    }
  }

  const checkowrite = () =>
  {
    // must disable all but the current one

    if (!(overwrite = !overwrite))
    {
      for (let i = 0; i < $nStrands; ++i)
        $eStrands[i] = false;

      $eStrands[$curStrandID] = true;
    }
  }

</script>

<Grid>
  <Row>
    <p style="margin-right:17px;">Strands:</p>
    {#each $eStrands as _,n}
      <Checkbox on:check={checkenables} labelText={n+1} bind:checked={$eStrands[n]}/>
    {/each}
    <Checkbox on:check={checkowrite} labelText="Combine" />
  </Row>
</Grid>
