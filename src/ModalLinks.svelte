<script>

  import { Modal } from "carbon-components-svelte";

  export let openOptions = false;

</script>

<Modal
  passiveModal
  modalHeading={"User Options"}
  bind:open={openOptions}
  on:close
  >
</Modal>
