import { helpText_1 } from './helptext_1.js';
import { helpText_2 } from './helptext_2.js';

const helpMap = new Map();

export const helpInit = () =>
{
  helpMap.set(0,
    "Help message 0",
  );
  
  helpText_1(helpMap);
  helpText_2(helpMap);
}

export const helpText = (id) =>
{
  return helpMap.get(id);
}

export const helpTopics =
  [
    { id: 0, text: "What is PixelNut?" },
    {
      id: 1,
      text: "Topic 1",
      children: [
        {
          id: 10,
          text: "Topic 10",
          children: [
            { id: 100, text: "Topic 100" },
            { id: 101, text: "Topic 101" },
          ],
        },
      ],
    },
    {
      id: 2,
      text: "How PixelNut Effect Patterns Work",
      children: [
        { id: 20, text: "Command Definitions" },
        { id: 21, text: "LightWave Example" },
      ],
    },
  ];
