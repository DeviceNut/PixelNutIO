<script>

  import { Row, Column } from "carbon-components-svelte";
  import Revealer from "./Revealer.svelte";
  import SoloMuteButtons from "./SoloMuteButtons.svelte"
  import ControlsDrawing from "./ControlsDrawing.svelte"
  import ControlsPredraw from "./ControlsPredraw.svelte"

  export let tracknum = 0;
  export let layernum = 0;

  let isopen = false;

</script>

<Row>
  <Column>
    <Revealer bind:isopen name='Layer' num={layernum} />
  </Column>
  <Column>
    <SoloMuteButtons {tracknum} {layernum} />
  </Column>
</Row>
<Row>
  {#if isopen }
    <Column style="background-color: #111211;">
      {#if (layernum == 1) }
        <ControlsDrawing/>
      {:else}
        <ControlsPredraw/>
      {/if}
    </Column>
  {/if}
</Row>
