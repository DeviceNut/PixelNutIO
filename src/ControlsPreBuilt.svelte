<script>

  import { Grid, Row, Dropdown, Button } from "carbon-components-svelte";
  import { aPatterns, patternID } from './globalVars.js'
  import { sendPattern } from "./pixCmds.js";
  import MainSliders from "./MainSliders.svelte";
  import ControlsProps from "./ControlsProps.svelte";
  import SliderVal from "./SliderVal.svelte"

  const dotrigger = () => { console.log('Trigger!'); }
  const didselect = () => { sendPattern($patternID); }

</script>

<Grid>
  <Row>
    <Dropdown
      type="inline"
      titleText="Pattern:"
      on:select={didselect}
      bind:selectedIndex={$patternID}
      bind:items={$aPatterns}
    />
  </Row>

  <Row>
    <MainSliders/>
    <ControlsProps/>
  </Row>

  <Row>
    <SliderVal name='Force&nbsp;' />
    <div style="margin-top:5px;">
      <Button size="small" kind="secondary" on:click={dotrigger}>Trigger</Button>
    </div>
  </Row>
</Grid>
