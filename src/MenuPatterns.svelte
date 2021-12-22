<script>

import {
    TreeView,
    Modal,
    Button,
    ButtonSet
  } from "carbon-components-svelte";

  import {
    pStrand,
    aStoredPatt,
    aStoredDesc,
    aDevicePatt,
    aDeviceDesc,
    MENUID_CUSTOM,
    MENUID_PRESETS,
    MENUID_BROWSER,
    MENUID_DEVICE,
    patsOpenItems,
    patsSelectedID,
    patsMenuItems,
  } from './globals.js';

  import {
    preset_PatStrs,
    preset_PatDescs
  } from './presets.js';

  import {
    storePatternsInit,
    storePatternRemove,
    storePatternRemAll
  } from './browser.js';

  import {
    userSetPattern,
    userClearPattern
  } from './cmduser2.js';

  import {
    menuPresets,
    menuBrowser,
    menuDevice,
    menuCreate
  } from './menu.js';

  let openDelete = false;
  let delname, deltitle, deleteall;

  const delone = () =>
  {
    delname = $pStrand.curPatternName;
    deltitle = `Delete Saved Pattern: "${delname}"`;
    deleteall = false;
    openDelete = true;
  }

  const delall = () =>
  {
    delname = '';
    deltitle = 'Delete ALL Saved Patterns';
    deleteall = true;
    openDelete = true;
  }

  const dodelete = () =>
  {
    openDelete = false;

    if (deleteall) storePatternRemAll();
    else storePatternRemove(delname);

    storePatternsInit();
    menuCreate();

    userClearPattern();
    $pStrand.curPatternId = MENUID_BROWSER;

    // triggers update to UI - MUST HAVE THIS
    $patsMenuItems = $patsMenuItems;
  }

  let isbrowser;
  $: isbrowser = ($pStrand.curPatternId > MENUID_BROWSER) &&
                 ($pStrand.curPatternId < MENUID_DEVICE);

  $: doselect($pStrand.curPatternId);
  const doselect = (id) =>
  {
    if (id === $pStrand.curPattIdOld)
      return;

    console.log(`Selecting id=${id}`);

    if ((id === MENUID_PRESETS)  ||
        (id === MENUID_BROWSER) ||
        (id === MENUID_DEVICE))
      userClearPattern();

    $pStrand.curPattIdOld = id;
    $pStrand.curPatternId = id;
    $patsSelectedID = [ id ];

    if ((id === MENUID_CUSTOM)   ||
        (id === MENUID_PRESETS)  ||
        (id === MENUID_BROWSER) ||
        (id === MENUID_DEVICE))
      return;

    let pcmd;
    if (id < MENUID_BROWSER)
    {
      id -= MENUID_PRESETS+1;
      $pStrand.curPatternName = menuPresets.children[id].text;
      $pStrand.curPatternDesc = preset_PatDescs[id];
      pcmd = preset_PatStrs[id];
    }
    else if (id < MENUID_DEVICE)
    {
      id -= MENUID_BROWSER+1;
      $pStrand.curPatternName = menuBrowser.children[id].text;
      $pStrand.curPatternDesc = $aStoredDesc[id];
      pcmd = $aStoredPatt[id];
    }
    else
    {
      id -= MENUID_DEVICE+1;
      $pStrand.curPatternName = menuDevice.children[id].text;
      $pStrand.curPatternDesc = $aDeviceDesc[id];
      pcmd = $aDevicePatt[id];
    }

    userSetPattern(pcmd);
  }

</script>

<div style="padding-top:10px; margin-left:10px;"></div>
<p style="font-size:.98em;">Pattern Choice:</p>

<TreeView size="compact" style="margin-top:-10px;"
  bind:children={$patsMenuItems}
  bind:activeId={$pStrand.curPatternId}
  bind:selectedIds={$patsSelectedID}
  bind:expandedIds={$patsOpenItems}
  on:focus={({detail}) => { doselect(detail.id); }}
/>

<div style="padding-top:10px; margin-left:10px;"></div>
<p style="font-size:.98em;">Pattern Description:</p>
<p style="margin-top:2px; padding:5px; font-size:.95em;
          color: var(--color-textbox);
          background-color: var(--bg-color-textbox);">
  {$pStrand.curPatternDesc}</p>

{#if ($aStoredPatt.length > 0) }
  <div style="margin-top:15px; margin-bottom:5px; text-align:center;">
    <button class="button-delete"
      on:click={delall}
      disabled={!isbrowser}
      >Delete One
    </button>
    <button class="button-delete"
      on:click={delone}
      disabled={!isbrowser}
      >Delete All
    </button>
  </div>
{/if}

<Modal
  passiveModal
  modalHeading={deltitle}
  bind:open={openDelete}
  on:close
  >
  <ButtonSet>
    <Button kind="secondary" on:click={() => {openDelete = false;}}>Cancel</Button>
    <Button on:click={dodelete}>Delete</Button>
  </ButtonSet>
</Modal>

<style>
  .button-delete {
    width: 90px;
    height: 35px;
    padding: 5px;
    margin-left: 10px;
  }
</style>
