<script>

import {
    TreeView,
    Modal,
    Button,
    ButtonSet
  } from "carbon-components-svelte";

  import {
    aStoredPatt,
    aStoredDesc,
    aDevicePatt,
    aDeviceDesc,
    patsMenuOpen,
    patsActiveID,
    patsOpenItems,
    patsSelectedID,
    patsMenuItems,
    patsCurText,
    MENUID_PRESETS,
    MENUID_BROWSWER,
    MENUID_DEVICE,
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
    storePatternRemove
  } from './browser.js';

  import { userSetPattern } from './cmduser2.js';

  let isbrowser = false;
  let delstr = 'Delete...';
  $: {

    if ((MENUID_BROWSWER <= $patsActiveID) && ($patsActiveID < MENUID_DEVICE))
    {
      isbrowser = true;
      delstr = ($patsActiveID == MENUID_BROWSWER) ? 'Delete All' : 'Delete One';
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

    $patsMenuItems = $patsMenuItems; // triggers update to UI - MUST HAVE THIS

    // TODO: reset current pattern, and reset patsMenuItems if necessary

    openDelete = false;
  }

  // TODO: set initial choice

  const doselect = (id) =>
  {
    console.log(`Selecting id=${id}`);

    $patsActiveID = id;
    $patsSelectedID = [ $patsActiveID ];

    if ((id == MENUID_PRESETS)  ||
        (id == MENUID_BROWSWER) ||
        (id == MENUID_DEVICE))
      return; // on category, do nothing

    let name, pcmd;
    if (id < MENUID_BROWSWER)
    {
      id -= MENUID_PRESETS+1;
      name = menuPresets.children[id].text;
      pcmd = preset_PatStrs[id];
      $patsCurText = preset_PatDescs[id];
    }
    else if (id < MENUID_DEVICE)
    {
      id -= MENUID_BROWSWER+1;
      name = menuBrowser.children[id].text;
      pcmd = $aStoredPatt[id];
      $patsCurText = $aStoredDesc[id];
      delname = name;
    }
    else
    {
      id -= MENUID_DEVICE+1;
      name = menuDevice.children[id].text;
      pcmd = $aDevicePatt[id];
      $patsCurText = $aDeviceDesc[id];
    }
    userSetPattern(name, pcmd);
  }

</script>

<div style="padding-top:10px; margin-left:10px;"></div>
<p>Patterns to choose from:</p>

<TreeView size="compact"
  bind:children={$patsMenuItems}
  bind:activeId={$patsActiveID}
  bind:selectedIds={$patsSelectedID}
  bind:expandedIds={$patsOpenItems}
  on:focus={({detail}) => { doselect(detail.id); }}
/>

<div style="padding-top:10px; margin-left:10px;"></div>
<p>Pattern Description:</p>
<p style="margin-top:10px; padding:5px; font-size:.95em;
          color: var(--color-textbox);
          background-color: var(--bg-color-textbox);">
  {$patsCurText}</p>

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
