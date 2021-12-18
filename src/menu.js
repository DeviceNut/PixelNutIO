import {
  patsMenuItems,
  menuPresets,
  menuBrowser,
  menuDevice,
  menuCustom
} from './globals.js';

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
