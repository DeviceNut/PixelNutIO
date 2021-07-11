<script>
  import { NumberInput } from "carbon-components-svelte";

  import {
    nStrands, eStrands,
    xTracks, xLayers,
    nTracks, nLayers,
    iTracks, iLayers,
    curStrandID
   }
   from './globalVars.js';

  import { makePatternsAndEffects } from './makeLists.js';

  import PageControls from "./PageControls.svelte"

  let appname = 'PixelNut!';

  // 3 strands, enable only first one
  nStrands.set(3);
  let list = [];
  for (let i = 0; i < $nStrands; ++i) list.push(false);
  list[$curStrandID] = true;
  eStrands.set(list);

  // set from device:
  xTracks.set(4);      // maximum possible
  xLayers.set(8);
  nTracks.set(1);      // currently instantiated
  nLayers.set([2]);
  iTracks.set([[0,1]]);  // layer ids from 0
  iLayers.set([{track:1, layer:1},{track:1, layer:2}]);

  let nlayers = $nLayers;
  $: {
    list = [];
    list.push(nlayers);
    nLayers.set(list);
  }
  $: if (nlayers >= 2) makePatternsAndEffects();

</script>

<div style="position:absolute; bottom:30px; margin:10px;">
    <NumberInput label="Tracks" bind:value={$nTracks} />
    <NumberInput label="Layers" bind:value={nlayers} />
</div>

<PageControls {appname}/>
