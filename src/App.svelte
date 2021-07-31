<script>

  import {
    PAGEMODE_DEVICES,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode,
    defDeviceName,
    globalsInit
  } from './globals.js';

  import { mqttConnect } from './mqtt.js';
  import { strandsInit } from './strands.js';
  import { presetsInit } from './presets.js';
  import { storePatternInit } from './userstore.js';

  import PageDevices from "./PageDevices.svelte"
  import PageControls from "./PageControls.svelte"
  import PageHelpDocs from "./PageHelpDocs.svelte"

  // obtained from the device:
  let max_strands = 4;      // number present
  let max_tracks = 4;       // max possible
  let max_layers = 16;      // max possible
  let max_pixels = [];      // max pixels list

  for (let i = 0; i < max_strands; ++i)
    max_pixels.push(300);

  globalsInit(max_strands, max_tracks, max_layers, max_pixels);
  strandsInit();
  presetsInit();
  storePatternInit();
  mqttConnect();

  curPageMode.set(PAGEMODE_DEVICES);

</script>

{#if ($curPageMode === PAGEMODE_HELPDOCS)}
  <PageHelpDocs/>
{:else if ($curPageMode === PAGEMODE_CONTROLS)}
  <PageControls/>
{:else}
  <PageDevices/>
{/if}