export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ThemeChoice = "light" | "dark" | "auto";

export interface OnboardingData {
  name: string;
  email: string;
  workspace: string;
  teamSize: string | null;
  invites: [string, string, string];
  theme: ThemeChoice;
  digest: boolean;
}

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: null,
  invites: ["", "", ""],
  theme: "auto",
  digest: true,
};

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51+ people" },
];

export const steps = [
  { label: "Account", description: "About you" },
  { label: "Workspace", description: "Your team" },
  { label: "Invite", description: "Add teammates" },
  { label: "Preferences", description: "Make it yours" },
] as const;

export const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "System" },
];

export const checklist = [
  {
    title: "Install the Lumen snippet",
    text: "Paste the tracking snippet into your app to start collecting product events.",
  },
  {
    title: "Create your first project",
    text: "Group events and issues by product, for example “Web app” or “Mobile”.",
  },
  {
    title: "Log an issue from a session",
    text: "Spot a problem in a user session and turn it into a tracked issue in one click.",
  },
  {
    title: "Connect your repository",
    text: "Link GitHub so issues close automatically when a fix is merged.",
  },
];

export const STORAGE_KEY = "lumen-onboarding";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export type Errors = Record<string, string | undefined>;

export function validateStep(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name (at least 2 characters).";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!isEmail(data.email)) errors.email = "Enter a valid email address, like maya@acmelabs.io.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!data.teamSize) errors.teamSize = "Select your team size.";
  }
  if (step === 2) {
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const v = raw.trim().toLowerCase();
      if (!v) return;
      if (!isEmail(v)) errors[`invite${i}`] = "Enter a valid email address.";
      else if (v === data.email.trim().toLowerCase())
        errors[`invite${i}`] = "That's your own email. Invite a teammate instead.";
      else if (seen.has(v)) errors[`invite${i}`] = "This email is already in the list.";
      else seen.add(v);
    });
  }
  return errors;
}
