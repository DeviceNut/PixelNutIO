import {
  patsMenuItems,
  patsSelectedID,
  patsOpenItems
} from './globals.js';

import { preset_MenuItems } from './newpatts.js';

export const MENUID_CUSTOM          = 0;      // must be 0
export const MENUID_PRESETS         = 1;      // must be 1
export const MENUID_BROWSER         = 1000;   // must be larger than highest filter effect id
export const MENUID_DEVICE          = 2000;   // must be larger than number of browser patterns

export let menuCustom =
{
  id: MENUID_CUSTOM,
  text: "Custom Pattern"
};

export let menuPresets =
{
  id: MENUID_PRESETS,
  text: "Standard Presets:",
  children: preset_MenuItems,
};

export let menuBrowser =
{
  id: MENUID_BROWSER,
  text: "Saved in Browser:",
  children: [],
};

export let menuDevice =
{
  id: MENUID_DEVICE,
  text: "Stored on Device:",
  children: [],
};

export let menuCreate = () =>
{
  let lmenu = [];
  lmenu.push(menuCustom);
  lmenu.push(menuPresets);

  if (menuBrowser.children.length > 0)
    lmenu.push(menuBrowser);

  if (menuDevice.children.length > 0)
    lmenu.push(menuDevice);

  patsMenuItems.set(lmenu);

  patsSelectedID.set([MENUID_PRESETS]);
  patsOpenItems.set([MENUID_PRESETS,MENUID_DEVICE,MENUID_BROWSER]);
}
