<script>
  import { Grid, Row, MultiSelect, Button } from "carbon-components-svelte";
  import { nStrands, eStrands } from './globalVars.js'

  let items = [];
  for (let i = 0; i < $nStrands; ++i)
    items.push({id: `${i}`, text: `${i+1}`});

  let selectedIds = ['0'];
  const checkcount = () =>
  {
    // must have at least one strand selected
    //if (selectedIds.length < 1) selectedIds.push('0');

    // convert array of selected ids into array of enables
    let list = [];
    for (let i = 0; i < $nStrands; ++i)
      list[i] = false;
    for (const s of selectedIds)
      list[parseInt(s)] = true;

    eStrands.set(list);
  }

  // BUG in MultiSelect:
  // if 'label' is empty then if all checkboxes are cleared the item text disapears!
  </script>

<Grid>
  <Row>
    <MultiSelect
      on:select={checkcount}
      type="inline"
      label="&nbsp;&nbsp;Strands"
      bind:selectedIds
      items={items}
    />

    <div style="margin-left: 30px;"></div>
    <!--
      <button kind="secondary">hello</button>
    -->
  </Row>
</Grid>
