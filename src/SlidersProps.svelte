<script>

  import { Row, Column, Checkbox } from "carbon-components-svelte";
  import SliderVal from "./SliderVal.svelte"

  export let extcontrol = false;

  let bgc = '';
  $: bgc = extcontrol ? '#222322' : '#111211'

</script>

<Row>
  <Column style="background-color: {bgc}">
    <SliderVal name='Count&nbsp;' curval=50 />
    <SliderVal name='Hue&nbsp;&nbsp;&nbsp;' curval=120 maxval=359 />
    <SliderVal name='White&nbsp;' curval=0 />
  </Column>
  <Column>
    <Checkbox labelText="Extern" bind:checked={extcontrol}></Checkbox>
  </Column>
</Row>
