<script>

  import MediaQuery from "svelte-media-query";
  import { Row, Dropdown } from "carbon-components-svelte";

  import {
    pStrand,
    aDevicePats,
    aDeviceDesc,
    aStoredPats,
    aStoredDesc,
    aBuiltinPats,
    aBuiltinDesc,
    aCurListPats,
    aCurListDesc,
    aListSources,
    updateSources,
    storedPattern,
    selectSource,
    selectPattern
  } from './globals.js';

  import { userSetPattern  } from './cmduser.js';

  import ButtonsPatterns from './ButtonsPatterns.svelte';

  const SOURCE_DEVICE      = 0;    // read from current device
  const SOURCE_BROWSER     = 1;    // user stored to this browser
  const SOURCE_WEBSITE     = 2;    // built into this website

  $:
  {
    if ($updateSources)
    {
      //console.log('updating sources: idx=', $pStrand.curSourceIdx); // DEBUG

      $aListSources = [];

      if ($aDevicePats.length > 0) $aListSources.push({ id: SOURCE_DEVICE,  text: 'Device' });
      if ($aStoredPats.length > 0) $aListSources.push({ id: SOURCE_BROWSER, text: 'Browser' });

      $aListSources.push({ id: SOURCE_WEBSITE, text: 'Website' });

      // if just stored a pattern, change current selection to be that
      if ($storedPattern && ($aStoredPats.length > 0))
      {
        let index = 0;
        let i = 0;
        for (let i = 0; i < $aListSources.length; ++i)
        {
          if ($aListSources[i].id == SOURCE_BROWSER)
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

  function updatePatternLists()
  {
      //console.log('updating patterns: idx=', $pStrand.curSourceIdx); // DEBUG

    switch ($aListSources[$pStrand.curSourceIdx].id)
    {
      default:
      {
        $aCurListPats = $aBuiltinPats;
        $aCurListDesc = $aBuiltinDesc;
        $pStrand.browserSource = false;
        break;
      }
      case SOURCE_DEVICE:
      {
        $aCurListPats = $aDevicePats;
        $aCurListDesc = $aDeviceDesc;
        $pStrand.browserSource = false;
        break;
      }
      case SOURCE_BROWSER:
      {
        $aCurListPats = $aStoredPats;
        $aCurListDesc = $aStoredDesc;
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
    if ($selectPattern) userSetPattern();
    else $selectPattern = true;
  }

  $updateSources = true;

  $: margintop = ($aListSources.length > 1) ? -20 : 10;
  $: menuname  = ($aListSources.length > 1) ? 'menus' : 'menu';

</script>

{#if !$pStrand.showMenu}

<p style="font-size:.9em; margin-top:10px; text-align:center;">
  Clear to redisplay {menuname}</p>

<Row style="margin-top:20px;">
  <div style="margin: 0 auto;">
    <ButtonsPatterns/>
  </div>
</Row>

{:else}

  <MediaQuery query="(max-width: 500px)" let:matches>
    {#if matches}
      <p style="font-size:.9em; margin-top:10px; margin-left:13px;">
        Select pattern from {menuname}:</p>
  
        {#if $aListSources.length > 1}
        <div style="margin-top:10px; margin-left:7px;">
          <Dropdown
            size="lg"
            type="inline"
            on:select={selsource}
            bind:selectedIndex={$pStrand.curSourceIdx}
            bind:items={$aListSources}
          />
        </div>
      {/if}
      <div style="margin-top:{margintop}px; margin-left:7px;">
        <Dropdown
          size="lg"
          type="inline"
          on:select={userSetPattern}
          bind:selectedIndex={$pStrand.curPatternIdx}
          bind:items={$aCurListPats}
        />
      </div>
      <div style="margin:-7px;">
        <div style="margin-left:20px;">
          <ButtonsPatterns/>
        </div>
      </div>
    {/if}
  </MediaQuery>

  <MediaQuery query="(min-width: 501px) and (max-width: 620px)" let:matches>
    {#if matches}
      <p style="font-size:.9em; margin-top:10px; text-align:center;">
        Select pattern from {menuname}:</p>

      {#if $aListSources.length > 1}
        <div style="margin-top:10px; text-align:center;">
          <Dropdown
            size="lg"
            type="inline"
            on:select={selsource}
            bind:selectedIndex={$pStrand.curSourceIdx}
            bind:items={$aListSources}
          />
        </div>
      {/if}
      <div style="margin-top:{margintop}px; text-align:center;">
        <Dropdown
          size="lg"
          type="inline"
          on:select={selpattern}
          bind:selectedIndex={$pStrand.curPatternIdx}
          bind:items={$aCurListPats}
        />
      </div>
      <Row style="margin:-7px;">
        <div style="margin: 0 auto;">
          <ButtonsPatterns/>
        </div>
      </Row>
    {/if}
  </MediaQuery>

  <MediaQuery query="(min-width: 621px)" let:matches>
    {#if matches}
      <p style="font-size:.9em; margin-top:10px; text-align:center;">
        Select pattern from {menuname}:</p>
      <div style="margin-top:10px; text-align:center;">
        {#if $aListSources.length > 1}
          <div style="width:120px; display:inline-block;">
            <Dropdown
              size="lg"
              type="inline"
              on:select={selsource}
              bind:selectedIndex={$pStrand.curSourceIdx}
              bind:items={$aListSources}
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
      <Row style="margin:-7px;">
        <div style="margin: 0 auto;">
          <ButtonsPatterns/>
        </div>
      </Row>
    {/if}
  </MediaQuery>

{/if}

