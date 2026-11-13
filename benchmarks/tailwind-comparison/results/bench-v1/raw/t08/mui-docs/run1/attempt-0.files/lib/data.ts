export const PRODUCT = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
} as const;

export const USER = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const STEPS = [
  { label: "Account", description: "Tell us who you are" },
  { label: "Workspace", description: "Name your team's home" },
  { label: "Invite", description: "Bring in teammates" },
  { label: "Preferences", description: "Make Lumen yours" },
] as const;

export const TEAM_SIZES = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more" },
] as const;

export type TeamSize = (typeof TEAM_SIZES)[number]["value"];

export const THEME_OPTIONS = [
  { value: "system", label: "System", hint: "Match your device" },
  { value: "light", label: "Light", hint: "Bright and clear" },
  { value: "dark", label: "Dark", hint: "Easy on the eyes" },
] as const;

export type ThemeChoice = (typeof THEME_OPTIONS)[number]["value"];

export const MAX_INVITES = 3;

export const NEXT_STEPS = [
  {
    id: "install",
    title: "Install the Lumen snippet",
    detail:
      "Paste the two-line tracking snippet into your app to start collecting events within minutes.",
  },
  {
    id: "project",
    title: "Create your first project",
    detail:
      "Projects group events, dashboards and issues. Most teams start with one per product.",
  },
  {
    id: "issue",
    title: "File an issue from a chart",
    detail:
      "Spot a drop in sign-ups? Turn it into a tracked issue and assign it in one click.",
  },
  {
    id: "integrations",
    title: "Connect Slack or GitHub",
    detail:
      "Send alerts to a channel and link pull requests to issues automatically.",
  },
] as const;
