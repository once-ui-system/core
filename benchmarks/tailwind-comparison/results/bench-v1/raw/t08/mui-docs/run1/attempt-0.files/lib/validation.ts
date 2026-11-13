import { MAX_INVITES } from "./data";

export interface OnboardingState {
  name: string;
  email: string;
  workspaceName: string;
  teamSize: string;
  invites: string[];
  theme: "system" | "light" | "dark";
  weeklyDigest: boolean;
}

export type Errors = Record<string, string | undefined>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validateStep(step: number, s: OnboardingState): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (s.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    if (!s.email.trim()) {
      errors.email = "Enter your work email.";
    } else if (!isEmail(s.email)) {
      errors.email = "Enter a valid email address, like name@company.com.";
    }
  }

  if (step === 1) {
    if (s.workspaceName.trim().length < 2) {
      errors.workspaceName = "Give your workspace a name (at least 2 characters).";
    }
    if (!s.teamSize) {
      errors.teamSize = "Choose your team size.";
    }
  }

  if (step === 2) {
    const seen = new Set<string>();
    for (let i = 0; i < MAX_INVITES; i += 1) {
      const raw = (s.invites[i] ?? "").trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!isEmail(raw)) {
        errors[`invite-${i}`] = "Enter a valid email address or leave this blank.";
      } else if (key === s.email.trim().toLowerCase()) {
        errors[`invite-${i}`] = "That's your own email. Invite a teammate instead.";
      } else if (seen.has(key)) {
        errors[`invite-${i}`] = "This email is already in the list.";
      }
      seen.add(key);
    }
  }

  return errors;
}
