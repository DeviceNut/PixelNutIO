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
    aCurListPats,
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

  const doclear = () => { userClearPattern(); }
  const dostore = () => { sendEntirePattern(true); } // store pattern

  let openSave = false;
  let savedesc;
  let copyclip = false;

  const dosave = () =>
  {
    storePatternSave($pStrand.curPatternName, savedesc, $pStrand.curPatternStr);
    storePatternsInit();

    $updateSources = true;
    $storedPattern = true;

    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    savedesc = '';
    openSave = false;
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
  class="button-pattern"
  on:click={doclear}
  disabled={ ($pStrand.curPatternStr === '') }
  >Clear
</button>

<button
  class="button-pattern"
  on:click={dostore}
  >Store
</button>

<button
class="button-pattern"
on:click={() => {openSave = !openSave;}}
  disabled={$pStrand.curPatternStr === ''}
  >Save
</button>

<button
class="button-pattern"
on:click={delstart}
  disabled={!$pStrand.browserSource || ($pStrand.curPatternIdx === 0)}
  >Delete
</button>

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
        bind:value={$pStrand.curPatternName}
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
  .button-pattern {
    width: 55px;
    height: 35px;
    padding: 3px;
    margin-left: 10px;
  }
</style>
