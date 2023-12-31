<script>

  import MediaQuery from "svelte-media-query";

  import {
    Grid,
    Row,
    Column
  } from "carbon-components-svelte";

  import {
    curDevice,
    curPageMode,
    connectActive,
    PAGEMODE_DEVICES,
  } from './globals.js';

  import HeaderControls from './HeaderControls.svelte';
  import MultiStrands   from './MultiStrands.svelte';
  import PanelOrgPatts  from './PanelOrgPatts.svelte';
  import PanelOrgCtrls  from './PanelOrgCtrls.svelte';

  $: if (!$connectActive || !$curDevice)
      $curPageMode = PAGEMODE_DEVICES;

</script>

<Grid style="margin-top:5px;">

  <MediaQuery query="(max-width: 750px)" let:matches>
    {#if matches}
      <div class="page ">
        <Row>
          <Column>
            <HeaderControls/>
            <MultiStrands/>
          </Column>
        </Row>
        <Row>
          <Column>
            <div style="margin:15px 20px 0 20px;">
              <PanelOrgPatts/>
            </div>
            <div class="divider"></div>
            <div style="padding-left:10px;">
              <PanelOrgCtrls/>
            </div>
          </Column>
        </Row>
      </div>
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width: 751px)" let:matches>
    {#if matches }
      <div class="page large">
        <Row>
          <Column>
            <HeaderControls/>
            <MultiStrands/>
          </Column>
        </Row>
        <Row style="margin:10px 0 10px 10px;">
          <Column>
            <PanelOrgPatts/>
          </Column>
          <div class="vertdiv"></div>
          <Column>
            <PanelOrgCtrls/>
          </Column>
        </Row>
      </div>
    {/if}
  </MediaQuery>

</Grid>

<style>
  .page {
    margin: 0 auto;
    min-width: 310px;
    background-color: var(--page-back);
    border: 2px solid var(--page-border);
  }
  .large {
    max-width: 1000px;
  }
  .vertdiv {
    width: 3px;
    background-color: var(--page-border);
  }
  .divider {
    margin-top: 20px;
    margin-bottom: 15px;
    padding-top: 2px;
    background-color: var(--page-border);
  }
</style>
