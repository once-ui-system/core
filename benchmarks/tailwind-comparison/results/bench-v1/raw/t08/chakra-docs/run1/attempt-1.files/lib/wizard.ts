import { maxInvites, type TeamSize, type ThemeChoice } from "@/lib/data";

export interface WizardValues {
  name: string;
  email: string;
  workspace: string;
  teamSize: TeamSize | "";
  invites: string[];
  theme: ThemeChoice;
  digest: boolean;
}

export type WizardErrors = Record<string, string>;

export const initialValues: WizardValues = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: Array.from({ length: maxInvites }, () => ""),
  theme: "system",
  digest: true,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateStep(step: number, v: WizardValues): WizardErrors {
  const errors: WizardErrors = {};

  if (step === 0) {
    if (v.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!v.email.trim()) errors.email = "Enter your work email.";
    else if (!emailPattern.test(v.email.trim()))
      errors.email = "Enter a valid email, like name@company.com.";
  }

  if (step === 1) {
    if (v.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!v.teamSize) errors.teamSize = "Choose your team size.";
  }

  if (step === 2) {
    const seen = new Set<string>();
    seen.add(v.email.trim().toLowerCase());
    v.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!emailPattern.test(value))
        errors[`invite${i}`] = "Enter a valid email address.";
      else if (seen.has(value))
        errors[`invite${i}`] =
          value === v.email.trim().toLowerCase()
            ? "That's your own email."
            : "This email is already in the list.";
      else seen.add(value);
    });
  }

  return errors;
}
