export const sidebar = [
  {
    items: [
      { label: "Members" },
      { label: "Files" },
      { label: "Pins" },
    ],
  },
  {
    title: "Channels",
    rooms: [
      { label: "👋 ┃ intro" },
      { label: "general" },
      { label: "design-system" },
    ],
  },
];

export const chatMembers = [
  {
    title: "Online",
    members: [
      {
        name: "Jane Wong",
        status: "Active now",
        bio: "Design engineer",
        avatar: "/images/creators/lorant.jpg",
        group: "Online",
      },
      {
        name: "Lorant K.",
        status: "Coding something...",
        bio: "Building Once UI",
        avatar: "/images/creators/lorant.jpg",
        group: "Online",
      },
    ],
  },
];

export const chatMessages = [
  {
    author: { name: "Jane Wong", avatar: "/images/creators/lorant.jpg" },
    postedAt: new Date("2025-01-18T09:38:00"),
    message: "Can you sanity-check the chat density before we ship?",
    attachments: [],
    reactions: [{ emoji: "👍", count: 2, reacted: true }],
  },
  {
    author: { name: "Lorant K.", avatar: "/images/creators/lorant.jpg" },
    postedAt: new Date("2025-01-18T09:40:00"),
    message: "On it — Discord sidebar + Linear message rhythm.",
    attachments: [
      { media: "/images/blocks/vibe-coding-dark.jpg" },
    ],
    reactions: [],
  },
  {
    author: { name: "Jane Wong", avatar: "/images/creators/lorant.jpg" },
    postedAt: new Date("2025-01-18T09:42:00"),
    message: "",
    attachments: [{ media: "https://docs.once-ui.com" }],
    reactions: [{ emoji: "🔗", count: 1, reacted: false }],
  },
];
