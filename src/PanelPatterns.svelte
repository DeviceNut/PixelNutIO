<script>

  import MediaQuery from "svelte-media-query";

  import {
    Dropdown,
    TextInput
  } from "carbon-components-svelte";

  import {
    pStrand,
    aDevicePats,
    aDeviceDesc,
    aStoredPats,
    aStoredDesc,
    aBuiltinPats,
    aBuiltinDesc,
    aCurListPats,
    updateSources,
    storedPattern,
    selectSource,
    selectPattern
  } from './globals.js';

  import { userSetPattern  } from './cmduser2.js';

  import ButtonsPatterns from './ButtonsPatterns.svelte';

  const SOURCE_DEVICE      = 0;    // read from current device
  const SOURCE_BROWSER     = 1;    // user stored to this browser
  const SOURCE_WEBSITE     = 2;    // built into this website

  $:
  {
    if ($updateSources)
    {
      //console.log('updating sources: idx=', $pStrand.curSourceIdx); // DEBUG

      listSources = [];

      if ($aDevicePats.length > 0) listSources.push({ id: SOURCE_DEVICE,  text: 'Device' });
      if ($aStoredPats.length > 0) listSources.push({ id: SOURCE_BROWSER, text: 'Browser' });

      listSources.push({ id: SOURCE_WEBSITE, text: 'Website' });

      // if just stored a pattern, change current selection to be that
      if ($storedPattern && ($aStoredPats.length > 0))
      {
        let index = 0;
        let i = 0;
        for (let i = 0; i < listSources.length; ++i)
        {
          if (listSources[i].id == SOURCE_BROWSER)
          {
            index = i;
            break;
          }
        }
        //console.log('indexes: ', index, ($aStoredPats.length - 1)); // DEBUG

        $pStrand.curSourceIdx = index;
        $pStrand.curPatternIdx = ($aStoredPats.length - 1);

        $storedPattern = false;
      }

      $updateSources = false;

      updatePatternLists();
    }
  }

  let listSources = [];
  let listDescrips = [];

  function updatePatternLists()
  {
      //console.log('updating patterns: idx=', $pStrand.curSourceIdx); // DEBUG

    switch (listSources[$pStrand.curSourceIdx].id)
    {
      default:
      {
        $aCurListPats = $aBuiltinPats;
        listDescrips  = $aBuiltinDesc;
        $pStrand.browserSource = false;
        break;
      }
      case SOURCE_DEVICE:
      {
        $aCurListPats = $aDevicePats;
        listDescrips  = $aDeviceDesc;
        $pStrand.browserSource = false;
        break;
      }
      case SOURCE_BROWSER:
      {
        $aCurListPats = $aStoredPats;
        listDescrips  = $aStoredDesc;
        $pStrand.browserSource = true;
        break;
      }
    }
  }

  const selsource = () =>
  {
    if ($selectSource)
    {
      if (!$storedPattern)
      {
        $pStrand.curPatternIdx = 0;
        updatePatternLists();
      }
    }
    else $selectSource = true;
  }

  const selpattern = () =>
  {
    // prevent changing pattern when return from docs
    if (!$selectPattern) $selectPattern = true;

    else userSetPattern();
  }

  $updateSources = true;

  let pstr = '';
  let showHelp = true;
  let listdesc = [];
  $:
  {
    if ($pStrand.curSourceIdx !== 0)
      listdesc = listDescrips[$pStrand.curPatternIdx];
  }

  $: pstr = (showHelp ? "^" : "?");

  const promptSelect  = 'Select source, then pattern:';
  const promptToClear = 'Clear to select new pattern';

</script>

{#if !$pStrand.showMenu}

<p style="margin-top:10px; text-align:center; font-size:.9em;">
  {promptToClear}</p>

<div style="margin-top:20px; text-align:center;">
  <TextInput
    style="width:250px; margin:0 auto;"
    placeholder='Enter name of pattern here'
    bind:value={$pStrand.curPatternName}
    maxlength="32"
  />
</div>

<div style="margin-top:20px; text-align:center;">
  <ButtonsPatterns/>
</div>

{:else}

  <MediaQuery query="(max-width: 620px)" let:matches>
    {#if matches}
      <p style="font-size:.9em; margin-top:10px; text-align:center;">
        {promptSelect}</p>

      {#if listSources.length > 1}
        <div style="margin-top:10px; text-align:center;">
          <Dropdown
            size="lg"
            type="inline"
            on:select={selsource}
            bind:selectedIndex={$pStrand.curSourceIdx}
            bind:items={listSources}
          />
        </div>
      {/if}
      <div style="margin-top:10px; text-align:center;">
        <Dropdown
          size="lg"
          type="inline"
          on:select={selpattern}
          bind:selectedIndex={$pStrand.curPatternIdx}
          bind:items={$aCurListPats}
        />
      </div>
    {/if}
  </MediaQuery>

  <MediaQuery query="(min-width: 621px)" let:matches>
    {#if matches}
      <p style="font-size:.9em; margin-top:10px; text-align:center;">
        {promptSelect}</p>
      <div style="margin-top:10px; text-align:center;">
        {#if listSources.length > 1}
          <div style="width:120px; display:inline-block;">
            <Dropdown
              size="lg"
              type="inline"
              on:select={selsource}
              bind:selectedIndex={$pStrand.curSourceIdx}
              bind:items={listSources}
            />
          </div>
        {/if}
        <div style="width:120px; display:inline-block;">
          <Dropdown
            size="lg"
            type="inline"
            on:select={selpattern}
            bind:selectedIndex={$pStrand.curPatternIdx}
            bind:items={$aCurListPats}
          />
        </div>
      </div>
    {/if}
  </MediaQuery>

  <div class="bdiv" class:select={$pStrand.showCustom} on:click={() => { showHelp = !showHelp; }} >
    <span class="btext" >{pstr}</span>
  </div>
  {#if showHelp }
    <div class="pattern-desc">
      {#each listdesc as para,n}
        <p style="font-size:.93em;">{para}</p><br>
      {/each}
    </div>
  {/if}
  <div style="margin-top:20px; text-align:center;">
    <ButtonsPatterns/>
  </div>

{/if}

<style>
  .bdiv {
    cursor: pointer;
    margin-top: 15px;
    padding: 1px;
    text-align: center;
    background-color: var(--bg-color-button);
  }
  .pattern-desc {
    padding: 10px 10px 0 10px;
    color: var(--color-textbox);
    background-color: var(--bg-color-textbox);
  }
</style>
