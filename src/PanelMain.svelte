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
    Button
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
    aCustomDesc,
    mainEnabled,
    bitsEffects
  } from './globals.js';
;
  import {
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

  let openHelp = false;
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
  const dohelp   = () => { openHelp = !openHelp; }
  const doclear  = () => { userClearPattern(); }

  let openSave = false;
  const saveDialog   = () => { openSave = !openSave; }

  let savename, savedesc;
  const dosave = () =>
  {
    storePatternSave(savename, savedesc);
    openSave = false;
  }

  const doremove = () =>
  {
    storePatternRemove();
  }

</script>

<Grid>
  <Row style="margin-top: 5px;">
    <Select 
      bind:selected={$pStrand.patternID}
      on:change={userSetPattern}
    >
      <SelectItem value={"0"} text={"<custom>"} />
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
    {#if ($pStrand.patternID > 0) }
      <button
        class="button-help"
        on:click={dohelp}
        >?
      </button>
      {#if $pStrand.isCustom}
        <button
          class="button button-pattern"
          on:click={doremove}
          >Remove
        </button>
      {/if}
    {:else}
      <button
        class="button button-pattern"
        on:click={doclear}
        disabled={$pStrand.patternStr == ''}
        >Clear
      </button>
      <button
        class="button button-pattern"
        on:click={saveDialog}
        disabled={$pStrand.patternStr == ''}
        >Save
      </button>
    {/if}
  </Row>

  <Row style="margin-top: 7px;">
    <Column style="margin-left: -15px;">
      <SlidersMain/>
      <SlidersPropsGlobal/>
      <Row>
        <Column style="margin-top: 10px; max-width:300px">
          <SliderVal name='Force'
            max={MAX_FORCE}
            onchange={userSetForce}
            bind:cur={$pStrand.forceValue}
            disabled={!$mainEnabled || !($bitsEffects & pluginBit_TRIGFORCE)}
            />
        </Column>
        <Column>
          <div style="margin: 10px 0 10px 0;">
            <button
              class="button"
              on:click={userSendTrigger}
              disabled={!$mainEnabled || !($bitsEffects & pluginBit_TRIGGER)}
              >Trigger
            </button>
          </div>
        </Column>
      </Row>
    </Column>
  </Row>
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
    <Button type="submit">Submit</Button>
  </Form>
</Modal>

<style>
  .button {
    padding: 5px;
    width: 60px;
    height: 35px;
    border-radius: 5%;
    color: white;
    border: 1px solid #bbbcbb;
    background-color:#555655;
  }
  .button-help {
    padding: 5px;
    width: 35px;
    height: 35px;
    margin: 7px 150px 0 0;
    border-radius: 75%;
    color: white;
    border: 2px solid #bbbcbb;
    background-color:#555655;
  }
  .button-pattern {
    margin: 7px 35px 0 0;
  }
  .button:hover, .button-help:hover {
    cursor: pointer;
    background-color:#444544;
  }
  button:disabled,button[disabled] {
    pointer-events: none;
    opacity: 0.35;
  }
</style>
