<script>

  import {
    TreeView,
  } from "carbon-components-svelte";

  import {
    patsMenuOpen,
    patsActiveID,
    patsSelectIDs,
    patsOpenItems,
    patsCurText
  } from './globals.js';

  let activeId = 0; //$patsActiveID;
  let selectedIds = [20];

  let isbrowser = false;
  let delstr = 'Delete...';

  const dodelete = () => {}

  const doselect = (id) =>
  {
    console.log(`Selecting id=${id}`);

    if (id >= 30)
    {
      isbrowser = true;
      delstr = (id == 30) ? 'Delete All' : 'Delete One';
    }
    else
    {
      isbrowser = false;
      delstr = 'Delete...';
    }
  }

  const patterns =
  [
    {
      id: 10,
      text: "PixelNut! Standards:",
      children: [
        { id: 11, text: "Pattern 1" },
        { id: 12, text: "Pattern 2" },
        { id: 13, text: "Pattern 3" },
        { id: 14, text: "Pattern 4" },
      ],
    },
    {
      id: 20,
      text: "Specific to this Device:",
      children: [
        { id: 21, text: "Pattern 1" },
      ],
    },
    {
      id: 30,
      text: "Saved to your Browser:",
      children: [
        { id: 31, text: "Pattern 1" },
        { id: 32, text: "Pattern 2" },
      ],
    },
  ];

</script>

<div style="padding-top:10px; margin-left:10px;"></div>
<p>Patterns to choose from:</p>

<TreeView
  children={patterns}
  bind:activeId={$patsActiveID}
  bind:selectedIds={$patsSelectIDs}
  bind:expandedIds={$patsOpenItems}
  on:focus={({detail}) => { doselect(detail.id); }}
/>

<div style="margin-top:10px; text-align:center;">
  <button class="button-close"
    on:click={() => { $patsMenuOpen = false; }}
    >Close
  </button>
  <button class="button-delete"
    on:click={dodelete}
    disabled={!isbrowser}
    >{delstr}
  </button>
</div>

<style>
  .button-close {
    width: 60px;
    height: 35px;
    padding: 5px;
  }
  .button-delete {
    width: 90px;
    height: 35px;
    padding: 5px;
    margin-left: 10px;
  }
</style>
