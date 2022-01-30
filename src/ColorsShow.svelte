<script>
  import { colorSettings } from './globals.js';
  export let type;
</script>

{#if type === 'text'}
  <div style="background-color:{$colorSettings['--text-names']}; min-height:100px;"></div>
{/if}

{#if type === 'page'}
  <div style="background-color:{$colorSettings['--page-header']}; min-height:190px;"></div>
{/if}

{#if type === 'buttons'}
  <div style="background-color:{$colorSettings['--btn-text-normal']}; min-height:270px;"></div>
{/if}
