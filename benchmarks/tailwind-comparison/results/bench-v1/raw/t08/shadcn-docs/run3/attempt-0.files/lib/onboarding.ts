import { MAX_INVITES, TEAM_SIZES, user } from "@/lib/data";

export type Theme = "light" | "dark" | "system";

export interface OnboardingData {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: Theme;
  digest: boolean;
}

export type Errors = Record<string, string>;

export const STORAGE_KEY = "lumen-onboarding";

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: Array.from({ length: MAX_INVITES }, () => ""),
  theme: "system",
  digest: true,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FREE_MAIL = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

export function validateStep(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (data.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    const email = data.email.trim().toLowerCase();
    if (!email) {
      errors.email = "Enter your work email.";
    } else if (!EMAIL_RE.test(email)) {
      errors.email = "That doesn't look like a valid email address.";
    } else if (FREE_MAIL.includes(email.split("@")[1])) {
      errors.email = "Please use your work email, not a personal address.";
    }
  }

  if (step === 1) {
    const ws = data.workspace.trim();
    if (ws.length < 2) {
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    } else if (ws.length > 40) {
      errors.workspace = "Workspace names can be up to 40 characters.";
    }
    if (!data.teamSize) {
      errors.teamSize = "Choose the size of your team.";
    }
  }

  if (step === 2) {
    const seen = new Set<string>();
    const own = data.email.trim().toLowerCase();
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!EMAIL_RE.test(value)) {
        errors[`invite-${i}`] = "Enter a valid email address or leave it empty.";
      } else if (value === own) {
        errors[`invite-${i}`] = "That's your own email. Invite a teammate instead.";
      } else if (seen.has(value)) {
        errors[`invite-${i}`] = "You've already added this email.";
      } else {
        seen.add(value);
      }
    });
  }

  return errors;
}

export function teamSizeLabel(value: string): string {
  return TEAM_SIZES.find((t) => t.value === value)?.label ?? "";
}

export function filledInvites(data: OnboardingData): string[] {
  return data.invites.map((e) => e.trim()).filter(Boolean);
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || user.name.split(" ")[0];
}
