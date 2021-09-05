<script>

  import {
    Modal,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    Button,
    ButtonSet,
    Checkbox
  } from "carbon-components-svelte";

  import {
    pStrand,
    aCurListPats,
    aCurListDesc,
    updateSources,
    storedPattern
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternSave,
    storePatternRemove
  } from './userstore.js';

  import { userClearPattern } from './cmduser.js';

  let heading, listdesc;
  $:
  {
    heading = $aCurListPats[$pStrand.curPatternIdx].text;
    listdesc = $aCurListDesc[$pStrand.curPatternIdx];
  }

  let openHelp = false;
  const dohelp = () => { openHelp = !openHelp; }

  const doclear = () => { userClearPattern(); }

  let openStore = false;
  let savename, savedesc;
  let copyclip = false;

  const dostore = () =>
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

    try
    {
      let ok = document.execCommand('copy');
      if (!ok) console.error('Failed copying pattern string clipboard');
    }
    catch (err)
    {
      console.error('Failed copying clipboard: ', err);
    }

    document.body.removeChild(textArea);
  }

</script>

<button
  class="button button-help"
  on:click={dohelp}
  disabled={$pStrand.curPatternIdx === 0}
  >?
</button>
<button
  class="button button-pattern"
  on:click={doclear}
  disabled={$pStrand.curPatternStr === ''}
  >Clear
</button>
<button
  class="button button-pattern"
  on:click={() => { openStore = !openStore; }}
  disabled={$pStrand.curPatternStr === ''}
  >Store
</button>
<button
  class="button button-pattern"
  on:click={delstart}
  disabled={!$pStrand.isBrowserSource || ($pStrand.curPatternIdx === 0)}
  >Delete
</button>

<Modal
  passiveModal
  modalHeading={heading}
  bind:open={openHelp}
  on:close
  >
  {#each listdesc as para,n}
    <p>{para}</p><br>
  {/each}
</Modal>

<Modal
  passiveModal
  modalHeading="Store Custom Pattern"
  bind:open={openStore}
  on:close
  >
  <Form on:submit={dostore} >
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
      <Button kind="secondary" on:click={() => {openStore = false;}}>Cancel</Button>
      <Button type="submit">Submit</Button>
    </ButtonSet>
  </Form>
</Modal>

<Modal
  passiveModal
  modalHeading={`Delete Pattern: "${remname}" ?`}
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
    margin-left: 10px;
    margin-right: 15px;
    border-width: 2px;
    border-radius: 75%;
  }
  .button-pattern {
    width: 60px;
    margin-right: 15px;
  }
</style>
