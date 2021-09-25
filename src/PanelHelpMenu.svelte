<script>

  import { TreeView } from "carbon-components-svelte";

  import { docsHelpText } from './globals.js';
  import { helpTopics, helpText } from './helpmain.js';

  let activeId = 0;
  let selectedIds = [];
  let expandedIds = [];

  const dohelp = (id) =>
  {
    $docsHelpText = helpText(id);
  }
  dohelp(activeId);

</script>

<TreeView
  children={helpTopics}
  bind:activeId
  bind:selectedIds
  bind:expandedIds
  on:select={({ detail }) => { dohelp(detail.id); }}
  on:focus={({ detail }) => { dohelp(detail.id); }}
/>
