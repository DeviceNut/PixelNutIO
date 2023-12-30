<script>

  import {
    Modal,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    Checkbox,
    Button
  } from "carbon-components-svelte";

  import {
    pStrand,
    patsMenuOpen,
    devPaused,
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternSave
  } from './browser.js';

  import { userClearPattern } from './cmdpats.js';
  import { userSendPause } from './cmdhead.js';

  import {
    MENUID_BROWSER,
    menuBrowser,
    menuCreate
  } from './newmenu.js';

  let openSave = false;
  let copyclip = false;

  let menustr;
  $: menustr = $patsMenuOpen ? 'Close' : 'Select';

  let textPause = '';
  $: textPause = ($devPaused ? 'Resume' : 'Pause');
  const dopause = () => { userSendPause($devPaused = !$devPaused); }

  const doselect = () => { $patsMenuOpen = !$patsMenuOpen; }

  const doclear = () => { userClearPattern(); }

  const dosave = () =>
  {
    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    openSave = false;

    storePatternSave($pStrand.curPatternName, $pStrand.curPatternDesc, $pStrand.curPatternCmds);
    storePatternsInit();
    menuCreate();

    $pStrand.curPatternId = MENUID_BROWSER + menuBrowser.children.length;
  }

  function copyToClipboard()
  {
    let textArea = document.createElement("textarea");

    textArea.value = $pStrand.curPatternCmds;

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

<div style="margin-top:10px; text-align:center;">

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
    on:click={() => {openSave = !openSave;}}
    disabled={ ($pStrand.tactives === 0) }
    >Save
  </button>

  <button class="button-pattern"
    class:paused={$devPaused}
    on:click={dopause}
    >{textPause}
  </button>

</div>

<Modal
  passiveModal
  preventCloseOnClickOutside
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

    <Checkbox
      labelText="Copy command string to clipboard"
      style="margin-top:-7px; margin-bottom:17px;"
      bind:checked={copyclip}
    />
    <Button type="submit">Save</Button>
    <Button kind="secondary" on:click={() => {openSave = false;}}>Cancel</Button>

  </Form>
</Modal>

<style>
  .button-pattern {
    width: 60px;
    height: 40px;
    padding: 4px;
    margin-left: 5px;
    margin-right: 5px;
  }
  .button-pattern.paused {
    background-color: var(--btn-back-enabled);
    border: 2px solid var(--btn-bord-enabled);
  }
</style>
