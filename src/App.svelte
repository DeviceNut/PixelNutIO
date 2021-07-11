<script>
  import {
    Grid,
    Row,
    Column,
    NumberInput,
  }
  from "carbon-components-svelte";

  import {
    nStrands, eStrands,
    xTracks, xLayers,
    nTracks, nLayers,
    iTracks, iLayers,
   }
   from './globalVars.js';

  import { makePatternsAndEffects } from './makeLists.js';

  import Strands from "./Strands.svelte"
  import Patterns from "./Patterns.svelte"
  import MainControls from "./MainControls.svelte";
  import MyTabs from "./MyTabs.svelte";
  import PredrawControls from "./PredrawControls.svelte";

  let appname = 'PixelNut!';

  // 3 strands, enable only first one
  nStrands.set(3);
  let list = [];
  for (let i = 0; i < $nStrands; ++i) list.push(false);
  eStrands.set(list);

  // set from device:
  xTracks.set(4);      // maximum possible
  xLayers.set(8);
  nTracks.set(1);      // currently instantiated
  nLayers.set([1]);
  iTracks.set([[0]]);  // layer ids from 0
  iLayers.set([{track:1, layer:1}]);

  let nlayers = 1;
  $: {
    list = [];
    list.push(nlayers);
    nLayers.set(list);
  }

  $: if (nlayers > 2) makePatternsAndEffects();

</script>

<main>
  <p class="header">{appname}</p>
  {#if ($nStrands > 1) }
    <div id="strands" class="cc-row"> <Strands/> </div>
  {/if}
  <div class="separate"></div>
  <div class="patrn-row"> <Patterns/> </div>
  <div class="separate"></div>
  <div class="ctrl-row"> <MainControls/> </div>
  <div class="cc-row">
    <MyTabs/>
  </div>

  <div class="separate"></div>
  <div class="ctrl-row"><PredrawControls/></div>

  <div style="position:absolute; bottom:30px;">
      <NumberInput label="Tracks" bind:value={$nTracks} />
      <NumberInput label="Layers" bind:value={nlayers} />
  </div>
</main>

<style>
  main {
    margin: 0 auto;
  }
  .header {
    text-align:center;
    font-style:italic;
    font-family:'Trebuchet MS';
    font-size:1.7em;
    background-color:#333433;
  }
  .separate {
    margin: 0 15px 0 15px;
    padding-top: 2px;
    background-color:#333433;
  }
  #strands {
    display: block;
  }
  .cc-row {
    padding: 0 15px 0 15px;
    background-color:black;
  }
  .patrn-row {
    padding: 0 15px 0 25px;
    background-color:black;
  }
  .ctrl-row {
    padding: 5px 15px 15px 25px;
    background-color:black;
  }
</style>
