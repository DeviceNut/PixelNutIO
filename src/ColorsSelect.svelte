<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Column,
    Modal,
    Dropdown,
    Button
  } from "carbon-components-svelte";

  import {
    colorThemes,
    colorDefaults,
    colorSettings,
    showColors,
    setColor
  } from './globals.js';

  import { storeColorsSet } from './browser.js';

  import ColorsList from './ColorsList.svelte';
  import ColorsShow from './ColorsShow.svelte';

  // set CSS variables and save to browser
  const dosave = () =>
  {
    for (let c in $colorSettings) setColor(c, $colorSettings[c]);
    storeColorsSet($colorSettings)
    $showColors = false;
  }

  // restore to original defaults
  const restore = () =>
  {
    $colorSettings = {...$colorDefaults};
    dosave();
  }

  // make copy to restore if cancel
  let colors = {...$colorSettings};
  const cancel = () =>
  {
    $colorSettings = {...colors}; // restore original
    $showColors = false
  }

/*
  const setTheme = () =>
  {
    console.log(`Colors: theme=${sdfsdf}`);
  }

  <p class="title">Choose your color theme:</p>
  <Dropdown
    style="margin-top:10px; margin-bottom:10px;"
    size="sm"
    type="inline"
    on:select={setTheme}
    bind:selectedIndex={tindex}
    bind:items={$colorThemes}
  />
  <div style="margin-top:20px;"></div>
*/

</script>

<Modal
  passiveModal
  preventCloseOnClickOutside
  modalHeading={"Application Colors"}
  bind:open={$showColors}
  on:close
  >
  <div style="background-color:#000000; padding:20px;">

    <p class="title">Select overall theme:</p>

    <p class="title">Select individual colors:</p>

    <MediaQuery query="(max-width: 670px)" let:matches>
      {#if matches}
        <Row>
          <Column>
            <ColorsList type="text"/>
          </Column>
        </Row>
        <Row style="margin-top:20px;">
          <Column>
            <ColorsShow type="text"/>
          </Column>
        </Row>
        <Row style="margin-top:20px;">
          <Column>
            <ColorsList type="page"/>
          </Column>
        </Row>
        <Row style="margin-top:20px;">
          <Column>
            <ColorsShow type="page"/>
          </Column>
        </Row>
        <Row style="margin-top:20px;">
          <Column>
            <ColorsList type="buttons"/>
          </Column>
        </Row>
        <Row style="margin-top:20px;">
          <Column>
            <ColorsShow type="buttons"/>
          </Column>
        </Row>

        <div style="margin-top:30px;"></div>

        <Button on:click={dosave}>Save</Button>
        <Button kind="secondary" on:click={cancel}>Cancel</Button>

        <div style="display:block; margin-top:10px;"></div>
        <Button kind="secondary" on:click={restore}>Set to default colors</Button>

      {/if}
    </MediaQuery>

    <MediaQuery query="(min-width: 671px)" let:matches>
      {#if matches}
        <Row>
          <Column style="max-width:280px;">
            <ColorsList type="text"/>
            <div style="margin-top:50px;"></div>
            <ColorsList type="page"/>
            <div style="margin-top:25px;"></div>
            <ColorsList type="buttons"/>
          </Column>
          <Column style="margin-right:20px;">
            <ColorsShow type="text"/>
            <div style="margin-top:15px;"></div>
            <ColorsShow type="page"/>
            <div style="margin-top:10px;"></div>
            <ColorsShow type="buttons"/>
          </Column>
        </Row>

        <div style="margin-top:30px;"></div>

        <Button on:click={dosave}>Save</Button>
        <Button kind="secondary" on:click={cancel}>Cancel</Button>
        <Button kind="secondary" on:click={restore}>Set to default colors</Button>

      {/if}
    </MediaQuery>

  </div>

</Modal>

<style>
  .title {
    margin: 20px 0 10px 0;
    font-size:1.1em;
  }
</style>
