<script>

  import {
    Modal,
    Dropdown,
    Button
  } from "carbon-components-svelte";

  import {
    aColorThemes,
    showColors,
    getColor,
    setColor
  } from './globals.js';

  let styles = {
		'page-color': '#FF5555',
	};

  const docolor = () =>
  {
    let color = styles['page-color'];
    setColor('--page-back', color);
    $showColors = false;
  }

  let tindex = 0;
  const setTheme = () =>
  {
    console.log(`Colors: theme=${sdfsdf}`);
  }

</script>

<Modal
  passiveModal
  preventCloseOnClickOutside
  modalHeading={"Program Colors"}
  bind:open={$showColors}
  on:close
  >

  <p class="title">Choose your color theme:</p>

  <Dropdown
    style="margin-top:10px; margin-bottom:10px;"
    size="sm"
    type="inline"
    on:select={setTheme}
    bind:selectedIndex={tindex}
    bind:items={$aColorThemes}
  />

  <div style="margin-top:20px;"></div>

  <label>
		<input type="color"
      style="padding:0"
      bind:value={styles['page-color']}
    />
		Page Background
	</label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
		<input type="color"
      style="padding:0"
      bind:value={styles['page-color']}
    />
		Page Background
	</label>
  <div style="display:block; margin-top:10px;"></div>

  <div style="margin-top:20px;"></div>

  <Button on:click={docolor}>Save</Button>
  <Button kind="secondary" on:click={()=>{$showColors = false}}>Cancel</Button>

</Modal>

<style>
  .title {
    font-size:1.1em;
  }
</style>