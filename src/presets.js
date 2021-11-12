///////////////////////////////////////////////////////////

export const preset_PatStrs =
  [
    { id: -1, text: '<none>',             cmd: '' },
    { id: 0,  text: 'Rainbow Ripple',     cmd: 'E2 D20 T E101 F1000 I T G' },
    { id: 1,  text: 'Rainbow Roll',       cmd: 'E1 D20 F1 I T E101 F1000 I T G' },
    { id: 2,  text: 'Light Waves',        cmd: 'E10 D60 T E101 T E120 F250 I T G' },
    { id: 3,  text: 'Color Twinkles',     cmd: 'E0 B50 D10 H232 W20 Q3 T E142 F250 I E50 B80 D10 W80 T G' },
    { id: 4,  text: 'Twinkle Comets',     cmd: 'E50 B65 D10 H50 W80 Q3 T E20 B90 D30 C25 F0 R O3 N6 E20 B90 D30 H40 C45 U F0 I T E120 F1 I G' },
    { id: 5,  text: 'Comet Party',        cmd: 'E20 D30 W25 C25 Q7 I T E101 F100 T E20 D20 W25 C25 Q7 U I T E101 F200 T G' },
    { id: 6,  text: 'Scanner Mix',        cmd: 'E40 D20 C25 Q4 T E111 A0 E40 D30 H270 C5 Q1 I E131 F1000 R O15 N5 G' },
    { id: 7,  text: 'Ferris Wheel',       cmd: 'E30 D60 C20 Q7 T E160 I E111 F R O3 N7 T G' },
    { id: 8,  text: 'Expanding Noise',    cmd: 'E52 D60 W35 C25 Q3 T E150 I E120 I G' },
    { id: 9,  text: 'Crazy Blinks',       cmd: 'E51 D60 C10 Q4 T E112 T E131 F1 I T G' },
    { id: 10, text: 'Blink Surges',       cmd: 'E51 D60 C10 T E112 T E131 F1000 I T G' },
    { id: 11, text: 'Bright Swells',      cmd: 'E0 B80 D10 Q3 T E111 F R10 O10 E142 F250 I T G' },
    { id: 12, text: 'Color Melts',        cmd: 'E0 D30 H30 T E110 F600 I T E111 A1 G' },
    { id: 13, text: 'July 4th',           cmd: 'E50 K33 B65 D10 H355 C100 T E50 J33 K34 B65 D10 W100 C100 T E50 J67 K34 D10 H230 C100 T G' },
    { id: 14, text: 'Holiday',            cmd: 'E50 B60 D10 T E50 B70 D15 H125 T E20 V B90 D30 H270 W80 C25 Q2 F0 I R20 O10 G' },
    { id: 15, text: 'MashUp',             cmd: 'E50 B65 D10 H100 W30 Q1 V T E40 D50 H270 C10 T E20 D15 C20 H0 F0 A1 I T G' },
  ];

export const preset_PatDescs =
  [
    [],
    [
      "Color hue changes \"ripple\" down the strip. The colors move through the spectrum, and appear stationary until Triggered.",
      "The Force modifies the amount of color change per pixel. At maximum Force the entire spectrum is displayed without moving,",
      "with 0 force it's a single color, and any other force value the colors continually change."
    ],
    [
      "Colors hue changes occur at the head and get pushed down the strip. When the end is reached they start getting cleared, creating a \"rolling\" effect.",
      "Triggering restarts the effect, with the amount of Force determining how fast the colors change. At the maximum Force the entire spectrum is displayed again."
    ],
    [
      "This creates a \"wave\" effect (brightness that changes up and down) that move down the strip, with the colors rotating.",
      "Triggering changes the frequency of the waves, with larger Forces making longer waves."
    ],
    [
      "This has bright white twinkling \"stars\" over a background color, which is determined by the 'Hue' and 'White' properties.",
      "Triggering causes the background brightness to swell up and down, with the amount of Force determining the speed of the swelling."
    ],
    [
      "This has bright twinkling without a background. The 'Hue' property changes the twinkling color.",
      "Occasional comets streak up and down and then disappear. One of the comets is the default color, and appears randomly every 3-6 seconds.",
      "The other is orange and appears only when Triggered, with the Force determining its length."
    ],
    [
      "Comets pairs, one in either direction, both of which change color hue occasionally. Triggering creates new comet pairs.",
      "The comet color and tail lengths can be modified with the 'Hue', 'White', and 'Count' properties."
    ],
    [
      "Two scanners (blocks of same brightness pixels that move back and forth), with only the first one visible initially until Triggered.",
      "The first one changes colors on each change in direction, and the length can be modified with the 'Count' property.",
      "The second one (once Triggered) moves in the opposite direction, periodically surges in speed, and is modified with 'Hue' property."
    ],
    [
      "Evenly spaced pixels move together around and around the strip, creating a \"Ferris Wheel\" effect.",
      "The spokes periodically change colors, or can be modified with the 'Hue' and 'White' properties.",
      "The 'Count' property determines the number of spokes. Triggering toggles the direction of the motion."
    ],
    [
      "The background is \"noise\" (randomly set pixels of random brightness), with the color modified by the 'Hue' and 'White' properties.",
      "A Trigger causes the background to slowly and continuously expand and contract, with the Force determining the extent of the expansion."
    ],
    [
      "Random colored blinking that periodically surge in the rate of blinking. The 'Count' property determines the number of blinking changes made at once.",
      "Triggering changes the frequency of the blinking, with larger Forces causing faster blinking surges."
    ],
    [
      "Random colored blinking that periodically surge in the rate of blinking.",
      "Triggering changes the frequency of the blinking, with larger Forces causing faster blinking surges."
    ],
    [
      "All pixels swell up and down in brightness, with random color hue and whiteness changes, or set with the 'Hue' and 'White' properties.",
      "Triggering changes the pace of the swelling, with larger Forces causing faster swelling."
    ],
    [
      "Colors melt from one to the other, with slow and smooth transitions.",
      "Triggering causes a new target color to be is chosen, with larger Forcs causing larger color changes."
    ],
    [
      "Celebrate the holiday with Red, White, and Blue twinkles!"
    ],
    [
      "Festive red and green twinkles, with an occasional white comet that streaks across them.",
      "The comet's whiteness can be modified, and Triggering creates them."
    ],
    [
      "Combination of a purple scanner over a greenish twinkling background, with a red comet that is fired off every time the scanner " +
      "bounces off the end of the strip, or when Triggered.",
      "The 'Hue' property only affects the color of the twinkling."
    ],
  ];

export const preset_DrawEffectItems =
  [
    { id: 0,  bits: 0x8001, text: 'Draw All' },
    { id: 1,  bits: 0x80FD, text: 'Draw Push' },
    { id: 2,  bits: 0x809D, text: 'Draw Step' },
    { id: 10, bits: 0x800F, text: 'Light Wave' },
    { id: 20, bits: 0x80EF, text: 'Comet Heads' },
    { id: 30, bits: 0x800F, text: 'Ferris Wheel' },
    { id: 40, bits: 0x8097, text: 'Block Scanner' },
    { id: 50, bits: 0x8007, text: 'Twinkle' },
    { id: 51, bits: 0x8007, text: 'Blinky' },
    { id: 52, bits: 0x8007, text: 'Noise' },
  ];

export const preset_DrawEffectDescs =
  [
    "Draws all pixels with the current color.",

    "Draws one pixel at a time with current color/brightness, inserting at the head. " +
    "Triggering causes a new cycle to begin. If force is 0 then cycle is not repeated. " +
    "Can trigger other effects.",

    "Draws one pixel at a time with current color/brightness, appending at the tail. " +
    "Can trigger other effects.",

    "Light waves (brighness changes) in the current color that fluctuate (sine wave). " +
    "The count property sets the wave frequency.",

    "Creates a bright head with a fading tail in the current color that moves. " +
    "The count property determines its length, and triggering creates a new one. " +
    "Can trigger other effects.",

    "Draws evenly spaced pixels using the current color, shifting them down one pixel " +
    "at a time. The count property determines amount of space between them. " +
    "Can trigger other effects.",

    "Draws a block of pixels with the current color back and forth. " +
    "The count property sets the length of the block.",

    "Scales pixel brightness levels up and down individually, using current color. " +
    "The count property determines total number of pixels affected.",

    "Blinks on and off random pixels using current color/brightness. " +
    "The count property determines number of pixels changed each step.",

    "Sets randomly chosen pixels with current color but random brightness. " +
    "The count property determines number of pixels changed each step."
  ];

export const preset_FilterEffectItems =
  [
    { id: 100, bits: 0x0160, text: 'Hue Set' },
    { id: 101, bits: 0x0065, text: 'Hue Rotate' },
    { id: 110, bits: 0x00A5, text: 'Color Meld' },
    { id: 111, bits: 0x0060, text: 'Color Modify' },
    { id: 112, bits: 0x0304, text: 'Color Random' },
    { id: 120, bits: 0x0460, text: 'Count Set' },
    { id: 121, bits: 0x0066, text: 'Count Surge' },
    { id: 122, bits: 0x00E6, text: 'Count Wave' },
    { id: 130, bits: 0x0860, text: 'Delay Set' },
    { id: 131, bits: 0x0864, text: 'Delay Surge' },
    { id: 132, bits: 0x08E4, text: 'Delay Wave' },
    { id: 141, bits: 0x0064, text: 'Bright Surge' },
    { id: 142, bits: 0x00E4, text: 'Bright Wave' },
    { id: 150, bits: 0x2096, text: 'Window Expander' },
    { id: 160, bits: 0x1020, text: 'Flip Direction' },
  ];

export const preset_FilterEffectDescs =
  [
    "Directly sets color hue once from force value on each trigger (whiteness uneffected). " +
    "As force increases color hue changes from red->green->blue->red.",

    "Rotates color hue around color wheel on each drawing step (whiteness unaffected). " +
    "Amount of change each time determined by trigger force.",

    "Smoothly melds from current color (hue/white) into another whenever color values are changed. " +
    "Can trigger other effects.",

    "Rotates color hue and whiteness on each trigger, with the force determining how much change is made.",

    "Sets color hue and whiteness to random values on each drawing step.",

    "Directly sets pixel count property once from the force value on every trigger. A force of 0 is ignored.",

    "Increases pixel count property using the trigger force, then decreases it in even steps back to its original value. " +
    "The original value (when triggered the first time) must be less than the maximum to have any effect.",

    "Modulates pixel count property with a cosine function. The wave height is half the maximum. " +
    "The trigger force determines the number of steps in the wave: larger forces for quicker changes. " +
    "Can trigger other effects.",

    "Directly sets delay time property from the force value on every trigger. Increased force reduces the delay; " +
    "at maximum force the delay is minimal; a force of 0 means a maximum delay.",

    "Decreases delay time property using the trigger force, then increases it in even steps back to its original value." +
    "The original value (when triggered the first time) must be greater than the minimum to have any effect.",

    "Modulates delay time property with a cosine function, down to its minimum and back. The trigger force " +
    "determines the number of steps in the wave: larger forces for quicker changes. " +
    "Can trigger other effects.",

    "Increases brightness property using the trigger force, then decreases it in even steps back to its original value. " +
    "The original value (when triggered the first time) must be less than the maximum to have any effect.",

    "Modulates brightness property with a cosine function. The wave height is a third of the maximum. " +
    "The trigger force determines the number of steps in the wave: larger forces for quicker changes. " +
    "Can trigger other effects.",

    "Expands/contracts the drawing window continuously, centered on the middle of the strand. " +
    "The pixel count property determines the size of the window on every step. " +
    "Can trigger other effects.",

    "Toggles the drawing direction property on each trigger.",
  ];

export const pluginBit_COLOR       = 0x0001;  // changing color changes effect
export const pluginBit_COUNT       = 0x0002;  // changing count changes effect
export const pluginBit_DELAY       = 0x0004;  // changing delay changes effect
export const pluginBit_DIRECTION   = 0x0008;  // changing direction changes effect
export const pluginBit_ROTATION    = 0x0010;  // changing rotation changes effect
export const pluginBit_REPTRIGS    = 0x0020;  // repeat triggers changes effect
export const pluginBit_TRIGFORCE   = 0x0040;  // force used in triggering
export const pluginBit_SENDFORCE   = 0x0080;  // sends force to other plugins
                                              // filter effect overrides:
export const pluginBit_ORIDE_HUE   = 0x0100;  //  hue property
export const pluginBit_ORIDE_WHITE = 0x0200;  //  white property
export const pluginBit_ORIDE_COUNT = 0x0400;  //  count property
export const pluginBit_ORIDE_DELAY = 0x0800;  //  delay property
export const pluginBit_ORIDE_DIR   = 0x1000;  //  direction property
export const pluginBit_ORIDE_EXT   = 0x2000;  //  start/extent properties
export const pluginBit_REDRAW      = 0x8000;  // set if redraw effect, else filter

export const presetsFindEffect = (plugnum) =>
{
  for (const [i, f] of get(aEffectsDraw).entries())
    if (f.id === plugnum)
      return { filter:false, index:i, bits:f.bits };

  for (const [i, f] of get(aEffectsFilter).entries())
    if (f.id === plugnum)
      return { filter:true, index:i, bits:f.bits };

  return undefined;
}
