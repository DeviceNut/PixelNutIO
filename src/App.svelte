<script>

  import { get } from "svelte/store";

  import "carbon-components-svelte/css/all.css";

  import {
    Modal,
    Button
  } from "carbon-components-svelte";

  import {
    appVersion,
    selectBLE,
    ipAddrServer,
    ipAddrBrowser,
    ipAddrBroker,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode,
    userThemeStr,
    colorThemeDark,
    colorSettings,
    setColor,
    msgTitle,
    msgDesc
  } from './globals.js';

  import {
    storeThemeGet,
    storeColorsGet,
    storeBrokerRead,
    storePatternsInit
  } from './browser.js';

  import { helpInit } from './helpmain.js';

  import PageHelp     from './PageHelp.svelte';
  import PageDevBle   from './PageDevBle.svelte';
  import PageDevMqtt  from './PageDevMqtt.svelte';
  import PageControls from './PageControls.svelte';
  import ColorsSelect from './ColorsSelect.svelte';

  storePatternsInit();
  helpInit();

  console.log(appVersion);

  $ipAddrServer = window.location.hostname;
  console.log(`Server hostname: ${$ipAddrServer}`);

  //if ($ipAddrServer === 'localhost') // running development server

  console.log('BLE mode:', $selectBLE);

  if (!$selectBLE)
  {
    storeBrokerRead(); // retrieve BrokerIP from browser store
    //console.log(`Saved Broker IP: ${$ipAddrBrowser}`);

    if ($ipAddrBrowser !== '')
        $ipAddrBroker = $ipAddrBrowser;
    else $ipAddrBroker = $ipAddrServer;

    //console.log(`Current Broker IP: ${$ipAddrBroker}`);
  }

  let theme = storeThemeGet();
  if (theme === null) theme = "g100"; // default
  document.documentElement.setAttribute("theme", theme);
  userThemeStr.set(theme);

  let colors = storeColorsGet();
  if (colors === null)
  {
    if (theme === "g10") colors = get(colorThemeLite);
    else                 colors = get(colorThemeDark);
  }

  colorSettings.set(colors);
  for (let c in colors) setColor(c, colors[c]);

  //console.log('Color Values: ', colors);

  let openMessage;
  $: openMessage = $msgTitle !== '';

  const onCloseMsg = () =>
  {
    openMessage = false;
    $msgTitle = '';
  }

</script>

<main>

  {#if ($curPageMode === PAGEMODE_HELPDOCS)}
    <PageHelp/>
  {:else if ($curPageMode === PAGEMODE_CONTROLS)}
    <PageControls/>
  {:else if $selectBLE}
    <PageDevBle/>
  {:else}
    <PageDevMqtt/>
  {/if}

  <ColorsSelect/>

</main>

<Modal
  size="sm"
  passiveModal
  preventCloseOnClickOutside
  modalHeading={$msgTitle}
  bind:open={openMessage}
  on:close
  >
  <p>{$msgDesc}</p><br>
  <Button kind="secondary" on:click={onCloseMsg}
    >Continue
  </Button>
</Modal>
