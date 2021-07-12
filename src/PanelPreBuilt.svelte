<script>

  import {
    Grid, Row, Column,
    Dropdown, Button, Modal
  } from "carbon-components-svelte";
  import Help32 from "carbon-icons-svelte/lib/Help32";

  import { aPatterns, curPatternID } from './globals.js'
  import { newPatternID } from "./commands.js";

  import SlidersMain from "./SlidersMain.svelte";
  import SlidersPropsGlobal from "./SlidersPropsGlobal.svelte";
  import SliderVal from "./SliderVal.svelte"

  const dotrigger = () => { console.log('Trigger!'); }
  const didselect = () => { newPatternID(); }

  /* BUG in tooltips: sliders knob bleeds through "whiting out" the text!
    <Tooltip style="margin-top:12px; float: right;"
      direction="right"
      triggerText=""
      >
      <p>Explanation of what selected pattern does.</p>
    </Tooltip>
  */

  let open = false;
  let pattext = 'bla bla bla .s ldf ;lsjd f;lsjd f;lsjd ;lfsj d;lfsj;ldfjsldf'; // TODO

</script>

<Grid>
  <Row>
    <Dropdown
      type="inline"
      titleText="Pattern:"
      on:select={didselect}
      bind:selectedIndex={$curPatternID}
      bind:items={$aPatterns}
    />
    <Button style="margin-left:20px;"
      size="small"
      kind="ghost"
      hasIconOnly icon={Help32}
      iconDescription="Pattern description"
      tooltipPosition="right"
      on:click={()=>open=true}
    />
    <Modal
      bind:open
      passiveModal
      modalHeading="Pattern XX"
      on:close
      >
      <p>{pattext}</p>
    </Modal>
  </Row>

  <Row>
    <SlidersMain/>
    <SlidersPropsGlobal/>
  </Row>

  <Row>
    <Column style="margin-left: -15px;">
    <SliderVal name='Force&nbsp;' />

    <div style="margin-top: 15px; margin-bottom: 10px">
      <Button
        size="small"
        kind="secondary"
        on:click={dotrigger}
        >Trigger
      </Button>
    </div>

  </Column>
</Row>
</Grid>
