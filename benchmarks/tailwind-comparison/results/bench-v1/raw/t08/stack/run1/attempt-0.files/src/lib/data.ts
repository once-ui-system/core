import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
} as const;

export const demoUser = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export type StepId = "account" | "workspace" | "invite" | "preferences";

export const steps: { id: StepId; label: string; title: string; description: string }[] = [
  {
    id: "account",
    label: "Account",
    title: "Create your account",
    description: "Tell us who you are. We'll use your work email for sign-in and product updates.",
  },
  {
    id: "workspace",
    label: "Workspace",
    title: "Set up your workspace",
    description: "A workspace holds your projects, events and issues. You can rename it later.",
  },
  {
    id: "invite",
    label: "Invite",
    title: "Invite your teammates",
    description: "Add up to three people now. Lumen is better with the whole team, but you can skip this.",
  },
  {
    id: "preferences",
    label: "Preferences",
    title: "Choose your preferences",
    description: "Pick how Lumen looks and whether you want a weekly summary in your inbox.",
  },
];

export const teamSizes = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "50+", label: "50+" },
] as const;

export const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export type ThemeChoice = (typeof themeOptions)[number]["value"];

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: ThemeChoice;
  digest: boolean;
};

export const initialOnboarding: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: ["", "", ""],
  theme: "system",
  digest: true,
};

export const STORAGE_KEY = "lumen-onboarding";

export const checklist: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Install the Lumen snippet",
    description: "Paste one script tag into your app to start capturing events in minutes.",
    icon: "code",
  },
  {
    title: "Create your first project",
    description: "Group events and issues by product, such as your web app or mobile client.",
    icon: "folder",
  },
  {
    title: "Connect your repository",
    description: "Link GitHub so issues can reference commits and pull requests.",
    icon: "link",
  },
  {
    title: "Triage your first issue",
    description: "Open the inbox, assign an owner and set a priority for the newest report.",
    icon: "checkbox",
  },
];
