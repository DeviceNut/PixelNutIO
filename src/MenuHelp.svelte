<script>

  import { TreeView } from "carbon-components-svelte";

  import {
    helpActiveID,
    helpOpenItems,
    helpCurText
  } from './globals.js';

  import {
    helpTopics,
    helpText
  } from './helpmain.js';

  let activeId = $helpActiveID;
  let expandedIds = $helpOpenItems;

  const dohelp = (id) =>
  {
    $helpCurText = helpText(id);
    $helpActiveID = id;
    $helpOpenItems = expandedIds;
  }
  dohelp(activeId);

</script>

<TreeView
  children={helpTopics}
  bind:activeId
  bind:expandedIds
  on:select={({ detail }) => { dohelp(detail.id); }}
  on:focus={({ detail }) => { dohelp(detail.id); }}
/>
