<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";

  import ControlsDrawing from "./ControlsDrawing.svelte"
  import ControlsPredraw from "./ControlsPredraw.svelte"

  export let layernum = 0;
</script>

<Accordion align="start" size="sm">
  <AccordionItem  title="Layer {layernum}">
    {#if (layernum == 1) }
      <ControlsDrawing/>
    {:else}
      <ControlsPredraw/>
    {/if}
  </AccordionItem>
</Accordion>
