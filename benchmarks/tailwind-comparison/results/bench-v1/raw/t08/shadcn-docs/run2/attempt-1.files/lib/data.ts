import {
  BarChart3Icon,
  BugIcon,
  PlugIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking, in one calm place.",
} as const

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const

export type TeamSizeOption = {
  value: string
  label: string
}

export const teamSizes: TeamSizeOption[] = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more people" },
]

export type ThemeValue = "light" | "dark" | "system"

export type ThemeOption = {
  value: ThemeValue
  label: string
}

export const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export type StepId = "account" | "workspace" | "invite" | "preferences"

export type StepDefinition = {
  id: StepId
  title: string
  description: string
}

export const steps: StepDefinition[] = [
  {
    id: "account",
    title: "Account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Name the home for your projects, events and issues.",
  },
  {
    id: "invite",
    title: "Invite",
    description: "Add up to three teammates. You can skip this and invite later.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Choose how Lumen looks and how often it keeps you posted.",
  },
]

export const MAX_INVITES = 3

export type ChecklistItem = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const nextSteps: ChecklistItem[] = [
  {
    id: "install",
    title: "Install the tracking snippet",
    description:
      "Paste the Lumen snippet into your app to start collecting page views and events.",
    icon: PlugIcon,
  },
  {
    id: "issue",
    title: "File your first issue",
    description:
      "Capture a bug or task and assign it, so the board is not empty on day one.",
    icon: BugIcon,
  },
  {
    id: "dashboard",
    title: "Pin a metric to your dashboard",
    description:
      "Start with weekly active users, then add the funnel your team cares about most.",
    icon: BarChart3Icon,
  },
  {
    id: "teammates",
    title: "Check on your teammates' invites",
    description:
      "Invites expire after seven days. Resend any that have not been accepted.",
    icon: UsersIcon,
  },
]
