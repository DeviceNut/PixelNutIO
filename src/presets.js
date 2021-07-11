import { get } from 'svelte/store';
import { aPatterns, aEffectsDraw, aEffectsPre } from './globals.js';

export let makePatternsAndEffects = () =>
{
  aPatterns.set([
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

  aEffectsDraw.set([
    { id: '0', text: 'DrawAll' },
    { id: '1', text: 'DrawPush' },
    { id: '2', text: 'LightWave' },
    { id: '3', text: 'CometHeads' },
    { id: '4', text: 'FerrisWheel' },
    { id: '5', text: 'BlockScanner' },
    { id: '6', text: 'Twinkle' },
    { id: '7', text: 'Blinky' },
    { id: '8', text: 'Noise' },
  ]);

  aEffectsPre.set([
    { id: '0',  text: 'HueSet' },
    { id: '1',  text: 'HueRotate' },
    { id: '2',  text: 'ColorMeld' },
    { id: '3',  text: 'ColorModify' },
    { id: '4',  text: 'ColorRandom' },
    { id: '5',  text: 'CountSet' },
    { id: '6',  text: 'CountSurge' },
    { id: '7',  text: 'CountWave' },
    { id: '8',  text: 'DelaySet' },
    { id: '9',  text: 'DelaySurge' },
    { id: '10', text: 'DelayWave' },
    { id: '11', text: 'BrightSurge' },
    { id: '12', text: 'BrightWave' },
    { id: '13', text: 'WinExpander' },
    { id: '14', text: 'FlipDirection' },
  ]);
}
