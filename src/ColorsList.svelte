<script>
  import { colorSettings } from './globals.js';
  export let type;
</script>

{#if type === 'text'}
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--text-names']}
    />
    Text Names
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--text-lines']}
    />
    Text Lines
  </label>
{/if}

{#if type === 'page'}
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--page-header']}
    />
    Page Header
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
    style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--page-border']}
    />
    Page Border
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--page-back']}
    />
    Page Background
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--panel-back']}
    />
    Panel Background
  </label>
{/if}

{#if type === 'buttons'}
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--btn-text-normal']}
    />
    Button Text
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--btn-back-normal']}
    />
    Button Background
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--btn-bord-normal']}
    />
    Button Border
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--btn-back-selected']}
    />
    Button Background Selected
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--btn-back-enabled']}
    />
    Button Background Enabled
  </label>
  <div style="display:block; margin-top:10px;"></div>
  <label>
    <input type="color"
      style="margin-top:10px; padding:0"
      bind:value={$colorSettings['--btn-bord-enabled']}
    />
    Button Border Enabled
  </label>
{/if}
