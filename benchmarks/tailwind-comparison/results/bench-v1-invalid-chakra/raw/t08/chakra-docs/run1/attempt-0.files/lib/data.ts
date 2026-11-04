export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking in one calm workspace.",
} as const

export const sampleUser = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const

export type StepId = "account" | "workspace" | "invite" | "preferences"

export interface StepMeta {
  id: StepId
  title: string
  short: string
  description: string
}

export const steps: readonly StepMeta[] = [
  {
    id: "account",
    title: "Create your account",
    short: "Account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    title: "Set up your workspace",
    short: "Workspace",
    description: "A workspace holds your projects, issues and dashboards.",
  },
  {
    id: "invite",
    title: "Invite your teammates",
    short: "Invite",
    description: "Add up to three people now. You can always invite more later.",
  },
  {
    id: "preferences",
    title: "Choose your preferences",
    short: "Preferences",
    description: "Pick how Lumen looks and how often we email you.",
  },
]

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more people" },
] as const

export type ThemeChoice = "light" | "dark" | "system"

export const themeOptions: readonly {
  value: ThemeChoice
  label: string
  description: string
}[] = [
  { value: "light", label: "Light", description: "Bright and clear" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "system", label: "System", description: "Match your device" },
]

export const MAX_INVITES = 3

export interface OnboardingData {
  name: string
  email: string
  workspace: string
  teamSize: string
  invites: string[]
  theme: ThemeChoice
  weeklyDigest: boolean
}

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: ["", "", ""],
  theme: "system",
  weeklyDigest: true,
}

export const STORAGE_KEY = "lumen:onboarding"

export const nextSteps = [
  {
    id: "project",
    title: "Create your first project",
    description:
      "Group issues and analytics for one product, for example “Acme Mobile App”.",
  },
  {
    id: "snippet",
    title: "Install the tracking snippet",
    description:
      "Add the Lumen snippet to your app to start collecting events within minutes.",
  },
  {
    id: "issue",
    title: "Log your first issue",
    description:
      "Capture a bug or task and assign it to yourself or a teammate.",
  },
  {
    id: "dashboard",
    title: "Pin a metric to your dashboard",
    description:
      "Start with weekly active users or issues closed per week.",
  },
] as const
