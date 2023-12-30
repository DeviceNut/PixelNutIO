
export const MAX_FORCE_VALUE = 1000;

export const pattNames =
[
  "Rainbow Ripple",
  "Rainbow Roll",
  "Color Twinkles",
  "Twinkle Comets",
  "Comet Party",
  "Scanner Mix",
  "Ferris Wheel",
  "Expanding Noise",
  "Crazy Blinks",
  "Bright Swells",
  "Color Melts",
  "Holiday",
  "MashUp",
];

const pattDescs =
[
  "Color hue changes \"ripple\" down the strip. The colors move through the spectrum, and appear stationary until Triggered." +
  "<br><br>" +
  "The Force modifies the amount of color change per pixel. At maximum Force the entire spectrum is displayed without moving, " +
  "with 0 force it's a single color, and with any other value the colors continually change.",

  "Colors hue changes occur at the head and get pushed down the strip. When the end is reached they start getting cleared, creating a \"rolling\" effect." +
  "<br><br>" +
  "Triggering restarts the effect, with the amount of Force determining how fast the colors change. At maximum Force the entire spectrum is displayed again.",

  "This has bright white twinkling \"stars\" over a background color, which is determined by the Hue and White properties." +
  "<br><br>" +
  "Triggering causes the background brightness to swell up and down, with the amount of Force determining the speed of the swelling.",

  "This has bright twinkling without a background. The Hue property changes the twinkling color." +
  "<br><br>" +
  "Occasional comets streak up and down and then disappear. One of the comets is red, and appears randomly every 3-6 seconds. " +
  "The other is orange and appears only when Triggered, with the Force determining its length.",

  "Comets pairs, one in either direction, both of which change color hue occasionally. Triggering creates new comet pairs. " +
  "The comet color and tail lengths can be modified with the Hue, White, and Count properties.",

  "Two scanners (blocks of same brightness pixels that move back and forth), with only the first one visible initially until Triggered." +
  "<br><br>" +
  "The first one changes colors on each change in direction, and the length can be modified with the Count property. " +
  "The second one (once Triggered) moves in the opposite direction, periodically surges in speed, and is modified with Hue property.",

  "Evenly spaced pixels move together around and around the strip, creating a \"Ferris Wheel\" effect." +
  "<br><br>" +
  "The spokes periodically change colors, or can be modified with the Hue and White properties. " +
  "The Count property determines the number of spokes. Triggering toggles the direction of the motion.",

  "The background is \"noise\" (randomly set pixels of random brightness), with the color modified by the Hue and White properties." +
  "<br><br>" +
  "A Trigger causes the background to slowly and continuously expand and contract, with the Force determining the extent of the expansion.",

  "Random colored blinking that periodically surge in the rate of blinking. The Count property determines the number of blinking changes made at once." +
  "<br><br>" +
  "Triggering changes the frequency of the blinking, with larger Forces causing faster blinking surges.",

  "All pixels swell up and down in brightness, with random color hue and whiteness changes, or set with the Hue and White properties." +
  "<br><br>" +
  "Triggering changes the pace of the swelling, with larger Forces causing faster swelling.",

  "Colors melt from one to the other, with slow and smooth transitions." +
  "<br><br>" +
  "Triggering causes a new target color to be is chosen, with larger Forces causing larger color changes.",

  "Festive red and green twinkles, with an occasional white comet that streaks across. " +
  "The comet's whiteness can be modified, and Triggering creates more of them.",

  "Combination of a purple scanner over a greenish twinkling background, with red comets." +
  "<br><br>" +
  "The comet is fired off every time the scanner bounces off the end of the strip, or when Triggered." +
  "<br><br>" +
  "The Hue property affects the color of the twinkling."
];

const pattCmds =
[
  "E2 D20 T E101 F1000 T I G",
  "E1 D20 F1 T I E101 F1000 T I G",
  "E0 B50 D10 H232 W20 Q3 T E142 F250 I E50 B80 D10 W80 T G",
  "E50 B65 D10 H50 W80 Q3 T E20 B90 D30 C25 F0 O3 T6 E20 U0 B90 D30 H30 C45 F0 T I E120 F1 I G",
  "E20 D30 W25 C25 Q7 T I E101 F100 T E20 U0 D20 W25 C25 Q7 T I E101 F200 T G",
  "E40 D20 C25 Q4 T E111 A0 E40 U0 V1 D30 H270 C5 Q1 I E131 F1000 O5 T5 G",
  "E30 D60 C20 Q7 T E160 I E111 F O3 T7 G",
  "E52 D60 W35 C25 Q3 T E150 I E120 I G",
  "E51 D60 C10 Q4 T E112 T E131 F1 T I G",
  "E0 B80 D10 Q3 T E111 F O10 T10 E142 F250 T I G",
  "E0 D30 H30 T E110 F600 T I E111 A1 G",
  "E50 B60 D10 H0 T E50 B70 D15 H125 T E20 V1 B90 D30 H270 W80 C25 Q2 F0 T I20 O10 G",
  "E50 V1 B65 D10 H100 W30 Q1 T E40 D50 H270 C10 T E20 D15 C20 A1 F0 T I G"
];

const pattBits =
[
  0x30,
  0x30,
  0x33,
  0x33,
  0x17,
  0x15,
  0x17,
  0x33,
  0x34,
  0x33,
  0x30,
  0x12,
  0x11,
];

export const orgpatGetInfo = (patnum) =>
{
  if (patnum > pattNames.length) 
    patnum -= 7; // skip basic patterns from app

  --patnum; // make into index;
  if (patnum < 0) patnum = 0;

  return {
    name  : pattNames[patnum],
    desc  : pattDescs[patnum],
    cmds  : pattCmds[patnum],
    bits  : pattBits[patnum],
  };
}