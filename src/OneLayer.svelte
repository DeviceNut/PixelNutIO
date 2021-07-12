<script>

  import { Row, Column } from "carbon-components-svelte";
  import Revealer from "./Revealer.svelte";
  import ButtonsSoloMute from "./ButtonsSoloMute.svelte"
  import ControlsDrawing from "./ControlsDrawing.svelte"
  import ControlsPredraw from "./ControlsPredraw.svelte"

  export let tracknum = 0;
  export let layernum = 0;

  let isopen = true;

  let bgc = '';
  $: bgc = isopen ? 'inherit' : 'black'

</script>

<Row style="background-color: {bgc}">
  <Column>
    <Revealer bind:isopen name='Layer' num={layernum} />
  </Column>
  <Column>
    {#if (layernum != 1) }
      <ButtonsSoloMute {tracknum} {layernum} />
    {/if}
  </Column>
</Row>
<Row>
  {#if isopen }
    <Column style="margin-right: 15px; padding-top: 10px; padding-bottom: 15px; background-color: #111211;">
      {#if (layernum != 1) }
        <ControlsPredraw {tracknum} {layernum} />
      {:else}
        <ControlsDrawing {tracknum} />
      {/if}
    </Column>
  {/if}
</Row>
