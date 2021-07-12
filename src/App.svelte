<script>

  //import { NumberInput } from "carbon-components-svelte";

  import {
    nStrands, eStrands,
    xTracks, nTracks, sTracks, mTracks,
    xLayers, tLayers, nLayers, sLayers, mLayers,
    curStrandID
   }
   from './globals.js';

  import Header from "./Header.svelte"
  import { makePatternsAndEffects } from './presets.js';

  import PageControls from "./PageControls.svelte"

  let appname = 'PixelNut!';

  // obtained from the device:
  let max_strands = 3;      // number present
  let max_tracks = 4;       // maximum possible
  let max_layers = 16;      // maximum possible

  let list = []; // used to create arrays

  // 3 strands, enable the current one
  nStrands.set(max_strands);
  list = [];
  for (let i = 0; i < $nStrands; ++i) list.push(false);
  list[$curStrandID] = true;
  eStrands.set(list);

  xTracks.set(max_tracks);
  xLayers.set(max_layers);
  tLayers.set(max_layers/max_tracks);

  nTracks.set(1); // track #1 always active
  list = [];      // create list of booleans
  for (let i = 0; i < $xTracks; ++i) list.push(false);
  let list2 = [...list]; // make copy of this list
  mTracks.set(list);     // all track starts off by being
  sTracks.set(list2);    // not muted and solo disabled

  list = [];  // create list of active layers
  for (let i = 0; i < $xTracks; ++i) list.push(1);
  nLayers.set(list);  // layer #1 always active

  list = [];  // create list of solo/mute enables
  for (let j = 0; j < $tLayers; ++j) list.push(false);

  let alist1 = []; // create array of solo lists
  let alist2 = []; // create array of mute lists
  for (let i = 0; i < $tLayers; ++i)
  {
    let newlist = [...list]; // make copy of list
    alist1.push(newlist);
    newlist = [...list];
    alist2.push(newlist);
  }

  sLayers.set(alist1); // all track starts off by being
  mLayers.set(alist2); // not muted and solo disabled

  makePatternsAndEffects();

  /*
    let nlayers = $nLayers;
    $: {
      list = [];
      list.push(nlayers);
      nLayers.set(list);
    }
    $: if (nlayers >= 2) makePatternsAndEffects();

    <div style="position:absolute; bottom:30px; margin:10px;">
        <NumberInput label="Tracks" bind:value={$nTracks} />
        <NumberInput label="Layers" bind:value={nlayers} />
    </div>
  */

</script>

<Header {appname}/>
<PageControls/>
