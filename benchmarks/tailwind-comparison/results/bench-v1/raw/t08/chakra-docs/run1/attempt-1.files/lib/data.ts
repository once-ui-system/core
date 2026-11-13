export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const wizardSteps = [
  { title: "Account", description: "About you" },
  { title: "Workspace", description: "Your team's home" },
  { title: "Invite", description: "Bring teammates" },
  { title: "Preferences", description: "Make it yours" },
] as const;

export const teamSizeOptions = [
  { value: "1-5", label: "1 to 5 people" },
  { value: "6-15", label: "6 to 15 people" },
  { value: "16-50", label: "16 to 50 people" },
  { value: "51+", label: "More than 50 people" },
] as const;

export type TeamSize = (typeof teamSizeOptions)[number]["value"];
export type ThemeChoice = "light" | "dark" | "system";

export const themeOptions: {
  value: ThemeChoice;
  label: string;
  description: string;
}[] = [
  { value: "light", label: "Light", description: "Bright and crisp" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "system", label: "System", description: "Match your device" },
];

export const maxInvites = 3;

export const nextStepsChecklist = [
  {
    title: "Connect your first data source",
    description:
      "Install the Lumen snippet or connect your repository to start collecting events.",
  },
  {
    title: "Create your first project",
    description:
      "Projects group dashboards and issues, so start with the product you ship most often.",
  },
  {
    title: "Triage the sample issues",
    description:
      "We added three example issues so you can try labels, assignees and priorities.",
  },
  {
    title: "Build a weekly metrics dashboard",
    description:
      "Pin active users, error rate and open issues to one board for your Monday stand-up.",
  },
];
