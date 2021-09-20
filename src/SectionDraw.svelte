<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Dropdown,
    Checkbox
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    MAX_DELAY_VALUE
  } from './pixcmds.js';

  import {
    pStrand,
    aEffectsDraw,
    aEffDrawDesc
  } from './globals.js';

  import {
    pluginBit_DELAY,
    pluginBit_DIRECTION,
    pluginBit_ORIDE_DELAY,
    pluginBit_ORIDE_DIR,
    pluginBit_ORIDE_EXT
  } from './presets.js';

  import {
    userSetDrawEffect,
    userSetBright,
    userSetDelay,
    userSetOffset,
    userSetLength,
    userSetOwrite,
    userSetDirect
  } from './cmduser.js'

  import SectionTrigger from './SectionTrigger.svelte';
  import SlidersPropsLocal from './SlidersPropsLocal.svelte';
  import SliderVal from './SliderVal.svelte';

  export let track;

  const setEffect = () => { userSetDrawEffect(track); }
  const setBright = () => { userSetBright(track); }
  const setDelay  = () => { userSetDelay( track); }
  const setOwrite = () => { userSetOwrite(track); }
  const setOffset = () => { userSetOffset(track); }
  const setLength = () => { userSetLength(track); }
  const setDirect = () => { userSetDirect(track); }

</script>

<div style="padding-left:5px;">
  <MediaQuery query="(max-width: 400px)" let:matches>
    {#if matches}
      <Row>
        <p style="font-size:.9em;">Draw Effect:</p>
      </Row>
    {/if}
  </MediaQuery>
  <Row>
    <MediaQuery query="(min-width: 401px)" let:matches>
      {#if matches}
        <p style="font-size:.9em; margin:7px 12px 0 0;">Draw Effect:</p>
      {/if}
    </MediaQuery>
    <Dropdown
      size="sm"
      type="inline"
      on:select={setEffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex}
      bind:items={$aEffectsDraw}
    />
    {#if ((track !== 0) && ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex !== 0)) }
      <div style="margin-top:7px; margin-left:30px;">
        <Checkbox labelText="Overwrite"
          on:check={setOwrite}
          bind:checked={$pStrand.tracks[track].drawProps.orPixelVals}
        />
      </div>
    {/if}
  </Row>

  <Row style="margin-top:-13px; margin-right:-10px; padding:5px;
              color: var(--color-textbox);
              background-color: var(--bg-color-textbox);">
    <p style="font-size:.9em;">
      {$aEffDrawDesc[$pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex]}
    </p>
  </Row>

  {#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginIndex !== 0) }

    <Row>
      <SliderVal name='Bright'
        onchange={setBright}
        bind:cur={$pStrand.tracks[track].drawProps.pcentBright}
      />
    </Row>
    <Row>
      <SliderVal name='Delay&nbsp;'
        onchange={setDelay}
        min={-MAX_DELAY_VALUE}
        max={MAX_DELAY_VALUE}
        bind:cur={$pStrand.tracks[track].drawProps.msecsDelay}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_DELAY) ||
                   ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DELAY)}
      />
    </Row>
    <Row>
      <SliderVal name='Offset'
        onchange={setOffset}
        bind:cur={$pStrand.tracks[track].drawProps.pcentOffset}
        disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
      />
    </Row>
    <Row>
      <SliderVal name='Length'
        onchange={setLength}
        bind:cur={$pStrand.tracks[track].drawProps.pcentExtent}
        disabled={($pStrand.tracks[track].trackBits & pluginBit_ORIDE_EXT)}
      />
    </Row>

    <SlidersPropsLocal {track} />

    <Row style="margin-top:7px;">
      <Checkbox labelText="Reverse Direction"
        on:check={setDirect}
        bind:checked={$pStrand.tracks[track].drawProps.reverseDir}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_DIRECTION) ||
                   ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DIR)}
      />
    </Row>

    <SectionTrigger {track} />

  {/if}
</div>
