<script>
  import { Row, Accordion, AccordionItem } from "carbon-components-svelte";

  import OneLayer from "./OneLayer.svelte"
  import { nLayers } from './globalVars.js';

  export let tracknum = 0;

  let isopen = false;
  let tstate = 'none';

  const openTrack = (event) =>
  {
    if (isopen = !isopen)
         tstate = 'block';
    else tstate = 'none';
  }
</script>

<Accordion align="start" size="sm">
  <AccordionItem title="Track {tracknum}" on:click={openTrack}>
  </AccordionItem>
</Accordion>
<div style="display:{tstate}; margin-top:-35px;">
{#each Array($nLayers[tracknum-1]) as _,n}
  <div style="margin-left:20px; display:{tstate};"><OneLayer layernum={n+1} /></div>
{/each}
</div>
