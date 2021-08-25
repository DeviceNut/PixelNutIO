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

  let pattindex, pattypes;

  function settypes()
  {
    pattindex = 0;
    pattypes = [];

    if ($aDevicePats.length > 0) pattypes.push({ id: 0, text: 'Device' });
    if ($aStoredPats.length > 0) pattypes.push({ id: 1, text: 'Stored' });
    pattypes.push({ id: 2, text: 'Website' });
  }
  settypes(); // run 1st time

  let selindex = 0;
  let sellist, heading, helpstrs, pattern;

  function setpattern()
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
  setpattern(); // run 1st time

  const dosetup = () =>
  {
    selindex = 0;
    setpattern();
  }

  const doselect = () =>
  {
    setpattern();
    //console.log(`name=${heading}`);
    userSetPattern(heading, pattern);
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
    dosetup();
    userClearPattern();
  }

  let openStore = false;
  let savename, savedesc;
  let copyclip = false;

  const dostore = () =>
  {
    storePatternSave(savename, savedesc, $pStrand.curPatternStr);
    storePatternsInit();
    settypes();

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

    selindex = 0;
    settypes();
    setpattern();

    openDelete = false;
  }

</script>

<Grid>

  {#if pattypes.length > 1}

    <div style="margin-top:10px; text-align:center;">
      <p style="font-size:.9em;">Choose source and pattern:</p>
    </div>

    <MediaQuery query="(max-width: 400px)" let:matches>
      {#if matches}
        <div style="margin-top:5px; text-align:center;">
          <Dropdown
            size="sm"
            type="inline"
            on:select={dosetup}
            bind:selectedIndex={pattindex}
            bind:items={pattypes}
          />
        </div>
        <div style="margin-top:-20px; text-align:center;">
          <Dropdown
            size="sm"
            type="inline"
            on:select={doselect}
            bind:selectedIndex={selindex}
            bind:items={sellist}
          />
        </div>
      {/if}
    </MediaQuery>
    <MediaQuery query="(min-width: 401px)" let:matches>
      {#if matches}
        <div style="margin-top:5px; text-align:center;">
          <div style="width:120px; display:inline-block;">
            <Dropdown
              size="sm"
              type="inline"
              on:select={dosetup}
              bind:selectedIndex={pattindex}
              bind:items={pattypes}
            />
          </div>
          <div style="display:inline-block;">
            <Dropdown
              size="sm"
              type="inline"
              on:select={doselect}
              bind:selectedIndex={selindex}
              bind:items={sellist}
            />
          </div>
        </div>
      {/if}
    </MediaQuery>

    <Row style="margin-top:-10px;">
      <div style="margin: 0 auto;">
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
          disabled={$pStrand.curPatternStr === ''}
          >Store
        </button>
        <button
          class="button button-pattern"
          on:click={() => {openDelete=true;}}
          disabled={!$pStrand.fromStored || (selindex === 0)}
          >Delete
        </button>
      </div>
    </Row>

  {:else}
    <MediaQuery query="(max-width: 500px)" let:matches>
      {#if matches}

        <Row style="margin-top:10px;">
          <div style="margin-left: 20px;">
            <Dropdown
              style="text-align:center;"
              titleText="Select:"
              size="sm"
              type="inline"
              on:select={doselect}
              bind:selectedIndex={selindex}
              bind:items={sellist}
            />
          </div>
        </Row>

        <Row style="margin-top:-10px;">
          <div style="margin-left: 20px;">
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
              disabled={$pStrand.curPatternStr === ''}
              >Store
            </button>
            <button
              class="button button-pattern"
              on:click={() => {openDelete=true;}}
              disabled={!$pStrand.fromStored || (selindex === 0)}
              >Delete
            </button>
          </div>
        </Row>

      {/if}
    </MediaQuery>

    <MediaQuery query="(min-width: 501px)" let:matches>
      {#if matches}

        <Row style="margin-top:10px;">
          <div style="margin: 0 auto;">
            <Dropdown
              style="text-align:center;"
              titleText="Select:"
              size="sm"
              type="inline"
              on:select={doselect}
              bind:selectedIndex={selindex}
              bind:items={sellist}
            />
          </div>
        </Row>

        <Row style="margin-top:-10px;">
          <div style="margin: 0 auto;">
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
              disabled={$pStrand.curPatternStr === ''}
              >Store
            </button>
            <button
              class="button button-pattern"
              on:click={() => {openDelete=true;}}
              disabled={!$pStrand.fromStored || (selindex === 0)}
              >Delete
            </button>
          </div>
        </Row>
      {/if}
    </MediaQuery>

  {/if}

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
  modalHeading={`Remove Pattern: "${heading}" ?`}
  bind:open={openDelete}
  on:close
  >
  <ButtonSet>
    <Button kind="secondary" on:click={() => {openDelete = false;}}>Cancel</Button>
    <Button on:click={dodelete}>Remove</Button>
  </ButtonSet>
</Modal>

<style>
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
