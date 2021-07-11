<script>

import {Grid, Row, ContentSwitcher, Switch } from "carbon-components-svelte";
  import { customMode, customClear } from './globals.js';

  let selectedIndex = ($customMode ? 1 : 0);
  let textBuiltins = ($customClear ? "PreBuilt" : "Reset");

  let didclick = () =>
  {
    //console.log(`selected: ${selectedIndex}`);
    customMode.set(selectedIndex == 1);
  }

  </script>

<Grid>
  <Row>
    <ContentSwitcher size="sm" on:click={didclick} bind:selectedIndex>
      <Switch disabled={!$customClear} text={textBuiltins} />
      <Switch text="Custom" />
    </ContentSwitcher>
  </Row>
</Grid>
