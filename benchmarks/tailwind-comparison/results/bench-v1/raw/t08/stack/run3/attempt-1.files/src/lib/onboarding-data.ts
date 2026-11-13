export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export const demoUser = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ThemeChoice = "system" | "light" | "dark";

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: [string, string, string];
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

export const steps = [
  { id: "account", title: "Account", hint: "Tell us who you are" },
  { id: "workspace", title: "Workspace", hint: "Name your team's space" },
  { id: "invite", title: "Invite", hint: "Bring teammates along" },
  { id: "preferences", title: "Preferences", hint: "Make Lumen yours" },
] as const;

export const teamSizeOptions: { value: string; label: string }[] = [
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2 to 5 people" },
  { value: "6-15", label: "6 to 15 people" },
  { value: "16-50", label: "16 to 50 people" },
  { value: "50+", label: "More than 50" },
];

export const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const checklist = [
  {
    title: "Connect your first project",
    description:
      "Install the Lumen snippet or import a repository to start collecting events.",
    icon: "code",
  },
  {
    title: "Create your first issue",
    description: "Capture a bug or task and assign it to someone on your team.",
    icon: "checkbox",
  },
  {
    title: "Build a dashboard",
    description:
      "Pick a few metrics, like weekly active users and open bugs, and pin them.",
    icon: "barChart",
  },
  {
    title: "Invite the rest of your team",
    description: "Teammates get access to the same projects and dashboards.",
    icon: "people",
  },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export type InviteErrors = [string | undefined, string | undefined, string | undefined];

export type Errors = {
  name?: string;
  email?: string;
  workspace?: string;
  teamSize?: string;
  invites?: InviteErrors;
};

export function validateStep(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!isEmail(data.email))
      errors.email = "That doesn't look like a valid email address.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (2 characters or more).";
    if (!data.teamSize) errors.teamSize = "Choose your team size.";
  }
  if (step === 2) {
    const invErrors: InviteErrors = [undefined, undefined, undefined];
    const seen = new Set<string>();
    if (data.email.trim()) seen.add(data.email.trim().toLowerCase());
    let any = false;
    data.invites.forEach((raw, i) => {
      const v = raw.trim().toLowerCase();
      if (!v) return;
      if (!isEmail(v)) {
        invErrors[i] = "Enter a valid email address, or leave it empty.";
        any = true;
      } else if (seen.has(v)) {
        invErrors[i] = "This email is already used.";
        any = true;
      } else {
        seen.add(v);
      }
    });
    if (any) errors.invites = invErrors;
  }
  return errors;
}
