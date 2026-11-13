import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  BugIcon,
  PlugIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";

export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking, in one calm place.",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const STEPS = [
  {
    id: "account",
    title: "Account",
    description: "Tell us who you are.",
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Name your team's home in Lumen.",
  },
  {
    id: "invite",
    title: "Invite",
    description: "Bring up to three teammates along.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Make Lumen feel right.",
  },
] as const;

export const TEAM_SIZES = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51-200", label: "51–200 people" },
] as const;

export const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const MAX_INVITES = 3;

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const NEXT_STEPS: ChecklistItem[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add a photo and a short bio so teammates recognise you.",
    icon: UserRoundIcon,
  },
  {
    id: "sdk",
    title: "Install the Lumen snippet",
    description:
      "Paste two lines into your app to start collecting product events.",
    icon: PlugIcon,
  },
  {
    id: "issue",
    title: "File your first issue",
    description: "Track a bug or a to-do and assign it to a teammate.",
    icon: BugIcon,
  },
  {
    id: "dashboard",
    title: "Build a starter dashboard",
    description: "Pin signups, active users and open issues to one board.",
    icon: BarChart3Icon,
  },
  {
    id: "team",
    title: "Check in on your invites",
    description: "See who has joined and resend any pending invitations.",
    icon: UsersRoundIcon,
  },
];
