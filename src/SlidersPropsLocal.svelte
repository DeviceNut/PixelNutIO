<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import { cmdSetProps, cmdSetOverrides } from "./commands.js"
  import SliderVal from "./SliderVal.svelte"

  export let track = 0;
  
  const setprops = () => { cmdSetProps(track); }
  const setovers = () => { cmdSetOverrides(track); }

</script>

<Row style="margin-top: 10px; margin-bottom: 5px;">
  <Column>

    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.tracks[track].drawProps.degreeHue}
      disabled={$pStrand.tracks[track].drawProps.overHue && $pStrand.doOverride}
      max={359}
    />

    <SliderVal name='White&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.tracks[track].drawProps.pcentWhite}
      disabled={$pStrand.tracks[track].drawProps.overWhite && $pStrand.doOverride}
    />

    <SliderVal name='Count&nbsp;'
      onchange={setprops}
      bind:cur={$pStrand.tracks[track].drawProps.pcentCount}
      disabled={$pStrand.tracks[track].drawProps.overCount && $pStrand.doOverride}
    />
  </Column>

  <!-- not sure why, but this prevents Override checkboxes from 
       moving to separate lines when viewport >1584 !!!
  -->
  <Column style="min-width:100px">

  <div style="margin-top: 8px;"></div>
    <Checkbox labelText="Override"
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overHue}
    />
    <div style="margin-top: 8px;"></div>
    <Checkbox labelText="Override"
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overWhite}
    />
    <div style="margin-top: 8px;"></div>
    <Checkbox labelText="Override"
      on:check={setovers}
      bind:checked={$pStrand.tracks[track].drawProps.overCount}
    />
  </Column>

</Row>
