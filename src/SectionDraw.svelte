<script>

  import {
    Row,
    Checkbox
  } from "carbon-components-svelte";

  import {
    pStrand,
  } from './globals.js';

  import {
    pluginBit_DELAY,
    pluginBit_DIRECTION,
    pluginBit_ORIDE_DELAY,
    pluginBit_ORIDE_DIR,
    pluginBit_ORIDE_EXT
  } from './devcmds.js';

  import {
    userSetBright,
    userSetDelay,
    userSetOffset,
    userSetLength,
    userSetOrPixs,
    userSetBackwards
  } from './cmduser1.js'

  import SlidersPropsLocal from './SlidersPropsLocal.svelte';
  import SectionTrigger from './SectionTrigger.svelte';
  import SliderVal from './SliderVal.svelte';

  export let track;

  const setBright = () => { userSetBright(  track); }
  const setDelay  = () => { userSetDelay(   track); }
  const setOrPixs = () => { userSetOrPixs(  track); }
  const setOffset = () => { userSetOffset(  track); }
  const setLength = () => { userSetLength(  track); }
  const setBwards = () => { userSetBackwards(track); }

</script>

<div style="margin-left:10px; margin-bottom:13px;">
  <Row>
    <SliderVal name='Bright'
      onchange={setBright}
      bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
    />
  </Row>
  <Row>
    <SliderVal name='Delay&nbsp;'
      onchange={setDelay}
      bind:cur={$pStrand.tracks[track].drawProps.pcentDelay}
      disabled={ !($pStrand.tracks[track].trackBits & pluginBit_DELAY) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DELAY)}
    />
  </Row>
  <Row>
    <SliderVal name='Offset'
      onchange={setOffset}
      bind:cur={$pStrand.tracks[track].drawProps.pcentXoffset}
      disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
    />
  </Row>
  <Row>
    <SliderVal name='Length'
      onchange={setLength}
      bind:cur={$pStrand.tracks[track].drawProps.pcentXlength}
      disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
    />
  </Row>
  <Row style="margin-top:10px;">
    <Checkbox labelText="Combine Pixels"
      on:check={setOrPixs}
      bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
      disabled={(track === 0)}
    />
  </Row>
  <Row style="margin-top:10px;">
    <Checkbox labelText="Move Backwards"
      on:check={setBwards}
      bind:checked={$pStrand.tracks[track].drawProps.dirBackwards}
      disabled={ !($pStrand.tracks[track].trackBits & pluginBit_DIRECTION) ||
                  ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DIR) }
    />
  </Row>
</div>

<SlidersPropsLocal {track} />
<SectionTrigger {track} />
