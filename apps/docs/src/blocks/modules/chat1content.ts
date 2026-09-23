export type ChatMessage = {
  postedAt: Date;
  message: string;
  author: {
    name: string;
    avatar: string;
  };
  attachments?: {
    media: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    reacted: boolean;
  }[];
};

export const chatMessages: ChatMessage[] = [
  {
    postedAt: new Date(),
    message: "Shipping a small polish to the sidebar. Thoughts?",
    author: { name: "Lorant", avatar: "/images/creators/lorant.jpg" },
    attachments: [{ media: "/images/blocks/sidebar-dark.jpg" }],
    reactions: [
      { emoji: "👍", count: 7, reacted: true },
      { emoji: "🔥", count: 3, reacted: false },
      { emoji: "💀", count: 1, reacted: false },
    ],
  },
  {
    postedAt: new Date(Date.now() - 3 * 60 * 1000),
    message: "Looks clean! Maybe tighten the mobile padding a bit.",
    author: { name: "Divyanshu", avatar: "/images/creators/div.jpg" },
    reactions: [{ emoji: "👍", count: 2, reacted: false }],
  },
  {
    postedAt: new Date(Date.now() - 6 * 60 * 1000),
    message: "Check this out 👇 New docs section draft.",
    author: { name: "Suhaib King", avatar: "/images/creators/suhaib.jpg" },
    attachments: [{ media: "https://once-ui.com" }],
    reactions: [
      { emoji: "👀", count: 9, reacted: false },
      { emoji: "👍", count: 6, reacted: true },
    ],
  },
  {
    postedAt: new Date(Date.now() - 12 * 60 * 1000),
    message: "A fun project for the Design Engineers Club",
    author: { name: "Lorant", avatar: "/images/creators/lorant.jpg" },
    attachments: [
      { media: "/images/blocks/vibe-coding-light.jpg" },
      { media: "/images/blocks/vibe-coding-dark.jpg" },
    ],
    reactions: [
      { emoji: "🔥", count: 14, reacted: true },
      { emoji: "❤️", count: 8, reacted: false },
    ],
  },
  {
    postedAt: new Date(Date.now() - 20 * 60 * 1000),
    message: "Love the contrast on dark mode. Maybe soften the glow by 10%?",
    author: { name: "light", avatar: "/images/creators/light.jpg" },
    reactions: [
      { emoji: "👍", count: 4, reacted: false },
      { emoji: "🧪", count: 2, reacted: false },
    ],
  },
  {
    postedAt: new Date(Date.now() - 28 * 60 * 1000),
    message: "Nice video edit and interesting perspective",
    author: { name: "Lorant", avatar: "/images/creators/lorant.jpg" },
    attachments: [{ media: "https://www.youtube.com/watch?v=hN-ITerTpLg&t=930s" }],
    reactions: [
      { emoji: "👍", count: 11, reacted: false },
      { emoji: "🎯", count: 6, reacted: true },
    ],
  },
  {
    postedAt: new Date(Date.now() - 45 * 60 * 1000),
    message: "Deployed a fix for the hover jitter on buttons.",
    author: { name: "Osmy", avatar: "/images/creators/osmy.jpg" },
    reactions: [],
  },
  {
    postedAt: new Date(Date.now() - 75 * 60 * 1000),
    message: "Grabbing coffee ☕ be back in 10.",
    author: { name: "Texz", avatar: "/images/creators/texz.jpg" },
    reactions: [{ emoji: "👍", count: 1, reacted: false }],
  },
];

export type ChatMember = {
  title: string;
  members: {
    name: string;
    avatar: string;
    status: string;
    statusColor: string;
    bio: string;
  }[];
};

export const chatMembers: ChatMember[] = [
  {
    title: "Admins",
    members: [
      {
        name: "Lorant",
        avatar: "/images/creators/lorant.jpg",
        status: "Coding something...",
        statusColor: "green",
        bio: "Lorant from Once UI",
      },
    ],
  },
  {
    title: "Mods",
    members: [
      {
        name: "Suhaib King",
        avatar: "/images/creators/suhaib.jpg",
        status: "",
        statusColor: "green",
        bio: "Experienced full stack dev",
      },
      {
        name: "Vincent",
        avatar: "/images/creators/vincent.jpg",
        status: "",
        statusColor: "green",
        bio: "Community manager",
      },
    ],
  },
  {
    title: "Builders",
    members: [
      { name: "El Zec", avatar: "", status: "The man", statusColor: "green", bio: "" },
      {
        name: "Osmy",
        avatar: "/images/creators/osmy.jpg",
        status: "osmyreal.com",
        statusColor: "green",
        bio: "Check out osmyreal!",
      },
      {
        name: "Divyanshu",
        avatar: "/images/creators/div.jpg",
        status: "",
        statusColor: "green",
        bio: "Building cool stuff",
      },
      {
        name: "light",
        avatar: "/images/creators/light.jpg",
        status: "Buildin' Script",
        statusColor: "green",
        bio: "Hey, I'm light!",
      },
      {
        name: "Ryan",
        avatar: "/images/creators/ryan.jpg",
        status: "✨ Confinity ",
        statusColor: "green",
        bio: "",
      },
      { name: "Aryan Techie", avatar: "", status: "", statusColor: "green", bio: "" },
    ],
  },
  {
    title: "Offline",
    members: [
      {
        name: "Texz",
        avatar: "/images/creators/texz.jpg",
        status: "",
        statusColor: "gray",
        bio: "Composing something 🎹🎵",
      },
      {
        name: "Issa",
        avatar: "/images/creators/issa.jpg",
        status: "Databuddy ⚡",
        statusColor: "gray",
        bio: "",
      },
      {
        name: "Zaidh",
        avatar: "/images/creators/zaidh.jpg",
        status: "Vibing with Cursor",
        statusColor: "gray",
        bio: "",
      },
      {
        name: "Victor",
        avatar: "/images/creators/victor.jpg",
        status: "",
        statusColor: "gray",
        bio: "Game dev",
      },
      {
        name: "Evan",
        avatar: "/images/creators/evan.jpg",
        status: "",
        statusColor: "gray",
        bio: "",
      },
      { name: "Swift", avatar: "", status: "", statusColor: "gray", bio: "" },
    ],
  },
];

export type SidebarSection = { title?: string; items?: SidebarItem[]; rooms?: SidebarItem[] };
export type SidebarItem = { label: string };

export const sidebar: SidebarSection[] = [
  {
    items: [{ label: "Server guide" }, { label: "Members" }],
  },
  {
    title: "Chat",
    rooms: [
      { label: "👋 ┃ intro" },
      { label: "💬 ┃ chat" },
      { label: "📢 ┃ announcements" },
      { label: "🛠️ ┃ support" },
      { label: "🎨 ┃ design" },
      { label: "🧪 ┃ testing" },
    ],
  },
  {
    title: "Voice",
    rooms: [{ label: "🔊 ┃ general" }, { label: "🎧 ┃ focus" }],
  },
];
