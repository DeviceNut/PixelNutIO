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
  import { sendStrandPattern } from './cmdsend.js';

  let openSave = false;
  let savedesc;
  let copyclip = false;

  const doselect = () => { $patsMenuOpen = !$patsMenuOpen; }
  const doclear  = () => { userClearPattern(); }
  const dostore  = () => { sendStrandPattern(); }

  const dosave = () =>
  {
    storePatternSave($pStrand.curPatternName, savedesc, $pStrand.curPatternCmd);
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

    textArea.value = $pStrand.curPatternCmd;

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
  disabled={ ($pStrand.curPatternCmd === '') }
  >Store
</button>

<button class="button-pattern"
  on:click={() => {openSave = !openSave;}}
  disabled={$pStrand.curPatternCmd === ''}
  >Save
</button>

<Modal
  passiveModal
  modalHeading="Save Pattern in Browser"
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
      <Button type="submit">Save</Button>
    </ButtonSet>
  </Form>
</Modal>

<style>
  .button-pattern {
    width: 60px;
    height: 40px;
    padding: 5px;
    margin-left: 5px;
    margin-right: 5px;
  }
</style>
