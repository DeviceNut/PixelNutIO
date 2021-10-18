<script>

  import {
    Modal,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    Checkbox,
    Button,
    ButtonSet
  } from "carbon-components-svelte";

  import {
    pStrand,
    aListSources,
    aCurListPats,
    aCurListDesc,
    updateSources,
    storedPattern
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternSave,
    storePatternRemove
  } from './browser.js';

  import { userClearPattern } from './cmduser.js';
  import { sendEntirePattern } from './cmdsend.js';

  let heading, listdesc;
  $:
  {
    if ($pStrand.curSourceIdx !== 0)
    {
      heading = $aCurListPats[$pStrand.curPatternIdx].text;
      listdesc = $aCurListDesc[$pStrand.curPatternIdx];
    }
    if ($aListSources.length > 1)
         heading = 'Source and Pattern Menus'
    else heading = 'Pattern Menu'
  }

  let openHelp = false;
  const dohelp = () => { openHelp = !openHelp; }

  const doclear = () => { userClearPattern(); }
  const dostore = () => { sendEntirePattern(true); } // store pattern

  let openSave = false;
  let savename, savedesc;
  let copyclip = false;

  const dosave = () =>
  {
    storePatternSave(savename, savedesc, $pStrand.curPatternStr);
    storePatternsInit();

    $updateSources = true;
    $storedPattern = true;

    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    savename = savedesc = '';
    openStore = false;
  }

  let openDelete = false;
  let remname;

  const delstart = () =>
  {
    remname = $aCurListPats[$pStrand.curPatternIdx].text
    openDelete = true;
  }

  const dodelete = () =>
  {
    console.log('remove:', remname);

    storePatternRemove(remname);
    storePatternsInit();
    userClearPattern();

    $updateSources = true;

    openDelete = false;
  }

  function copyToClipboard()
  {
    let textArea = document.createElement("textarea");

    textArea.value = $pStrand.curPatternStr;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let ok = true;
    let errstr = '';
    try
    {
      ok = document.execCommand('copy'); // FIXME: deprecated
    }
    catch (error)
    {
      errstr = error;
      ok = false;
    }
    if (!ok) console.error(`Failed copying to clipboard: ${errstr}`);

    document.body.removeChild(textArea);
  }

</script>

<button
  class="button button-help"
  on:click={dohelp}
  >?
</button>

<button
  class="button button-pattern"
  on:click={doclear}
  disabled={ ($pStrand.curPatternStr === '') }
  >Clear
</button>

<button
  class="button button-pattern"
  on:click={dostore}
  >Store
</button>

<button
  class="button button-pattern"
  on:click={() => { openSave = !openSave; }}
  disabled={$pStrand.curPatternStr === ''}
  >Save
</button>

<button
  class="button button-pattern"
  on:click={delstart}
  disabled={!$pStrand.browserSource || ($pStrand.curPatternIdx === 0)}
  >Delete
</button>

<Modal
  passiveModal
  modalHeading={heading}
  bind:open={openHelp}
  on:close
  >
  {#if ($pStrand.curSourceIdx === 0) }
    {#if ($aListSources.length > 1) }
      <p>Explain use of source menu.</p>
    {/if}
    <p>Explain use of pattern menu.</p>
  {:else}
    {#each listdesc as para,n}
      <p>{para}</p><br>
    {/each}
  {/if}
</Modal>

<Modal
  passiveModal
  modalHeading="Save Custom Pattern"
  bind:open={openSave}
  on:close
  >
  <Form on:submit={dosave} >
    <FormGroup>
      <TextInput
        labelText="Name"
        bind:value={savename}
      />
      <div style="margin-top:10px;"></div>
      <TextArea
        labelText="Description"
        bind:value={savedesc}
      />
    </FormGroup>
    <Checkbox labelText="Copy command string to clipboard"
      style="margin-top:-7px; margin-bottom:17px;"
      bind:checked={copyclip}
    />
    <ButtonSet>
      <Button kind="secondary" on:click={() => {openSave = false;}}>Cancel</Button>
      <Button type="submit">Store</Button>
    </ButtonSet>
  </Form>
</Modal>

<Modal
  passiveModal
  modalHeading={`Delete Custom Pattern: "${remname}" ?`}
  bind:open={openDelete}
  on:close
  >
  <ButtonSet>
    <Button kind="secondary" on:click={() => {openDelete = false;}}>Cancel</Button>
    <Button on:click={dodelete}>Delete</Button>
  </ButtonSet>
</Modal>
  
<style>
  .button {
    height: 35px;
    padding: 3px;
  }
  .button-help {
    width: 35px;
    margin-right: 10px;
    border-width: 2px;
    border-radius: 75%;
  }
  .button-pattern {
    width: 50px;
    margin-right: 10px;
  }
</style>
