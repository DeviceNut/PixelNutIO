<script>

  import {
    defDeviceName,
    globalsInit
  } from './globals.js';

  import { strandsInit } from './strands.js';
  import { presetsInit } from './presets.js';
  import { storePatternInit } from './userstore.js';

  import PageControls from "./PageControls.svelte"

  let devname = defDeviceName; // TODO: get from device

  // obtained from the device:
  let max_strands = 4;      // number present
  let max_tracks = 4;       // max possible
  let max_layers = 16;      // max possible
  let max_pixels = [];      // max pixels list

  for (let i = 0; i < max_strands; ++i)
    max_pixels.push(300);

  globalsInit(devname, max_strands, max_tracks, max_layers, max_pixels);
  strandsInit();
  presetsInit();
  storePatternInit();

</script>

<PageControls/>
