<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";

  import Layer from "./Layer.svelte"
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
<div style="margin-top:-25px; display:{tstate};"></div>
{#each Array($nLayers[tracknum-1]) as _,n}
  <div style="margin-left:20px; display:{tstate};"><Layer layernum={n+1} /></div>
{/each}
