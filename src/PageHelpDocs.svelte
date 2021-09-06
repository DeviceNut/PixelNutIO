<script>

  import {
    Grid,
    Row,
    Column,
    TreeView,
    TextArea
  } from "carbon-components-svelte";

  import { docsMenuOpen } from './globals.js';
  import { helpTopics, helpText } from './helpdocs.js';

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
      <Column>
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

    <Column style='margin-top:13px;'>
      <TextArea value={helptext}/>
    </Column>

  </Row>
</Grid>

