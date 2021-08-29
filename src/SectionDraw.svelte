<script>

  import MediaQuery from "svelte-media-query";

  import {
    Row,
    Dropdown,
    Checkbox,
  } from "carbon-components-svelte";

  import {
    DRAW_LAYER,
    MAX_BYTE_VALUE
  } from './pixcmds.js';

  import {
    pStrand,
    aEffectsDraw,
    aEffDrawDesc
  } from './globals.js';

  import {
    pluginBit_DELAY,
    pluginBit_DIRECTION,
    pluginBit_TRIGGER,
    pluginBit_ORIDE_DELAY,
    pluginBit_ORIDE_DIR
  } from './presets.js';

  import {
    userSetDrawEffect,
    userSetBright,
    userSetDelay,
    userSetOffset,
    userSetExtent,
    userSetOwrite,
    userSetDirect,
    userSetTrigStart,
    userSetTrigMain
  } from './cmduser.js'

  import SectionTrigger from './SectionTrigger.svelte';
  import SlidersPropsLocal from './SlidersPropsLocal.svelte';
  import SliderVal from './SliderVal.svelte';

  export let track;

  const setEffect = () => { userSetDrawEffect(track); }
  const setBright = () => { userSetBright(track); }
  const setDelay  = () => { userSetDelay( track); }
  const setOwrite = () => { userSetOwrite(track); }
  const setDirect = () => { userSetDirect(track); }
  const setOffset = () => { userSetOffset(track); }
  const setExtent = () => { userSetExtent(track); }
  const autoStart = () => { userSetTrigStart(track); }
  const setMain   = () => { userSetTrigMain(track); }

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
        max={MAX_BYTE_VALUE}
        bind:cur={$pStrand.tracks[track].drawProps.msecsDelay}
        disabled={!($pStrand.tracks[track].trackBits & pluginBit_DELAY) ||
                   ($pStrand.tracks[track].trackBits & pluginBit_ORIDE_DELAY)}
      />
    </Row>
    <Row>
      <SliderVal name='Offset&nbsp;'
        onchange={setOffset}
        bind:cur={$pStrand.tracks[track].drawProps.pcentOffset}
      />
    </Row>
    <Row>
      <SliderVal name='Extent'
        onchange={setExtent}
        bind:cur={$pStrand.tracks[track].drawProps.pcentExtent}
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

    {#if ($pStrand.tracks[track].layers[DRAW_LAYER].pluginBits & pluginBit_TRIGGER) }
      <SectionTrigger {track} />
    {:else}
      <div style="margin:7px 0 0 -13px; padding:5px 0 5px 5px;
                  background-color: var(--bg-color-controls-area);">

        <Row style="margin:0;">
          <Checkbox labelText="Trigger once at start"
            style="padding: 3px;"
            on:check={autoStart}
            bind:checked={$pStrand.tracks[track].layers[DRAW_LAYER].trigAutoStart}
          />
        </Row>
        {#if !$pStrand.tracks[track].layers[DRAW_LAYER].trigAutoStart }
          <Row style="margin:0;">
            <Checkbox labelText="Trigger from main controls"
              style="padding: 3px;"
              on:check={setMain}
              bind:checked={$pStrand.tracks[track].layers[DRAW_LAYER].trigFromMain}
            />
          </Row>
        {/if}
      </div>
    {/if}

  {/if}
</div>
