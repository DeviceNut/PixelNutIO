<script>

  import {
    pStrand,
    curDevice,
  } from './globals.js';

  import {
    pattNames,
    orgpatGetInfo,
  } from './orgpatts.js';

  let showPatts = false;
  let selected = [];

  function SetSelection()
  {
    selected = [];
    for (let i = 0; i < pattNames.length; ++i)
      selected.push( (pattNames[i] === $pStrand.curPatternName) );
  }
  
  const onOpenList = () =>
  {
    showPatts = !showPatts;
    if (showPatts) SetSelection();
  }

  const onSelect = (i) =>
  {
    const patnum = i+1;
    const info = orgpatGetInfo(patnum);
    if (info)
    {
      $pStrand.curPatternName = info.name;
      $pStrand.curPatternDesc = info.desc;
      $pStrand.curPatternBits = info.bits;
      $pStrand.opropsUser.doEnable = false;

      // console.log('Selecting:', $pStrand);

      SetSelection();
      $curDevice.send('.');
      $curDevice.send('P ' + info.cmds);
      $curDevice.send('.');
      $curDevice.send(`${patnum}`);
    }
  }

</script>

<button class="button"
  on:click={onOpenList}
  >Select Pattern
</button>

{#if showPatts}
  <div class="listbox">
    {#each pattNames as patt,i}
      <div>
        <button class="button patbut" class:selected={selected[i]}
          on:click={()=> onSelect(i)}
          >{patt}
        </button>
      </div>
    {/each}
  </div>
{:else}
  <p class="title">{`Selected: ${$pStrand.curPatternName}`}</p>
{/if}

<p class="title">Description:</p>
<p class="descrip">{@html $pStrand.curPatternDesc }</p>

<style>
  .listbox {
    padding: 5px;
    border: 1px solid var(--btn-bord-normal);
  }
  .title {
    margin-top: 10px;
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
    margin-top: 3px;
    padding: 5px;
    font-size:1.1em;
  }
  .patbut {
    margin-top: 3px;
    font-size:.9em;
    border: none;
  }
  .selected {
    background-color: var(--btn-back-selected);
    border: 1px solid var(--btn-bord-enabled);
  }
</style>
