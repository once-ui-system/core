import { MAX_INVITES, type OnboardingData, type StepId } from "@/lib/data"

export type Errors = Record<string, string>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function validateStep(id: StepId, data: OnboardingData): Errors {
  const errors: Errors = {}

  if (id === "account") {
    if (data.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters)."
    }
    if (data.email.trim() === "") {
      errors.email = "Enter your work email."
    } else if (!isEmail(data.email)) {
      errors.email = "Enter a valid email address, like maya@acmelabs.io."
    }
  }

  if (id === "workspace") {
    if (data.workspace.trim().length < 2) {
      errors.workspace = "Give your workspace a name (at least 2 characters)."
    }
    if (data.teamSize === "") {
      errors.teamSize = "Choose your team size."
    }
  }

  if (id === "invite") {
    const seen = new Set<string>()
    seen.add(data.email.trim().toLowerCase())
    for (let i = 0; i < MAX_INVITES; i++) {
      const raw = (data.invites[i] ?? "").trim()
      if (raw === "") continue
      const key = raw.toLowerCase()
      if (!isEmail(raw)) {
        errors[`invite-${i}`] = "Enter a valid email address."
      } else if (seen.has(key)) {
        errors[`invite-${i}`] =
          key === data.email.trim().toLowerCase()
            ? "That is your own email. Invite a teammate instead."
            : "This email is already in the list."
      }
      seen.add(key)
    }
  }

  return errors
}
