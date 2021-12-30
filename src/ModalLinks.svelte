<script>

  import { Modal } from "carbon-components-svelte";

  export let openOptions = false;

</script>

<Modal
  passiveModal
  modalHeading={"Links to the website and code:"}
  bind:open={openOptions}
  on:close
  >
  <p>Visit the PixelNut! website <a target="_blank" href="https://www.devicenut.com/pixelnut">here</a>.</p>
  <br>
  <p>Source code for this web application is <a target="_blank" href="https://github.com/DeviceNut/PixelNutIO">here</a>.</p>
  <br>
  <p>Source code for the devices is <a target="_blank" href="https://github.com/DeviceNut/PixelNutApp">here</a>
    and <a target="_blank" href="https://github.com/DeviceNut/PixelNutLib">here.</a></p>
</Modal>
