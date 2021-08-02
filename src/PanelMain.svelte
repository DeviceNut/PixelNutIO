<script>

  import MediaQuery from "svelte-media-query";

  import {
    Grid,
    Row,
    Column,
    Select,
    SelectItem,
    SelectItemGroup,
    Modal,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    Button,
    ButtonSet,
    Checkbox
  } from "carbon-components-svelte";

  import { MAX_FORCE } from "./pixelnut.js";

  import {
    pluginBit_TRIGGER,
    pluginBit_TRIGFORCE
  } from "./presets.js";

  import {
    pStrand,
    aBuiltinPats,
    aBuiltinDesc,
    aCustomPats,
    aCustomDesc
  } from './globals.js';
;
  import {
    storePatternsInit,
    storePatternSave,
    storePatternRemove
  } from "./userstore.js";

  import {
    userSetPattern,
    userClearPattern,
    userSetForce,
    userSendTrigger
  } from "./cmduser.js";

  import SlidersMain from "./SlidersMain.svelte";
  import SlidersPropsGlobal from "./SlidersPropsGlobal.svelte";
  import SliderVal from "./SliderVal.svelte"

  function copyToClipboard()
  {
    let textArea = document.createElement("textarea");

    textArea.value = $pStrand.patternCmds;

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

  let heading, helpstrs;
  $: {
    let id = $pStrand.patternID;
    let len = $aBuiltinPats.length;

    if (id > 0)
    {
      if (--id < len)
      {
        heading = $aBuiltinPats[id].text;
        helpstrs = $aBuiltinDesc[id];
      }
      else
      {
        heading = $aCustomPats[id-len].text;
        helpstrs = $aCustomDesc[id-len];
      }
    }
    else
    {
      heading = '';
      helpstrs = [];
    }
  }

  let openHelp = false;
  const dohelp   = () => { openHelp = !openHelp; }

  const doclear  = () => { userClearPattern(); }

  let openSave = false;
  let savename, savedesc;
  let copyclip = false;

  const dosave = () =>
  {
    storePatternSave(savename, savedesc, $pStrand.patternCmds);
    storePatternsInit();

    if (copyclip)
    {
      copyToClipboard();
      copyclip = false;
    }

    savename = savedesc = '';
    openSave = false;
  }

  let openRemove = false;
  const doremove = () =>
  {
    storePatternRemove($pStrand.patternName);
    storePatternsInit();

    userClearPattern();
    $pStrand.patternID = 0;

    openRemove = false;
  }

</script>

<Grid>
  <Row>
    <Column style="margin-left:-7px; max-width:250px;">
      <Select 
        bind:selected={$pStrand.patternID}
        on:change={userSetPattern}
      >
        <SelectItem value={0} text={"<custom>"} />
        {#if ($aCustomPats.length > 0) }
          <SelectItemGroup label="Saved Patterns">
            {#each $aCustomPats as pat}
              <SelectItem value={pat.id} text={pat.text} />
            {/each}
          </SelectItemGroup>
        {/if}
        <SelectItemGroup label="Built-in Patterns">
          {#each $aBuiltinPats as pat}
            <SelectItem value={pat.id} text={pat.text} />
          {/each}
        </SelectItemGroup>
      </Select>
    </Column>
    <MediaQuery query="(min-width:501px)" let:matches>
      {#if matches}
        <Column style="margin-top:10px;">
          <div style="margin:0 auto; text-align:center;">
            {#if ($pStrand.patternID > 0) }
              <button
                class="button button-help"
                on:click={dohelp}
                >?
              </button>
              {#if $pStrand.haveCustom}
                <button
                  class="button button-pattern"
                  on:click={() => {openRemove=true;}}
                  >Remove
                </button>
              {/if}
            {:else}
              <button
                class="button button-pattern"
                on:click={doclear}
                disabled={$pStrand.patternCmds === ''}
                >Clear
              </button>
              <button
                class="button button-pattern"
                on:click={() => { openSave = !openSave; }}
                disabled={$pStrand.patternCmds === ''}
                >Save
              </button>
            {/if}
          </div>
        </Column>
      {/if}
    </MediaQuery>
    <MediaQuery query="(max-width:500px)" let:matches>
    {#if matches && ($pStrand.patternID > 0) }
      <Column style="margin-top:10px;">
        <button
          class="button button-help"
          on:click={dohelp}
          >?
        </button>
      </Column>
    {/if}
  </MediaQuery>
  </Row>
  <MediaQuery query="(max-width:500px)" let:matches>
    {#if matches}
      <Row style="margin-top:10px;">
        <Column style="margin-left:30px;">
          {#if ($pStrand.patternID > 0) }
            {#if $pStrand.haveCustom}
              <button
                class="button button-pattern"
                on:click={() => {openRemove=true;}}
                >Remove
              </button>
            {/if}
          {:else}
            <button
              class="button button-pattern"
              on:click={doclear}
              disabled={$pStrand.patternCmds === ''}
              >Clear
            </button>
            <button
              class="button button-pattern"
              on:click={() => { openSave = !openSave; }}
              disabled={$pStrand.patternCmds === ''}
              >Save
            </button>
          {/if}
        </Column>
      </Row>
    {/if}
  </MediaQuery>

  <Row style="margin-top:7px;">
    <Column style="margin-left:-5px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>
      <Row>
        <Column>
          <SliderVal name='Force'
            max={MAX_FORCE}
            onchange={userSetForce}
            bind:cur={$pStrand.forceValue}
            disabled={($pStrand.patternCmds === '') ||
                     !($pStrand.bitsEffects & pluginBit_TRIGFORCE)}
            />
        </Column>
        <MediaQuery query="(min-width:501px)" let:matches>
          {#if matches}
            <Column style="margin-top:5px;">
              <button
                class="button"
                on:click={userSendTrigger}
                disabled={($pStrand.patternCmds === '') ||
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
            disabled={($pStrand.patternCmds === '') ||
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
      <Button type="submit">Submit</Button>
    </ButtonSet>
  </Form>
</Modal>
<Modal
  passiveModal
  modalHeading={`Remove Current Pattern?`}
  bind:open={openRemove}
  on:close
  >
  <ButtonSet>
    <Button kind="secondary" on:click={() => {openRemove = false;}}>Cancel</Button>
    <Button on:click={doremove}>Remove</Button>
  </ButtonSet>
</Modal>

<style>
  .button {
    height: 35px;
    padding: 3px;
  }
  .button-help {
    float:left;
    width: 35px;
    border-radius: 75%;
  }
  .button-pattern {
    width: 60px;
    margin-right:15px;
  }
</style>
