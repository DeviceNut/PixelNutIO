<script>
 
  import { Row, Column } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import Revealer from "./Revealer.svelte";
  import ButtonsSoloMute from "./ButtonsSoloMute.svelte";
  import ButtonsAddDel from "./ButtonsAddDel.svelte";
  import OneLayer from "./OneLayer.svelte"

  export let track = 0;

  let isopen = true;
  let tstate = '';
  $: tstate = (isopen ? 'block' : 'none');

</script>

<Row style="margin-top:7px; background-color:#111211;">
  <Column>
    <Revealer bind:isopen name='Track' num={track+1} />
  </Column>
  <Column>
    <ButtonsSoloMute {track} layer={0} />
  </Column>
</Row>
<div style="display:{tstate};">
  {#each Array($pStrand.tracks[track].lactives) as _,layer}
    <div style="margin-left:20px; display:{tstate};">
      <OneLayer {track} {layer} />
    </div>
  {/each}
  <Row>
    <Column style="margin: 3px 0 4px 5px;">
      <ButtonsAddDel {track}/>
    </Column>
  </Row>
</div>
