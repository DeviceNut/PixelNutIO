<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import { cmdSetProps } from "./commands.js"
  import SliderVal from "./SliderVal.svelte"

  export let tracknum = 0;
  
  let setProps = () => { cmdSetProps(tracknum); }

  let bgc = '';
  //$: bgc = extcontrol ? '#222322' : '#111211'

</script>

<Row style="margin-top: 10px; margin-bottom: 10px;">
  <Column>

    <SliderVal
      name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setProps}
      bind:cur={$pStrand.tracks[tracknum-1].drawProps.degreeHue}
      disabled={$pStrand.tracks[tracknum-1].drawProps.overHue && $pStrand.doOverride}
      max={359}
    />

    <SliderVal
      name='White&nbsp;'
      onchange={setProps}
      bind:cur={$pStrand.tracks[tracknum-1].drawProps.pcentWhite}
      disabled={$pStrand.tracks[tracknum-1].drawProps.overWhite && $pStrand.doOverride}
    />

    <SliderVal
      name='Count&nbsp;'
      onchange={setProps}
      bind:cur={$pStrand.tracks[tracknum-1].drawProps.pcentCount}
      disabled={$pStrand.tracks[tracknum-1].drawProps.overCount && $pStrand.doOverride}
    />
  </Column>

  <Column>
    <div style="margin-top: 8px;"></div>
    <Checkbox
      labelText="Override"
      bind:checked={$pStrand.tracks[tracknum-1].drawProps.overHue}
    />
    <div style="margin-top: 8px;"></div>
    <Checkbox
      labelText="Override"
      bind:checked={$pStrand.tracks[tracknum-1].drawProps.overWhite}
    />
    <div style="margin-top: 8px;"></div>
    <Checkbox
      labelText="Override"
      bind:checked={$pStrand.tracks[tracknum-1].drawProps.overCount}
    />
  </Column>

</Row>
