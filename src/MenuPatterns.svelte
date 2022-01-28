<script>

  import {
    TreeView,
    Modal,
    Button
  } from "carbon-components-svelte";

  import {
    pStrand,
    aStoredPatt,
    aStoredDesc,
    aDevicePatt,
    aDeviceDesc,
    patsOpenItems,
    patsSelectedID,
    patsMenuItems,
    allowUpdates,
    showCustom,
    userCustom
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
  } from './cmdpats.js';

  import {
    MENUID_CUSTOM,
    MENUID_PRESETS,
    MENUID_BROWSER,
    MENUID_DEVICE,
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

    if (deleteall)
         storePatternRemAll();
    else storePatternRemove(delname);

    storePatternsInit();
    menuCreate();

    userClearPattern();
  }

  let isbrowser;
  $: isbrowser = ($pStrand.curPatternId > MENUID_BROWSER) &&
                 ($pStrand.curPatternId < MENUID_DEVICE);

  const doselect = (id) =>
  {
    //console.log(`Pattern ID: ${$pStrand.curPatternId} => ${id}`);

    if (id === $pStrand.curPatternId) return;

    $pStrand.curPatternId = id;
    $patsSelectedID = [ id ];

    if (id === MENUID_CUSTOM) return;

    if ((id !== MENUID_PRESETS) &&
        (id !== MENUID_BROWSER) &&
        (id !== MENUID_DEVICE))
    {
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

      if ($userCustom) $showCustom = true;
    }
    else userClearPattern(false);

    if ($showCustom)
    {
      // supress reactive changes until UI updated
      //console.log('Supress updates...');
      $allowUpdates = false;
    }
  }

</script>

<div class="area"></div>
<p class="setfont">Pattern Choice:</p>

<TreeView size="compact" style="margin-top:-10px;"
  bind:children={$patsMenuItems}
  bind:activeId={$pStrand.curPatternId}
  bind:selectedIds={$patsSelectedID}
  bind:expandedIds={$patsOpenItems}
  on:focus={({detail}) => { doselect(detail.id); }}
/>

<div class="area"></div>
<p class="setfont">Pattern Description:</p>
<p class="descrip">{ $pStrand.curPatternDesc }</p>

{#if ($aStoredPatt.length > 0) }
  <div class="buttons">
    <button class="button-delete"
      on:click={delone}
      disabled={!isbrowser}
      >Delete One
    </button>
    <button class="button-delete"
      on:click={delall}
      disabled={!isbrowser}
      >Delete All
    </button>
  </div>
{/if}

<Modal
  size="sm"
  passiveModal
  preventCloseOnClickOutside
  modalHeading={deltitle}
  bind:open={openDelete}
  on:close
  >
  <Button kind="secondary" on:click={() =>{openDelete = false}}>Cancel</Button>
  <Button on:click={dodelete}>Delete</Button>
</Modal>

<style>
  .area {
    padding-top: 10px;
    margin-left: 10px;
  }
  .setfont {
    font-size: .98em;
  }
  .descrip {
    font-size: .95em;
    margin-top: 2px;
    padding: 5px;
    color: var(--fgc-textbox);
    background-color: var(--bgc-panel);
  }
  .buttons {
    margin-top: 15px;
    margin-bottom: 5px;
    text-align: center;
  }
  .button-delete {
    width: 90px;
    height: 35px;
    padding: 5px;
    margin-left: 10px;
  }
</style>
