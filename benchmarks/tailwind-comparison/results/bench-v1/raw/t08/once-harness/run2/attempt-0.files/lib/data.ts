export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const STORAGE_KEY = "lumen-onboarding-v1";

export type Theme = "light" | "dark" | "system";
export type Digest = "weekly" | "monthly" | "off";

export interface OnboardingData {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: [string, string, string];
  theme: Theme;
  digest: boolean;
}

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
  { id: "workspace", title: "Workspace", hint: "Name your team's home" },
  { id: "invite", title: "Invite", hint: "Bring teammates along" },
  { id: "preferences", title: "Preferences", hint: "Make Lumen yours" },
] as const;

export const teamSizes = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "50+", label: "50+" },
];

export const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const nextSteps = [
  {
    icon: "cube",
    title: "Create your first project",
    text: "Group issues and events by product, like “Acme Mobile” or “Billing API”.",
  },
  {
    icon: "code",
    title: "Install the tracking snippet",
    text: "Paste two lines into your app to start collecting page views and errors.",
  },
  {
    icon: "bolt",
    title: "File your first issue",
    text: "Capture a bug from a failed event, or write one up by hand.",
  },
  {
    icon: "people",
    title: "Check on your invites",
    text: "Teammates you invited can join as soon as they accept their email.",
  },
] as const;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
