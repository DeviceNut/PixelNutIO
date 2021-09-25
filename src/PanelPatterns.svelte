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

</script>

{#if $aListSources.length > 1}

  <div style="margin-top:10px; text-align:center;">
    <p style="font-size:.9em;">Choose source and pattern:</p>
  </div>

  <MediaQuery query="(max-width: 400px)" let:matches>
    {#if matches}
      <div style="margin-top:5px; text-align:center;">
        <Dropdown
          size="lg"
          type="inline"
          on:select={selsource}
          bind:selectedIndex={$pStrand.curSourceIdx}
          bind:items={$aListSources}
        />
      </div>
      <div style="margin-top:-20px; text-align:center;">
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
  <MediaQuery query="(min-width: 401px)" let:matches>
    {#if matches}
      <div style="margin-top:5px; text-align:center;">
        <div style="width:120px; display:inline-block;">
          <Dropdown
            size="lg"
            type="inline"
            on:select={selsource}
            bind:selectedIndex={$pStrand.curSourceIdx}
            bind:items={$aListSources}
          />
        </div>
        <div style="display:inline-block;">
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

  <Row>
    <div style="margin: 0 auto;">
      <ButtonsPatterns/>
    </div>
  </Row>

{:else}

  <MediaQuery query="(max-width: 500px)" let:matches>
    {#if matches}

      <Row style="margin-top:10px;">
        <div style="margin-left: 20px;">
          <Dropdown
            style="text-align:center;"
            titleText="Select:"
            size="lg"
            type="inline"
            on:select={userSetPattern}
            bind:selectedIndex={$pStrand.curPatternIdx}
            bind:items={$aCurListPats}
          />
        </div>
      </Row>

      <Row>
        <div style="margin-left:20px;">
          <ButtonsPatterns/>
        </div>
      </Row>

    {/if}
  </MediaQuery>

  <MediaQuery query="(min-width: 501px)" let:matches>
    {#if matches}

      <Row style="margin-top:5px;">
        <div style="margin:0 auto;">
          <Dropdown
            style="text-align:center;"
            titleText="Select:"
            size="lg"
            type="inline"
            on:select={userSetPattern}
            bind:selectedIndex={$pStrand.curPatternIdx}
            bind:items={$aCurListPats}
          />
        </div>
      </Row>

      <Row style="margin-top:-5px;">
        <div style="margin:0 auto;">
          <ButtonsPatterns/>
        </div>
      </Row>

    {/if}
  </MediaQuery>

{/if}
