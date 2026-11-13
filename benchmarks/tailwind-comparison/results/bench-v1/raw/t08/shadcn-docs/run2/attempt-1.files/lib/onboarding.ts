import { MAX_INVITES, teamSizes, type ThemeValue } from "@/lib/data"

export type OnboardingState = {
  name: string
  email: string
  workspaceName: string
  teamSize: string
  invites: string[]
  theme: ThemeValue
  weeklyDigest: boolean
}

export const initialState: OnboardingState = {
  name: "",
  email: "",
  workspaceName: "",
  teamSize: "",
  invites: Array.from({ length: MAX_INVITES }, () => ""),
  theme: "system",
  weeklyDigest: true,
}

export type StepErrors = {
  name?: string
  email?: string
  workspaceName?: string
  teamSize?: string
  invites?: (string | undefined)[]
  invitesSummary?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function filledInvites(invites: string[]): string[] {
  return invites
    .map((email: string) => email.trim())
    .filter((email: string) => email.length > 0)
}

export function validateStep(
  index: number,
  state: OnboardingState
): StepErrors {
  const errors: StepErrors = {}

  if (index === 0) {
    if (state.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters)."
    }
    if (state.email.trim().length === 0) {
      errors.email = "Enter your work email."
    } else if (!isValidEmail(state.email)) {
      errors.email = "Enter a valid email address, like name@company.com."
    }
  }

  if (index === 1) {
    if (state.workspaceName.trim().length < 2) {
      errors.workspaceName = "Give your workspace a name (at least 2 characters)."
    }
    if (!teamSizes.some((option) => option.value === state.teamSize)) {
      errors.teamSize = "Choose the size of your team."
    }
  }

  if (index === 2) {
    const own = state.email.trim().toLowerCase()
    const seen = new Set<string>()
    const perField: (string | undefined)[] = state.invites.map(
      (raw: string): string | undefined => {
        const email = raw.trim().toLowerCase()
        if (email.length === 0) return undefined
        if (!isValidEmail(email)) return "Enter a valid email address."
        if (email === own) {
          return "That is your own email. Invite a teammate instead."
        }
        if (seen.has(email)) return "This email is already in the list."
        seen.add(email)
        return undefined
      }
    )
    if (perField.some((message) => message !== undefined)) {
      errors.invites = perField
      errors.invitesSummary = "Fix the highlighted emails, or clear them to skip."
    }
  }

  return errors
}

export function hasErrors(errors: StepErrors): boolean {
  return Object.values(errors).some((value) => value !== undefined)
}

const STORAGE_KEY = "lumen-onboarding"

export function saveOnboarding(state: OnboardingState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode); the welcome page has a fallback.
  }
}

export function loadOnboarding(): OnboardingState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return { ...initialState, ...parsed }
  } catch {
    return null
  }
}
