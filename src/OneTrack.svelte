<script>
 
  import { Row, Column } from "carbon-components-svelte";
  import { pStrand } from './globals.js';
  import Revealer from "./Revealer.svelte";
  import ButtonsDnUp from './ButtonsDnUp.svelte';
  import ButtonsSoloMute from "./ButtonsSoloMute.svelte";
  import ButtonsAddDel from "./ButtonsAddDel.svelte";
  import OneLayer from "./OneLayer.svelte";

  export let track;

  let tstate;
  $: tstate = $pStrand.tracks[track].open ? 'block' : 'none';

  let bgc;
  $: bgc = $pStrand.tracks[track].open ? '#222522' : '#111';
  // cannot use css vars here, and <Row> cannot take a class

</script>

<Row style="margin-top:7px; margin-top:7px; background-color: {bgc};">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].open} name='Track' num={track+1} />
  </Column>
  <ButtonsDnUp {track} layer={0} />
  <ButtonsSoloMute {track} layer={0} />
</Row>
<div style="display:{tstate};">
  {#each Array($pStrand.tracks[track].lactives) as _,layer}
    <div style="margin-left:13px; display: {tstate};">
      <OneLayer {track} {layer} />
    </div>
  {/each}
  <Row>
    <Column style="margin:7px 0 7px -1px;">
      <ButtonsAddDel {track}/>
    </Column>
  </Row>
</div>
