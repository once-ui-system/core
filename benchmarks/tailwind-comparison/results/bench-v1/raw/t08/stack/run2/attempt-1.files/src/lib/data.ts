import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type TeamSize = "1-5" | "6-15" | "16-50" | "51-200";

export const teamSizes: { value: TeamSize; label: string }[] = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51-200", label: "51–200 people" },
];

export type ThemeChoice = "system" | "light" | "dark";

export const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const MAX_INVITES = 3;

export const steps = [
  { id: "account", label: "Account", hint: "Who you are" },
  { id: "workspace", label: "Workspace", hint: "Your team's home" },
  { id: "invite", label: "Invite", hint: "Bring teammates" },
  { id: "preferences", label: "Preferences", hint: "Make it yours" },
] as const;

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: TeamSize | "";
  invites: string[];
  theme: ThemeChoice;
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

export type StepErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

const FREE_MAIL = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];

export function validateStep(step: number, data: OnboardingData): StepErrors {
  const errors: StepErrors = {};

  if (step === 0) {
    if (data.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    const email = data.email.trim().toLowerCase();
    if (!email) {
      errors.email = "Enter your work email.";
    } else if (!isEmail(email)) {
      errors.email = "That doesn't look like an email address, e.g. maya@acmelabs.io.";
    } else if (FREE_MAIL.includes(email.split("@")[1])) {
      errors.email = "Use your work email so teammates can find you.";
    }
  }

  if (step === 1) {
    const ws = data.workspace.trim();
    if (ws.length < 2) {
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    } else if (ws.length > 40) {
      errors.workspace = "Keep the workspace name under 40 characters.";
    }
    if (!data.teamSize) {
      errors.teamSize = "Choose your team size.";
    }
  }

  if (step === 2) {
    const own = data.email.trim().toLowerCase();
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!isEmail(value)) {
        errors[`invite${i}`] = "Enter a valid email address or leave this blank.";
      } else if (value === own) {
        errors[`invite${i}`] = "That's your own address. Invite a teammate instead.";
      } else if (seen.has(value)) {
        errors[`invite${i}`] = "You've already added this address.";
      } else {
        seen.add(value);
      }
    });
  }

  return errors;
}

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  minutes: number;
};

export const nextSteps: ChecklistItem[] = [
  {
    id: "snippet",
    title: "Install the Lumen snippet",
    description: "Paste one script tag into your app to start capturing events and errors.",
    icon: "code",
    minutes: 5,
  },
  {
    id: "issue",
    title: "File your first issue",
    description: "Turn a rough bug report into a tracked issue with an owner and a priority.",
    icon: "flag",
    minutes: 2,
  },
  {
    id: "dashboard",
    title: "Pin a metric to your dashboard",
    description: "Start with weekly active users, then add the funnel your team cares about.",
    icon: "barChart",
    minutes: 4,
  },
  {
    id: "slack",
    title: "Connect your team chat",
    description: "Get new regressions and release summaries where your team already talks.",
    icon: "chat",
    minutes: 3,
  },
];
