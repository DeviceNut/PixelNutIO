<script>

  import {
    pStrand,
  } from './globals.js';

  const onDropdown = async () =>
  {

  }

</script>

<button class="button"
  on:click={onDropdown}
  >Select Pattern
</button>

<div class="area"></div>
<p class="setfont">{`Name: ${$pStrand.curPatternName}`}</p>
<p class="setfont">Description:</p>
<p class="descrip">{@html $pStrand.curPatternDesc }</p>

<style>
  .area {
    padding-top: 10px;
    margin-left: 10px;
  }
  .setfont {
    font-size: .98em;
  }
  .descrip {
    font-size: .95em;
    margin-top: 2px;
    padding: 5px;
    color: var(--text-lines);
    background-color: var(--panel-back);
  }
  .button {
    width: 100%;
    padding: 5px;
    font-size:1em;
  }
</style>
