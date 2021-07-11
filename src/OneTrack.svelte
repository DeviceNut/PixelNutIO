<script>
 
  import { Row, Column } from "carbon-components-svelte";
  import { nLayers } from './globalVars.js';
  import Revealer from "./Revealer.svelte";
  import SoloMuteButtons from "./SoloMuteButtons.svelte";
  import OneLayer from "./OneLayer.svelte"

  export let tracknum = 0;

  let isopen = false;
  let tstate = '';
  $: {
    tstate = (isopen ? 'block' : 'none');
  }

</script>

<Row style="margin-top:10px; background: #111211;">
  <Column>
    <Revealer bind:isopen name='Track' num={tracknum} />
  </Column>
  <Column>
    <SoloMuteButtons {tracknum} layernum={0} />
  </Column>
</Row>
<div style="display:{tstate}; margin-top: 5px;">
  {#each Array($nLayers[tracknum-1]) as _,n}
    <div style="margin-left:20px; display:{tstate};">
      <OneLayer {tracknum} layernum={n+1} />
    </div>
  {/each}
</div>
