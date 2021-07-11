<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";

  import DrawControls from "./DrawControls.svelte"
  import PredrawControls from "./PredrawControls.svelte"

  export let layernum = 0;
</script>

<Accordion align="start" size="sm">
  <AccordionItem  title="Layer {layernum}">
    {#if (layernum == 1) }
      <DrawControls/>
    {:else}
      <PredrawControls/>
    {/if}
  </AccordionItem>
</Accordion>
