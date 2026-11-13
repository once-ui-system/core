export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const steps = [
  { id: 1, label: "Account", hint: "Who you are" },
  { id: 2, label: "Workspace", hint: "Your team's home" },
  { id: 3, label: "Invite", hint: "Bring teammates" },
  { id: 4, label: "Preferences", hint: "Make it yours" },
] as const;

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51+ people" },
] as const;

export const themes = [
  { value: "light", label: "Light", description: "Bright and crisp" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "system", label: "System", description: "Match your device" },
] as const;

export type ThemeValue = (typeof themes)[number]["value"];

export const MAX_INVITES = 3;

export const nextSteps = [
  {
    title: "Connect your first data source",
    description:
      "Install the Lumen snippet or SDK so page views and events start flowing into your dashboards.",
  },
  {
    title: "Create your first project",
    description:
      "Projects group your issues, releases and analytics for a single product or service.",
  },
  {
    title: "Import or file your first issues",
    description:
      "Bring in a CSV from your old tracker, or log the bug you've been meaning to write down.",
  },
  {
    title: "Set up a weekly review",
    description:
      "Pick a day for the team to look at funnel drop-offs and the issue backlog together.",
  },
];
