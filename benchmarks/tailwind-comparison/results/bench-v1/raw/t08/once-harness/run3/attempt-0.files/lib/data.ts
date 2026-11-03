import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  description: "A product-analytics and issue-tracking app for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type StepId = "account" | "workspace" | "invite" | "preferences";

export const steps: { id: StepId; label: string; title: string; description: string }[] = [
  {
    id: "account",
    label: "Account",
    title: "Create your account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    label: "Workspace",
    title: "Set up your workspace",
    description: "A workspace holds your projects, events and issues.",
  },
  {
    id: "invite",
    label: "Invite",
    title: "Invite your team",
    description: "Add up to three teammates now. You can skip this and invite people later.",
  },
  {
    id: "preferences",
    label: "Preferences",
    title: "Choose your preferences",
    description: "Pick how Lumen looks and how often we email you.",
  },
];

export const teamSizeOptions = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more" },
];

export const themeOptions: { value: string; label: string; icon: IconName }[] = [
  { value: "system", label: "System", icon: "computer" },
  { value: "light", label: "Light", icon: "light" },
  { value: "dark", label: "Dark", icon: "dark" },
];

export const checklist: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Install the tracking snippet",
    description: "Paste one script tag into your app to start collecting events within minutes.",
    icon: "code",
  },
  {
    title: "Create your first project",
    description: "Group events and issues for a single product, such as your web app or mobile client.",
    icon: "folder",
  },
  {
    title: "Triage the first issue",
    description: "Link a crash report to an issue and assign it to someone on your team.",
    icon: "flag",
  },
  {
    title: "Build a weekly dashboard",
    description: "Pin sign-ups, active users and open bugs so Monday stand-ups take five minutes.",
    icon: "barChart",
  },
];

export const STORAGE_KEY = "lumen-onboarding";

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: string;
  digest: boolean;
};

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: ["", "", ""],
  theme: "system",
  digest: true,
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
