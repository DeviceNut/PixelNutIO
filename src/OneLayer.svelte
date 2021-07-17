<script>

  import { Row, Column } from "carbon-components-svelte";
  import Revealer from "./Revealer.svelte";
  import ButtonsSoloMute from "./ButtonsSoloMute.svelte"
  import ControlsDraw from "./ControlsDraw.svelte"
  import ControlsFilter from "./ControlsFilter.svelte"

  export let track;
  export let layer;

  let isopen = true;

  let bgc = '';
  $: bgc = isopen ? '#222522' : '#111311'

</script>

<Row style="margin-right:0; margin-top: 5px; background-color:{bgc}">
  <Column>
    <Revealer bind:isopen name='Layer' num={layer+1} />
  </Column>
  <Column>
    {#if (layer != 0) }
      <ButtonsSoloMute {track} {layer} />
    {/if}
  </Column>
</Row>
<Row>
  {#if isopen }
    <Column style="margin-right: 15px; padding-top: 10px; padding-bottom: 15px; background-color: #111211;">
      {#if (layer == 0) }
        <ControlsDraw {track} />
      {:else}
        <ControlsFilter {track} {layer} />
      {/if}
    </Column>
  {/if}
</Row>
