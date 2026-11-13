import type { IconName } from "@once-ui-system/core";

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

export const steps = [
  {
    id: "account",
    title: "Account",
    heading: "Create your account",
    blurb: "Tell us who you are so teammates recognise your invites.",
  },
  {
    id: "workspace",
    title: "Workspace",
    heading: "Set up your workspace",
    blurb: "A workspace holds your projects, events and issues in one place.",
  },
  {
    id: "invite",
    title: "Invite",
    heading: "Invite your teammates",
    blurb: "Add up to three people now. You can always invite more later.",
  },
  {
    id: "preferences",
    title: "Preferences",
    heading: "Choose your preferences",
    blurb: "Pick how Lumen looks and how often we email you.",
  },
] as const;

export const teamSizes = [
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "50+", label: "More than 50 people" },
];

export const themeOptions = [
  { value: "system", label: "System", prefixIcon: "computer" },
  { value: "light", label: "Light", prefixIcon: "light" },
  { value: "dark", label: "Dark", prefixIcon: "dark" },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  prefixIcon: IconName;
}>;

export const placeholders = {
  name: user.name,
  email: user.email,
  workspace: "Acme Labs",
  invites: ["jonas@acmelabs.io", "priya@acmelabs.io", "tomas@acmelabs.io"],
};

export const nextSteps: {
  icon: IconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "code",
    title: "Install the Lumen snippet",
    description:
      "Paste one script tag into your app to start capturing page views and events.",
  },
  {
    icon: "flag",
    title: "Create your first project",
    description:
      "Group events, funnels and issues for a single product or service.",
  },
  {
    icon: "people",
    title: "Check your teammates' invites",
    description:
      "Invitations are valid for seven days. Resend any that go unanswered.",
  },
  {
    icon: "bell",
    title: "Connect Slack for issue alerts",
    description:
      "Get a message when a new issue crosses your error-rate threshold.",
  },
];
