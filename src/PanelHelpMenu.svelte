<script>

  import { TreeView } from "carbon-components-svelte";

  import {
    docsHelpText,
    menuActiveID,
    menuExpList
  } from './globals.js';

  import {
    helpTopics,
    helpText
  } from './helpmain.js';

  let activeId = $menuActiveID;
  let expandedIds = $menuExpList;

  const dohelp = (id) =>
  {
    $docsHelpText = helpText(id);
    $menuActiveID = id;
    $menuExpList = expandedIds;
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
