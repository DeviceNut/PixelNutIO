<script>
 
  import { Row, Column } from "carbon-components-svelte";
  import { nLayers } from './globals.js';
  import Revealer from "./Revealer.svelte";
  import ButtonsSoloMute from "./ButtonsSoloMute.svelte";
  import ButtonsAddDel from "./ButtonsAddDel.svelte";
  import OneLayer from "./OneLayer.svelte"

  export let tracknum = 0;

  let isopen = true;
  let tstate = '';
  $: tstate = (isopen ? 'block' : 'none');

</script>

<Row style="margin-top:7px; background-color: #111211;">
  <Column>
    <Revealer bind:isopen name='Track' num={tracknum} />
  </Column>
  <Column>
    <ButtonsSoloMute {tracknum} layernum={0} />
  </Column>
</Row>
<div style="display:{tstate};">
  {#each Array($nLayers[tracknum-1]) as _,n}
    <div style="margin-left:20px; display:{tstate};">
      <OneLayer {tracknum} layernum={n+1} />
    </div>
  {/each}
  <Row>
    <Column style="margin: 3px 0 4px 5px;">
      <ButtonsAddDel {tracknum}/>
    </Column>
  </Row>
</div>
