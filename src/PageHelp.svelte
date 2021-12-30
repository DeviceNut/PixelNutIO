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
    helpMenuOpen,
    helpCurText
  } from './globals.js';

  import HeaderHelp from './HeaderHelp.svelte';
  import MenuHelp from './MenuHelp.svelte';

</script>

<HeaderHelp/>

<Grid>
  <Row>
    {#if $helpMenuOpen }

      <MediaQuery query="(max-width: 800px)" let:matches>
        {#if matches}
          <Row style="width:100%; margin:0 auto;">
            <Column style="">
              <MenuHelp/>
            </Column>
          </Row>
          <Row style="width:100%; margin:0 auto;">
            <Column style="text-align:center; margin-top:20px;">
              <TextArea
                style="font-family:'Courier New'"
                rows={HELPTEXT_HEIGHT}
                value={$helpCurText}
              />
            </Column>
          </Row>
        {/if}
      </MediaQuery>

      <MediaQuery query="(min-width: 801px)" let:matches>
        {#if matches}
          <Column>
            <MenuHelp/>
          </Column>
          <Column style="margin-top:13px;">
            <TextArea
              style="font-family:'Courier New'"
              rows={HELPTEXT_HEIGHT}
              value={$helpCurText}
            />
          </Column>
        {/if}
      </MediaQuery>

    {:else}

      <Column style="margin-top:13px;">
        <TextArea
          style="font-family:'Courier New'"
          rows={HELPTEXT_HEIGHT}
          value={$helpCurText}
        />
      </Column>

    {/if}
  </Row>

  <Row style="display:flex; justify-content:center;">
    <div class="links">
      Visit the PixelNut! <a target='_blank' href='https://www.devicenut.com/pixelnut'>website.</a>&nbsp;&nbsp;
      Source code available for the <a target='_blank' href='https://github.com/DeviceNut/PixelNutWeb'>web application</a>
      and for the <a target='_blank' href='https://github.com/DeviceNut/PixelNutSys'>devices</a>.
    </div>
  </Row>

</Grid>

<style>
  .links {
    margin-top: 13px;
    padding: 10px;
    font-size:.97em;
  }  
</style>