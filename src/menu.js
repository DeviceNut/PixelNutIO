import { patsMenuItems } from './globals.js';
import { preset_MenuItems } from './presets.js';

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
}
