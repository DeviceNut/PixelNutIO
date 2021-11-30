<script>

import {
    TreeView,
    Modal,
    Button,
    ButtonSet
  } from "carbon-components-svelte";

  import {
    patsMenuOpen,
    patsActiveID,
    patsSelectIDs,
    patsOpenItems,
    patsCurText
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternRemove
  } from './browser.js';

  let isbrowser = false;
  let delstr = 'Delete...';
  $: {

    if ($patsActiveID >= 30)
    {
      isbrowser = true;
      delstr = ($patsActiveID == 30) ? 'Delete All' : 'Delete One';
    }
    else
    {
      isbrowser = false;
      delstr = 'Delete...';
    }
  }

  let openDelete = false;
  let delname = '';

  const dodelete = () =>
  {
    storePatternRemove(delname);
    storePatternsInit();

    //userClearPattern(); TODO: reset current pattern to...??

    openDelete = false;
  }

  const doselect = (id) =>
  {
    //console.log(`Selecting id=${id}`);
    $patsActiveID = id;
    $patsSelectIDs = [ $patsActiveID ];

    /*
    if (id == 30)
    {
      const obj = { id: 33, text: "Pattern 3" };
      patterns[2].children.push(obj);
      patterns = patterns; // forces refresh
    }
    */
  }

  let patterns =
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
  bind:children={patterns}
  bind:activeId={$patsActiveID}
  bind:selectedIds={$patsSelectIDs}
  bind:expandedIds={$patsOpenItems}
  on:focus={({detail}) => { doselect(detail.id); }}
/>

<div style="margin-top:15px; text-align:center;">
  <button class="button-close"
    on:click={() => { $patsMenuOpen = false; }}
    >Close
  </button>
  <button class="button-delete"
    on:click={() => {openDelete = true;}}
    disabled={!isbrowser}
    >{delstr}
  </button>
</div>

<Modal
  passiveModal
  modalHeading={`Delete Custom Pattern: "${delname}" ?`}
  bind:open={openDelete}
  on:close
  >
  <ButtonSet>
    <Button kind="secondary" on:click={() => {openDelete = false;}}>Cancel</Button>
    <Button on:click={dodelete}>Delete</Button>
  </ButtonSet>
</Modal>

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
