<script>

  import {
    Grid,
    Row,
    Column,
    TreeView,
    TextArea
  } from "carbon-components-svelte";

  import { docsMenuOpen } from './globals.js';
  import { helpTopics, helpText } from './helpmain.js';

  import HelpDocsHeader from './HelpDocsHeader.svelte';

  let activeId = 0;
  let selectedIds = [];
  let expandedIds = [];

  let helptext = '';
  const dohelp = (id) =>
  {
    helptext = helpText(id);
  }
  dohelp(activeId);

</script>

<HelpDocsHeader/>

<Grid>
  <Row>

    {#if $docsMenuOpen }
      <Column
        style='margin-top:13px;'
        sm={4}
        md={4}
        lg={6}
        max={4}
        >
        <TreeView
          children={helpTopics}
          bind:activeId
          bind:selectedIds
          bind:expandedIds
          on:select={({ detail }) => { dohelp(detail.id); }}
          on:focus={({ detail }) => { dohelp(detail.id); }}
        />
      </Column>
    {/if}

    <Column
      style='margin-top:13px;'
      sm={4}
      md={4}
      lg={10}
      max={12}
      >
      <TextArea
        style="font-family:'Courier New'"
        rows={30}
        value={helptext}
      />
    </Column>

  </Row>
</Grid>

