<script>

  import MediaQuery from "svelte-media-query";

  import {
    Grid,
    Row,
    Column,
    Dropdown,
    Modal,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    Button,
    ButtonSet,
    Checkbox
  } from "carbon-components-svelte";

  import { MAX_FORCE } from './pixcmds.js';

  import {
    pluginBit_TRIGGER,
    pluginBit_TRIGFORCE
  } from './presets.js';

  import {
    pStrand,
    aDevicePats,
    aDeviceDesc,
    aStoredPats,
    aStoredDesc,
    aBuiltinPats,
    aBuiltinDesc
  } from './globals.js';

  import {
    storePatternsInit,
    storePatternSave,
    storePatternRemove
  } from './userstore.js';

  import {
    userSetPattern,
    userClearPattern,
    userSetForce,
    userSendTrigger
  } from './cmduser.js';

  import SlidersMain from './SlidersMain.svelte';
  import SlidersPropsGlobal from './SlidersPropsGlobal.svelte';
  import SliderVal from './SliderVal.svelte';

  let pattindex = 0;
  let pattypes = [];
  if ($aDevicePats.length > 0) pattypes.push({ id: 0, text: 'Device' });
  if ($aStoredPats.length > 0) pattypes.push({ id: 1, text: 'Stored' });
  pattypes.push({ id: 2, text: 'Website' });
  //pattypes.push({ id: 1, text: 'Stored' });

  let selindex = 0;
  let sellist, heading, helpstrs, pattern;
  const dosetup = () =>
  {
    let id = pattypes[pattindex].id;
    if (id === 0)
    {
      sellist = $aDevicePats;
      pattern = $aDevicePats[selindex].cmd;
      heading = $aDevicePats[selindex].text;
      helpstrs = $aDeviceDesc[selindex];
      $pStrand.fromStored = false;
    }
    else if (id === 1)
    {
      sellist = $aStoredPats;
      pattern = $aStoredPats[selindex].cmd;
      heading = $aStoredPats[selindex].text;
      helpstrs = $aStoredDesc[selindex];
      $pStrand.fromStored = true;
    }
    else if (id === 2)
    {
      sellist = $aBuiltinPats;
      pattern = $aBuiltinPats[selindex].cmd;
      heading = $aBuiltinPats[selindex].text;
      helpstrs = $aBuiltinDesc[selindex];
      $pStrand.fromStored = false;
    }
  }
  dosetup(); // run 1st time

  const doselect = () =>
  {
    dosetup();
    userSetPattern(heading, pattern);
  }

  $: {
    console.log('curpat:', $pStrand.curPatternStr);
    console.log('orgpat:', $pStrand.orgPatternStr);
    $pStrand.userChanged = ($pStrand.curPatternStr !== $pStrand.orgPatternStr);
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

  let openHelp = false;
  const dohelp   = () => { openHelp = !openHelp; }

  const doclear  = () =>
  {
    selindex = 0;
    dosetup();
    userClearPattern();
  }

  let openStore = false;
  let savename, savedesc;
  let copyclip = false;

  const dosave = () =>
  {
    storePatternSave(savename, savedesc, $pStrand.curPatternStr);
    storePatternsInit();

    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    savename = savedesc = '';
    openStore = false;
  }

  let openDelete = false;
  const dodelete = () =>
  {
    storePatternRemove($pStrand.patternName);
    storePatternsInit();
    userClearPattern();

    openDelete = false;
  }

</script>

<Grid>

  {#if pattypes.length > 1}
    <p style="font-size:.9em; margin-top: 10px;">Choose source and pattern:</p>
  {/if}

  <div class:custom={$pStrand.userChanged}>
    <Row style="padding-top:10px;">
      {#if pattypes.length > 1}
        <div style="margin-left:15px;"></div>
        <Dropdown
          type="inline"
          on:select={dosetup}
          bind:selectedIndex={pattindex}
          bind:items={pattypes}
        />
      {:else}
        <p style="font-size:.95em; margin:10px 15px 0 15px;">Choose pattern:</p>
      {/if}
      <Dropdown
        type="inline"
        on:select={doselect}
        bind:selectedIndex={selindex}
        bind:items={sellist}
      />
    </Row>
  </div>

  <Row style="margin-top:-15px;">
    <button
      class="button button-help"
      on:click={dohelp}
      disabled={selindex === 0}
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
      disabled={($pStrand.curPatternStr === '') || !$pStrand.userChanged}
      >Store
    </button>
    <button
      class="button button-pattern"
      on:click={() => {openDelete=true;}}
      disabled={!$pStrand.fromStored}
      >Delete
    </button>
  </Row>

  <div class="divider"></div>

  <Row style="margin-top:10px;">
    <Column style="margin-left:-5px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>
      <Row>
        <Column>
          <SliderVal name='Force'
            max={MAX_FORCE}
            onchange={userSetForce}
            bind:cur={$pStrand.forceValue}
            disabled={($pStrand.curPatternStr === '') ||
                     !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
            />
        </Column>
        <MediaQuery query="(min-width:501px)" let:matches>
          {#if matches}
            <Column style="margin-top:5px;">
              <button
                class="button"
                on:click={userSendTrigger}
                disabled={($pStrand.curPatternStr === '') ||
                         !($pStrand.bitsEffects & pluginBit_TRIGGER)}
                >Trigger
              </button>
            </Column>
          {/if}
        </MediaQuery>
      </Row>
    </Column>
  </Row>

  <MediaQuery query="(max-width:500px)" let:matches>
    {#if matches}
      <Row style="margin-top:5px;">
        <Column style="margin-left:-5px;">
          <button
            class="button"
            on:click={userSendTrigger}
            disabled={($pStrand.curPatternStr === '') ||
                     !($pStrand.bitsEffects & pluginBit_TRIGGER)}
            >Trigger
          </button>
        </Column>
      </Row>
    {/if}
  </MediaQuery>

</Grid>

<Modal
  passiveModal
  modalHeading={heading}
  bind:open={openHelp}
  on:close
  >
  {#each helpstrs as para,n}
    <p>{para}</p><br>
  {/each}
</Modal>
<Modal
  passiveModal
  modalHeading="Store Custom Pattern"
  bind:open={openStore}
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
      <Button kind="secondary" on:click={() => {openStore = false;}}>Cancel</Button>
      <Button type="submit">Submit</Button>
    </ButtonSet>
  </Form>
</Modal>
<Modal
  passiveModal
  modalHeading={`Remove Current Pattern?`}
  bind:open={openDelete}
  on:close
  >
  <ButtonSet>
    <Button kind="secondary" on:click={() => {openDelete = false;}}>Cancel</Button>
    <Button on:click={dodelete}>Remove</Button>
  </ButtonSet>
</Modal>

<style>
  .custom {
    pointer-events: none;
    opacity: 0.25;
  }
  .divider {
    margin-top: 15px;
    padding-top: 2px;
    background-color: var(--bg-color-divider);
  }
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
