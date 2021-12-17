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
    MENUID_PRESETS,
    MENUID_BROWSWER,
    MENUID_DEVICE,
    patsMenuOpen,
    patsOpenItems,
    patsSelectedID,
    patsMenuItems,
    menuPresets,
    menuBrowser,
    menuDevice
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

  let openDelete = false;
  let deleteall, delstr, delname, deltitle;

  const dodelete = () =>
  {
    openDelete = false;

    if (deleteall) storePatternRemAll();
    else storePatternRemove(delname);

    storePatternsInit();

    doselect(MENUID_BROWSWER);

    // triggers update to UI - MUST HAVE THIS
    $patsMenuItems = $patsMenuItems;
  }

  const doselect = (id) =>
  {
    console.log(`Selecting id=${id}`);

    $pStrand.curPatternId = id;
    $patsSelectedID = [ id ];

    delname = '';
    deltitle = '';
    delstr = 'Delete...';
    deleteall = false;

    if ((id === MENUID_PRESETS)  ||
        (id === MENUID_BROWSWER) ||
        (id === MENUID_DEVICE))
    {
      userClearPattern();
      $pStrand.curPatternId = id; // reset after clear

      if ((id === MENUID_BROWSWER) && ($aStoredPatt.length > 0))
      {
        delname = 'all';
        delstr = 'Delete All';
        deltitle = 'Delete ALL Saved Patterns';
        deleteall = true;
      }

      return;
    }

    let name, pcmd;
    if (id < MENUID_BROWSWER)
    {
      id -= MENUID_PRESETS+1;
      $pStrand.curPatternName = menuPresets.children[id].text;
      $pStrand.curPatternDesc = preset_PatDescs[id];
      pcmd = preset_PatStrs[id];
    }
    else if (id < MENUID_DEVICE)
    {
      id -= MENUID_BROWSWER+1;
      $pStrand.curPatternName = menuBrowser.children[id].text;
      $pStrand.curPatternDesc = $aStoredDesc[id];
      pcmd = $aStoredPatt[id];

      delname = $pStrand.curPatternName;
      delstr = 'Delete One';
      deltitle = `Delete Saved Pattern: "${delname}"`;
      deleteall = false;
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
  doselect($pStrand.curPatternId);

</script>

<div style="padding-top:10px; margin-left:10px;"></div>
<p>Pattern Choice:</p>

<TreeView size="compact" style="margin-top:-10px;"
  bind:children={$patsMenuItems}
  bind:activeId={$pStrand.curPatternId}
  bind:selectedIds={$patsSelectedID}
  bind:expandedIds={$patsOpenItems}
  on:focus={({detail}) => { doselect(detail.id); }}
/>

<div style="padding-top:10px; margin-left:10px;"></div>
<p>Pattern Description: {$pStrand.curPatternName}</p>
<p style="margin-top:2px; padding:5px; font-size:.95em;
          color: var(--color-textbox);
          background-color: var(--bg-color-textbox);">
  {$pStrand.curPatternDesc}</p>

<div style="margin-top:15px; margin-bottom:5px; text-align:center;">
  <button class="button-close"
    on:click={() => { $patsMenuOpen = false; }}
    >Close
  </button>
  <button class="button-delete"
    on:click={() => {openDelete = true;}}
    disabled={delname === ''}
    >{delstr}
  </button>
</div>

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
