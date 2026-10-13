export type SidebarItem = { label: string };
export type SidebarSection = { title?: string; items?: SidebarItem[]; rooms?: SidebarItem[] };

export const sidebar: SidebarSection[] = [
  {
    items: [{ label: "Members" }, { label: "Files" }, { label: "Pins" }],
  },
  {
    title: "Channels",
    rooms: [{ label: "👋 ┃ intro" }, { label: "general" }, { label: "design-system" }],
  },
];

export type ChatMember = {
  title: string;
  members: {
    name: string;
    avatar: string;
    status: string;
    statusColor: "green" | "gray";
    bio: string;
  }[];
};

export const chatMembers: ChatMember[] = [
  {
    title: "Online",
    members: [
      {
        name: "Jane Wong",
        status: "Active now",
        bio: "Design engineer",
        avatar: "/images/creators/lorant.jpg",
        statusColor: "green",
      },
      {
        name: "Lorant K.",
        status: "Coding something...",
        bio: "Building Once UI",
        avatar: "/images/creators/lorant.jpg",
        statusColor: "green",
      },
    ],
  },
];

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
    attachments: [{ media: "/images/blocks/vibe-coding-dark.jpg" }],
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
