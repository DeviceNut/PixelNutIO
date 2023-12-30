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

  let selectedID;
  const dohelp = (id) =>
  {
    $helpCurText = helpText(id);
    $helpActiveID = id;
    selectedID = [id];
  }
  dohelp($helpActiveID);

</script>

<TreeView
  children={helpTopics}
  bind:activeId={$helpActiveID}
  bind:selectedIds={selectedID}
  bind:expandedIds={$helpOpenItems}
  on:focus={({ detail }) => { dohelp(detail.id); }}
/>
