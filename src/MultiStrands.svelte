<script>

  import { Grid, Row, Checkbox } from "carbon-components-svelte";
  import { nStrands, aStrands, idStrand, pStrand } from './globals.js'

  let combine = false;

  const checkenables = () =>
  {
    for (let i = 0; i < $nStrands; ++i)
    {
      if (!combine && $aStrands[i].selected && ($idStrand != i))
      {
        idStrand.set(i);
        $pStrand.selected = false;
        pStrand.set($aStrands[i]);
        break; // just one switch
      }
      else if (combine && !$aStrands[i].selected && ($idStrand == i))
      {
        // disabled what was current strand, so set to first enabled one
        for (let j = 0; j < $nStrands; ++j)
        {
          if ($aStrands[j].selected)
          {
            idStrand.set(j);
            pStrand.set($aStrands[j]);
            break;
          }
        }
      }
    }
  }

  const checkowrite = () =>
  {
    // must disable all but the current one

    if (!(combine = !combine))
    {
      for (let i = 0; i < $nStrands; ++i)
        $aStrands[i].selected = false;

      $pStrand.selected = true;
    }
  }

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
