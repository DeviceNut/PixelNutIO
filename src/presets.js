import { get } from 'svelte/store';
import { aPatterns, aEffectsDraw, aEffectsFilter } from './globals.js';

export const presetsInit = () =>
{
  aPatterns.set([
    { id: '-1', text: '<custom>',           cmd:  '' },
    { id: '0',  text: 'Rainbow Ripple',     cmd:  'E2 D20 T E101 F1000 I T G' },
    { id: '1',  text: 'Rainbow Roll',       cmd:  'E1 D20 F1 I T E101 F1000 I T G' },
    { id: '2',  text: 'Light Waves',        cmd:  'E1 T G' },
    { id: '3',  text: 'Color Twinkles',     cmd:  'E1 T G' },
    { id: '4',  text: 'Twinkle Comets',     cmd:  'E1 T G' },
    { id: '5',  text: 'Comet Party',        cmd:  'E1 T G' },
    { id: '6',  text: 'Scanner Mix',        cmd:  'E1 T G' },
    { id: '7',  text: 'Ferris Wheel',       cmd:  'E1 T G' },
    { id: '8',  text: 'Expanding Noise',    cmd:  'E1 T G' },
    { id: '9',  text: 'Crazy Blinks',       cmd:  'E1 T G' },
    { id: '10', text: 'Blink Surges',       cmd:  'E1 T G' },
    { id: '11', text: 'Bright Swells',      cmd:  'E1 T G' },
    { id: '12', text: 'Color Melts',        cmd:  'E1 T G' },
    { id: '13', text: 'Holiday',            cmd:  'E1 T G' },
    { id: '14', text: 'MashUp',             cmd:  'E1 T G' },
  ]);

  // TODO: create these dynamically from device settings:
  
  aEffectsDraw.set([
    { id: '-1', bits: 0x00, text: '<none>' },
    { id: '0',  bits: 0x00, text: 'DrawAll' },
    { id: '1',  bits: 0x00, text: 'DrawPush' },
    { id: '2',  bits: 0x00, text: 'DrawStep' },
    { id: '10', bits: 0x00, text: 'LightWave' },
    { id: '20', bits: 0x00, text: 'CometHeads' },
    { id: '30', bits: 0x00, text: 'FerrisWheel' },
    { id: '40', bits: 0x00, text: 'BlockScanner' },
    { id: '50', bits: 0x00, text: 'Twinkle' },
    { id: '51', bits: 0x00, text: 'Blinky' },
    { id: '52', bits: 0x00, text: 'Noise' },
  ]);

  aEffectsFilter.set([
    { id: '-1',  bits: 0x01, text: '<none>' },
    { id: '100', bits: 0x01, text: 'HueSet' },
    { id: '101', bits: 0x01, text: 'HueRotate' },
    { id: '110', bits: 0x01, text: 'ColorMeld' },
    { id: '111', bits: 0x11, text: 'ColorModify' },
    { id: '112', bits: 0x01, text: 'ColorRandom' },
    { id: '120', bits: 0x01, text: 'CountSet' },
    { id: '121', bits: 0x01, text: 'CountSurge' },
    { id: '122', bits: 0x01, text: 'CountWave' },
    { id: '130', bits: 0x01, text: 'DelaySet' },
    { id: '131', bits: 0x01, text: 'DelaySurge' },
    { id: '132', bits: 0x01, text: 'DelayWave' },
    { id: '141', bits: 0x01, text: 'BrightSurge' },
    { id: '142', bits: 0x01, text: 'BrightWave' },
    { id: '150', bits: 0x01, text: 'WinExpander' },
    { id: '160', bits: 0x01, text: 'FlipDirection' },
  ]);
}

export const pluginBit_FILTER      = 0x01;   // is filter, not drawing, effect
export const pluginBit_DIRECTION   = 0x08;   // changing direction changes effect
export const pluginBit_TRIGGER     = 0x10;   // triggering changes the effect
export const pluginBit_USEFORCE    = 0x20;   // trigger force is used in effect
export const pluginBit_NEGFORCE    = 0x40;   // negative trigger force is used
export const pluginBit_SENDFORCE   = 0x80;   // sends trigger force to other plugins

export const presetsFindEffect = (plugnum) =>
{
  for (const f of get(aEffectsDraw))
    if (f.id == plugnum)
      return f.bits;

  for (const f of get(aEffectsFilter))
    if (f.id == plugnum)
      return f.bits;

  return undefined;
}