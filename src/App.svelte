<script>

  import { get } from "svelte/store";

  import "carbon-components-svelte/css/all.css";

  import {
    mqttBrokerIP,
    PAGEMODE_CONTROLS,
    PAGEMODE_HELPDOCS,
    curPageMode,
    userThemeStr,
    colorThemeDark,
    colorSettings,
    setColor
  } from './globals.js';

  import {
    storeThemeGet,
    storeColorsGet,
    storePatternsInit
  } from './browser.js';

  import { helpInit } from './helpmain.js';

  import PageHelp     from './PageHelp.svelte';
  import PageDevices  from './PageDevices.svelte';
  import PageControls from './PageControls.svelte';
  import ColorsSelect from './ColorsSelect.svelte';

  storePatternsInit();
  helpInit();

  let hip = window.location.origin;
  console.log(`Served from host: ${hip}`);

  let ipaddr = window.location.hostname;
  if (ipaddr === 'localhost')
       $mqttBrokerIP = '192.168.8.222'; // when running development server
  else $mqttBrokerIP = ipaddr;

  let theme = storeThemeGet();
  if (theme === null) theme = "g100"; // default
  document.documentElement.setAttribute("theme", theme);
  userThemeStr.set(theme);

  let colors = storeColorsGet();
  if (colors === null)
  {
    if (theme === "g10")
         colors = get(colorThemeLite);
    else colors = get(colorThemeDark);
  }

  colorSettings.set(colors);
  for (let c in colors) setColor(c, colors[c]);

  //console.log('Color Values: ', colors);

</script>

<main>

  {#if ($curPageMode === PAGEMODE_HELPDOCS)}
    <PageHelp/>
  {:else if ($curPageMode === PAGEMODE_CONTROLS)}
    <PageControls/>
  {:else}
    <PageDevices/>
  {/if}

  <ColorsSelect/>

</main>
