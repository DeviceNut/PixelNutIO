<script>

  import { Modal } from "carbon-components-svelte";

  export let openlinks = false;

</script>

<Modal
  bind:open={openlinks}
  passiveModal
  modalHeading={"Links to the PixelNut! website and code:"}
  on:close
  >
  <p>Visit the PixelNut! website <a target="_blank" href="https://www.devicenut.com/pixelnut">here</a>.</p>
  <br>
  <p>The source code for this web application is <a target="_blank" href="https://github.com/DeviceNut/PixelNutIO">here</a>.</p>
  <br>
  <p>The source code for the pixelnut devices is <a target="_blank" href="https://github.com/DeviceNut/PixelNutApp">here</a>
    and <a target="_blank" href="https://github.com/DeviceNut/PixelNutLib">here</a></p>
</Modal>
