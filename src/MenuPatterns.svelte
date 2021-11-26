<script>

  import {
    TreeView,
  } from "carbon-components-svelte";

  import {
    patsActiveID,
    patsOpenItems,
    patsCurText
  } from './globals.js';

  let activeId = $patsActiveID;
  let expandedIds = $patsOpenItems;

  const doselect = (id) =>
  {
    console.log(`Selecting id=${id}`);
  }

  const patterns =
  [
    {
      id: 1,
      text: "Specific to this Device:",
      children: [
        { id: 10, text: "Pattern 1" },
      ],
    },
    {
      id: 2,
      text: "Standard Built-ins:",
      children: [
        { id: 20, text: "Pattern 1" },
        { id: 21, text: "Pattern 2" },
        { id: 22, text: "Pattern 3" },
        { id: 23, text: "Pattern 4" },
      ],
    },
    {
      id: 3,
      text: "Saved to this Browser:",
      children: [
        { id: 30, text: "Pattern 1" },
        { id: 31, text: "Pattern 2" },
      ],
    },
  ];

</script>

<div style="padding-top:10px; margin-left:10px;"></div>
<p>Patterns to choose from:</p>

<TreeView
  children={patterns}
  bind:activeId
  bind:expandedIds
  on:focus={({detail}) => { doselect(detail.id); }}
/>

