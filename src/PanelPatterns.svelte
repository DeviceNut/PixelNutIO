<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Dropdown,
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
    aCurListDesc,
    updateSources,
    updatePatterns,
    storedPattern
  } from './globals.js';

  import { userSetPattern  } from './cmduser.js';

  import ButtonsPatterns from './ButtonsPatterns.svelte';

  let listsources = [];
  $:
  {
    if ($updateSources)
    {
      console.log('updating sources...');
      listsources = [];

      if ($aDevicePats.length > 0) listsources.push({ id: 1, text: 'Device' });
      if ($aStoredPats.length > 0) listsources.push({ id: 2, text: 'Stored' });

      listsources.push({ id: 0, text: 'Website' });

      if ($storedPattern && ($aStoredPats.length > 0))
      {
        let index = 0;
        let i = 0;
        for (let i = 0; i < listsources.length; ++i)
        {
          if (listsources[i].id == 2)
          {
            index = i;
            break;
          }
        }
        console.log('indexes: ', index, ($aStoredPats.length - 1));

        $pStrand.indexSources = index;
        $pStrand.indexPatterns = ($aStoredPats.length - 1);
        $updatePatterns = true;
      }

      $updateSources = false;
    }
  }

  $:
  {
    if ($updatePatterns)
    {
      console.log('updating patterns...');
      switch (listsources[$pStrand.indexSources].id)
      {
        default:
        {
          $aCurListPats = $aBuiltinPats;
          $aCurListDesc = $aBuiltinDesc;
          $pStrand.fromStored = false;
          break;
        }
        case 1:
        {
          $aCurListPats = $aDevicePats;
          $aCurListDesc = $aDeviceDesc;
          $pStrand.fromStored = false;
          break;
        }
        case 2:
        {
          $aCurListPats = $aStoredPats;
          $aCurListDesc = $aStoredDesc;
          $pStrand.fromStored = true;
          break;
        }
      }

      $updatePatterns = false;
    }
  }

  const selsource = () =>
  {
    if (!$storedPattern)
    {
      $updatePatterns = true;
      $pStrand.indexPatterns = 0;
    }
    else $storedPattern = false;
  }

  $updateSources = true;
  $updatePatterns = true;

</script>

{#if listsources.length > 1}

  <div style="margin-top:10px; text-align:center;">
    <p style="font-size:.9em;">Choose source and pattern:</p>
  </div>

  <MediaQuery query="(max-width: 400px)" let:matches>
    {#if matches}
      <div style="margin-top:5px; text-align:center;">
        <Dropdown
          size="sm"
          type="inline"
          on:select={selsource}
          bind:selectedIndex={$pStrand.indexSources}
          bind:items={listsources}
        />
      </div>
      <div style="margin-top:-20px; text-align:center;">
        <Dropdown
          size="sm"
          type="inline"
          on:select={userSetPattern}
          bind:selectedIndex={$pStrand.indexPatterns}
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
            size="sm"
            type="inline"
            on:select={selsource}
            bind:selectedIndex={$pStrand.indexSources}
            bind:items={listsources}
          />
        </div>
        <div style="display:inline-block;">
          <Dropdown
            size="sm"
            type="inline"
            on:select={userSetPattern}
            bind:selectedIndex={$pStrand.indexPatterns}
            bind:items={$aCurListPats}
          />
        </div>
      </div>
    {/if}
  </MediaQuery>

  <Row style="margin-top:-10px;">
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
            size="sm"
            type="inline"
            on:select={userSetPattern}
            bind:selectedIndex={$pStrand.indexPatterns}
            bind:items={$aCurListPats}
          />
        </div>
      </Row>

      <Row style="margin-top:-10px;">
        <div style="margin-left:20px;">
          <ButtonsPatterns/>
        </div>
      </Row>

    {/if}
  </MediaQuery>

  <MediaQuery query="(min-width: 501px)" let:matches>
    {#if matches}

      <Row style="margin-top:10px;">
        <div style="margin:0 auto;">
          <Dropdown
            style="text-align:center;"
            titleText="Select:"
            size="sm"
            type="inline"
            on:select={userSetPattern}
            bind:selectedIndex={$pStrand.indexPatterns}
            bind:items={$aCurListPats}
          />
        </div>
      </Row>

      <Row style="margin-top:-10px;">
        <div style="margin:0 auto;">
          <ButtonsPatterns/>
        </div>
      </Row>
    {/if}
  </MediaQuery>

{/if}
