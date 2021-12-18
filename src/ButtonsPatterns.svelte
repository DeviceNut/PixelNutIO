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
    patsMenuOpen,
    patsMenuItems,
    MENUID_CUSTOM
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternSave
  } from './browser.js';

  import { userClearPattern } from './cmduser2.js';
  import { sendStrandPattern } from './cmdsend.js';
  import { menuCreate } from './menu.js';

  let openSave = false;
  let copyclip = false;

  let menustr;
  $: menustr = $patsMenuOpen ? 'Close' : 'Select';

  const doselect = () => { $patsMenuOpen = !$patsMenuOpen; }

  const doclear = () =>
  {
    userClearPattern();
    $pStrand.curPatternId = MENUID_CUSTOM;
  }

  const dostore = () => { sendStrandPattern(); }

  const dosave = () =>
  {
    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    openSave = false;

    storePatternSave($pStrand.curPatternName, $pStrand.curPatternDesc, $pStrand.curPatternCmd);
    storePatternsInit();
    menuCreate();

    // triggers update to UI - MUST HAVE THIS
    $patsMenuItems = $patsMenuItems;
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
  >{menustr}
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
        bind:value={$pStrand.curPatternDesc}
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
    width: 55px;
    height: 40px;
    padding: 4px;
    margin-left: 4px;
    margin-right: 4px;
  }
</style>
