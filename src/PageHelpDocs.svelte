<script>

  import MediaQuery from "svelte-media-query";

  import {
    Grid,
    Row,
    Column,
    TextArea
  } from "carbon-components-svelte";

  import {
    HELPTEXT_HEIGHT,
    docsMenuOpen,
    docsHelpText
  } from './globals.js';

  import HeaderHelpDocs from './HeaderHelpDocs.svelte';
  import PanelHelpMenu from './PanelHelpMenu.svelte';

</script>

<HeaderHelpDocs/>

<Grid>
  <Row>
    {#if $docsMenuOpen }

      <MediaQuery query="(max-width: 800px)" let:matches>
        {#if matches}
          <Row style="width:100%; margin: 0 auto;">
            <Column style="">
              <PanelHelpMenu/>
            </Column>
          </Row>
          <Row style="width:100%; margin: 0 auto;">
            <Column style="text-align:center; margin-top:20px;">
              <TextArea
                style="font-family:'Courier New'"
                rows={HELPTEXT_HEIGHT}
                value={$docsHelpText}
              />
            </Column>
          </Row>
        {/if}
      </MediaQuery>

      <MediaQuery query="(min-width: 801px)" let:matches>
        {#if matches}
          <Column>
            <PanelHelpMenu/>
          </Column>
          <Column style="margin-top:13px;">
            <TextArea
              style="font-family:'Courier New'"
              rows={HELPTEXT_HEIGHT}
              value={$docsHelpText}
            />
          </Column>
        {/if}
      </MediaQuery>

    {:else}

      <Column style="margin-top:13px;">
        <TextArea
          style="font-family:'Courier New'"
          rows={HELPTEXT_HEIGHT}
          value={$docsHelpText}
        />
      </Column>

    {/if}
  </Row>
</Grid>

