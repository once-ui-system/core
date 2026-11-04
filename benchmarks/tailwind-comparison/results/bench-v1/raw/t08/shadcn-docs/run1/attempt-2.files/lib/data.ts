export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type StepId = "account" | "workspace" | "invite" | "preferences";

export const steps: { id: StepId; title: string; description: string }[] = [
  {
    id: "account",
    title: "Account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Name the home for your team's analytics and issues.",
  },
  {
    id: "invite",
    title: "Invite",
    description: "Bring up to three teammates along. You can skip this.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Choose how Lumen looks and how often it writes to you.",
  },
];

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-30", label: "16–30 people" },
  { value: "31-50", label: "31–50 people" },
];

export const themes = [
  { value: "light", label: "Light", description: "Bright and clean for daytime work." },
  { value: "dark", label: "Dark", description: "Easier on the eyes late at night." },
  { value: "system", label: "System", description: "Match your device setting." },
] as const;

export type ThemeValue = (typeof themes)[number]["value"];

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: [string, string, string];
  theme: ThemeValue;
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

export const STORAGE_KEY = "lumen-onboarding";

export const nextSteps = [
  {
    id: "project",
    title: "Create your first project",
    description:
      "Group events and issues by product area, such as Web app or Mobile.",
  },
  {
    id: "snippet",
    title: "Install the tracking snippet",
    description:
      "Paste one script tag into your app to start capturing page views and events.",
  },
  {
    id: "issue",
    title: "File your first issue",
    description:
      "Link it to a funnel drop-off so the whole team sees the context.",
  },
  {
    id: "board",
    title: "Pin a weekly metrics board",
    description:
      "Choose three numbers your team should look at every Monday.",
  },
];
