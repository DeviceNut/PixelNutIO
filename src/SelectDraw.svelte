<script>

  import {
    Row,
    Dropdown
  } from "carbon-components-svelte";

  import { DRAW_LAYER } from './devcmds.js';

  import {
    pStrand,
    aEffectsDraw,
    aEffDrawDesc
  } from './globals.js';

  import {
    userSetEffect,
    userDoRestart
  } from './cmduser1.js'

  export let track;

  const setEffect = () => { userSetEffect(track, DRAW_LAYER); }
  const restart   = () => { userDoRestart(track, DRAW_LAYER); }

  let helpon = false;

</script>

<div style="margin-top:10px; padding-left:5px;">
  <Row>
    <Dropdown
      style="margin-bottom:10px;"
      size="sm"
      type="inline"
      on:select={setEffect}
      bind:selectedIndex={$pStrand.tracks[track].layers[DRAW_LAYER].pluginObj.index}
      bind:items={$aEffectsDraw}
    />
    <button class="button-help"
      on:click={() => {helpon = !helpon;}}
      >?
    </button>
    <button class="button-restart"
      on:click={restart}
      disabled={$pStrand.tracks[track].layers[DRAW_LAYER].mute}
      >Restart
    </button>
  </Row>

  {#if helpon }
    <Row style="margin-left:-10px; margin-right:1px; padding:5px;
                color: var(--color-textbox);
                background-color: var(--bg-color-textbox);">
      <p style="font-size:.9em;">
        {$aEffDrawDesc[$pStrand.tracks[track].layers[DRAW_LAYER].pluginObj.index]}
      </p>
    </Row>
  {/if}

</div>

<style>
   .button-restart {
     height: 30px;
     margin-left: 15px;
     padding: 3px;
   }
  .button-help {
    width: 30px;
    height: 30px;
    padding: 3px;
    margin-right: 10px;
    border-width: 2px;
    border-radius: 75%;
  }
</style>
