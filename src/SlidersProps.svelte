<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";

  import {
    cmdStr_SetCount,
    cmdStr_SetHue,
    cmdStr_SetWhite,
    sendCmd
  } from "./patterns.js"

  import SliderVal from "./SliderVal.svelte"

  export let tracknum = 0;
  export let layernum = 0;
  export let extcontrol = false;

  let hue = 120;
  let white = 0;
  let count = 50;

  let setCount = () => { sendCmd(cmdStr_SetCount, count, tracknum, layernum); }
  let setHue   = () => { sendCmd(cmdStr_SetHue,   hue,   tracknum, layernum); }
  let setWhite = () => { sendCmd(cmdStr_SetWhite, white, tracknum, layernum); }

  let bgc = '';
  $: bgc = extcontrol ? '#222322' : '#111211'

</script>

<Row style="margin-top: 10px; margin-bottom: 10px;">
  <!-- max-wdith prevents putting second col on separate line >670px for some reason -->
  <Column style="background-color: {bgc}; margin-left: 13px; max-width:350px">
    <SliderVal name='Count&nbsp;' bind:cur={count} />
    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;' bind:cur={hue} max={359} />
    <SliderVal name='White&nbsp;' bind:cur={white} />
  </Column>
  <Column>
    <Checkbox
      labelText="Extern"
      bind:checked={extcontrol}>
    </Checkbox>
  </Column>
</Row>
