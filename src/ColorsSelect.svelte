<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Column,
    Modal,
    Button,
    Theme,
    RadioButton,
    RadioButtonGroup
  } from "carbon-components-svelte";

  import {
    userThemeStr,
    colorThemeDark,
    colorThemeLite,
    colorSettings,
    showColors,
    setColor
  } from './globals.js';

  import {
    storeThemeSet,
    storeColorsSet
  } from './browser.js';

  import ColorsList from './ColorsList.svelte';
  import ColorsShow from './ColorsShow.svelte';

  // set CSS variables and save to browser
  const dosave = () =>
  {
    for (let c in $colorSettings) setColor(c, $colorSettings[c]);
    storeColorsSet($colorSettings)
    $showColors = false;
  }

  // make copy to restore if cancel
  let colors = {...$colorSettings};
  const cancel = () =>
  {
    $colorSettings = {...colors}; // restore starting colors
    $showColors = false
  }

  let customize = false;
  let custstr;
  $: custstr = customize ? "Hide Customizer" : "Show Customizer";

  let theme = $userThemeStr;
  $: {
    $userThemeStr = theme;
    storeThemeSet(theme);

    if (theme !== "g10")
         $colorSettings = {...$colorThemeDark};
    else $colorSettings = {...$colorThemeLite};
  }

</script>

<Modal
  passiveModal
  preventCloseOnClickOutside
  modalHeading={"Application Colors"}
  bind:open={$showColors}
  on:close
  >
  <div style="background-color:$colorSettings['--page-back']; padding:10px;">

    <p class="title">Select Theme:</p>
    <Theme bind:theme />
    <RadioButtonGroup orientation="vertical" legendText="" bind:selected={theme}>
      <RadioButton labelText="White on Black" value="g100" />
      <RadioButton labelText="White on Gray"  value="g90"  />
      <RadioButton labelText="Black on White" value="g10"  />
    </RadioButtonGroup>
    <p class="note">This overrides all custom settings.</p>

    <button on:click={()=> customize = !customize}>{custstr}</button>

    {#if customize }
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
        {/if}
      </MediaQuery>
      <div style="margin-top:30px;"></div>
    {/if}
  </div>

  <Button on:click={dosave}>Save</Button>
  <Button kind="secondary" on:click={cancel}>Cancel</Button>

</Modal>

<style>
  .title {
    margin-bottom: 10px;
    font-size:1.1em;
  }
  .note {
    margin-top: 10px;
    font-style: italic;
    font-size:.95em;
  }
  button {
    margin-top: 20px;
    margin-bottom: 20px;
    min-width: 220px;
    min-height: 30px;
  }
</style>
