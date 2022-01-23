<script>

  import {
    Modal,
    Button,
    ButtonSet
  } from "carbon-components-svelte";

  import {
    showOptions,
    getColor,
    setColor
  } from './globals.js';

  let styles = {
		'page-color': '#FF5555',
	};

  const docolor = () =>
  {
    let color = styles['page-color'];
    setColor('--bgc-page', color);
    $showOptions = false;
  }

/*
  <p>Choose your color scheme.</p><br>

  <label>
		<input type="color"
      style="padding:0"
      bind:value={styles['page-color']}
    />
		Page Background
	</label>
    <Button on:click={docolor}>Save</Button>

*/
</script>

<Modal
  passiveModal
  modalHeading={"User Options"}
  bind:open={$showOptions}
  on:close
  >

  <ButtonSet>
    <Button kind="secondary" on:click={()=>{$showOptions = false}}>Cancel</Button>
  </ButtonSet>
</Modal>
