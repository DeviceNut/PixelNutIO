
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
      text: "Topic 2",
      children: [
        { id: 20, text: "Topic 20" },
        { id: 21, text: "Topic 21" },
      ],
    },
  ];

  const helpMap = new Map();

helpMap.set(0,
  "Help message 0",
);

helpMap.set(1,
  "Help message 1",
);

helpMap.set(10,
  "Help message 10",
);

helpMap.set(100,
  "Help message 100",
);

helpMap.set(101,
  "Help message 101",
);

helpMap.set(2,
  "Help message 2",
);

helpMap.set(20,
  "Help message 20",
);

helpMap.set(21,
  "Help message 21",
);
