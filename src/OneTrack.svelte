<script>
 
  import { Row, Column } from "carbon-components-svelte";

  import { pStrand } from './globals.js';
  import { DRAW_LAYER } from './devcmds.js';

  import Revealer from './Revealer.svelte';
  import ButtonsDnUp from './ButtonsDnUp.svelte';
  import ButtonsSoloMute from './ButtonsSoloMute.svelte';
  import ButtonsAddDel from './ButtonsAddDel.svelte';
  import OneLayer from './OneLayer.svelte';

  export let track;

  let tstate;
  $: tstate = $pStrand.tracks[track].open ? 'block' : 'none';

  let bgc;
  $: bgc = $pStrand.tracks[track].open ? '#222522' : '#111';
  // cannot use css vars here, and <style> cannot access globals

</script>

<Row style="margin-top:10px; background-color: {bgc};">
  <Column>
    <Revealer bind:isopen={$pStrand.tracks[track].open} name='Track' num={track+1} />
  </Column>
  <ButtonsDnUp {track} layer={DRAW_LAYER} />
  <ButtonsSoloMute {track} layer={0} />
</Row>
<div style="display:{tstate};">
  {#each Array($pStrand.tracks[track].lactives) as _,layer}
    <div style="margin-left:13px; display: {tstate};">
      <OneLayer {track} {layer} />
    </div>
  {/each}
  <Row>
    <Column style="margin:15px 0 7px -1px;">
      <ButtonsAddDel {track}/>
    </Column>
  </Row>
</div>
