<script>

  import { colorSettings } from './globals.js';

  export let type;

  let textSample = "Lorem ipsum dolor sit amet, quisque et facilisis eros. Fusce mattis tempor dolor, eget magna fringilla vitae porta odio.";

</script>

{#if type === 'text'}
  <div style="max-width:242px; min-height:100px;">
    <input size=32 maxlength=32 value='Device/Pattern Name'
       style="color:{$colorSettings['--text-names']}; background-color:{$colorSettings['--panel-back']};"/>
    <p style="color:{$colorSettings['--text-lines']}; background-color:{$colorSettings['--panel-back']};">{textSample}</p>
  </div>
{/if}

{#if type === 'page'}
  <div style="max-width:300px; min-height:190px;
              background-color:{$colorSettings['--page-back']};
              border:2px solid {$colorSettings['--page-border']};">
    <div style="min-height:30px; background-color:{$colorSettings['--page-header']};"></div>
    <div style="margin:30px; min-height:100px; background-color:{$colorSettings['--panel-back']};"></div>
  </div>
{/if}

{#if type === 'buttons'}
  <div style="max-width:300px; min-height:270px; padding:10px;">

    <div><button style="color:            {$colorSettings['--btn-text-normal']};
                        background-color: {$colorSettings['--btn-back-normal']};
                        border: 2px solid {$colorSettings['--btn-bord-normal']};"
                  >Normal</button></div>

    <div><button disabled style="color:   {$colorSettings['--btn-text-normal']};
                        background-color: {$colorSettings['--btn-back-normal']};
                        border: 2px solid {$colorSettings['--btn-bord-normal']};"
                  >Disabled</button></div>

    <div><button style="color:            {$colorSettings['--btn-text-normal']};
                        background-color: {$colorSettings['--btn-back-selected']};
                        border: 2px solid {$colorSettings['--btn-bord-selected']};"
                  >Selected</button></div>

    <div><button style="color:            {$colorSettings['--btn-text-normal']};
                        background-color: {$colorSettings['--btn-back-enabled']};
                        border: 2px solid {$colorSettings['--btn-bord-enabled']};"
                  >Enabled</button></div>
  </div>
{/if}

<style>
  p {
    font-size: .9em;
    margin-top: 15px;
    padding: 5px;
  }
  button {
    margin-left: 20px;
    margin-top: 20px;
    min-width: 80px;
    min-height: 40px;
  }
</style>
