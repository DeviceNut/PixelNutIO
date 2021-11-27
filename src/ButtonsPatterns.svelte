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
    patsMenuOpen
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternSave
  } from './browser.js';

  import { userClearPattern } from './cmduser2.js';
  import { sendEntirePattern } from './cmdsend.js';

  let openSave = false;
  let savedesc;
  let copyclip = false;

  const doselect = () => { $patsMenuOpen = !$patsMenuOpen; }
  const doclear  = () => { userClearPattern(); }
  const dostore  = () => { sendEntirePattern(); }

  const dosave = () =>
  {
    storePatternSave($pStrand.curPatternName, savedesc, $pStrand.curPatternStr);
    storePatternsInit();

    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    savedesc = '';
    openSave = false;
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
    if (!ok) console.warn(`Failed copying to clipboard: ${errstr}`);

    document.body.removeChild(textArea);
  }

/*
  import { storePatternRemove } from './browser.js';

  let openDelete = false;

  const dodelete = () =>
  {
    storePatternRemove($pStrand.curPatternName);
    storePatternsInit();
    userClearPattern();

    openDelete = false;
  }

  <button class="button-pattern"
    on:click={() => { openDelete = true; }}
    disabled={!$pStrand.browserSource || ($pStrand.curPatternIdx === 0)}
    >Delete
  </button>

  <Modal
    passiveModal
    modalHeading={`Delete Custom Pattern: "${$pStrand.curPatternName}" ?`}
    bind:open={openDelete}
    on:close
    >
    <ButtonSet>
      <Button kind="secondary" on:click={() => {openDelete = false;}}>Cancel</Button>
      <Button on:click={dodelete}>Delete</Button>
    </ButtonSet>
  </Modal>
*/
</script>

<button class="button-pattern"
  on:click={doselect}
  >Select
</button>

<button class="button-pattern"
  on:click={doclear}
  disabled={ ($pStrand.tactives === 0) }
  >Clear
</button>

<button class="button-pattern"
  on:click={dostore}
  disabled={ ($pStrand.curPatternStr === '') }
  >Store
</button>

<button class="button-pattern"
  on:click={() => {openSave = !openSave;}}
  disabled={$pStrand.curPatternStr === ''}
  >Save
</button>

<Modal
  passiveModal
  modalHeading="Store Pattern in Browser"
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

<style>
  .button-pattern {
    width: 60px;
    height: 40px;
    padding: 5px;
    margin-left: 7px;
    margin-right: 7px;
  }
</style>
