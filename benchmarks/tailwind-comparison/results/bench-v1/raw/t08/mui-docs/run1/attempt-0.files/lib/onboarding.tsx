"use client";

import * as React from "react";
import { MAX_INVITES } from "./data";
import type { OnboardingState } from "./validation";

const STORAGE_KEY = "lumen-onboarding-v1";

export const INITIAL_STATE: OnboardingState = {
  name: "",
  email: "",
  workspaceName: "",
  teamSize: "",
  invites: Array.from({ length: MAX_INVITES }, () => ""),
  theme: "system",
  weeklyDigest: true,
};

type Action =
  | { type: "set"; patch: Partial<OnboardingState> }
  | { type: "setInvite"; index: number; value: string }
  | { type: "hydrate"; state: OnboardingState }
  | { type: "reset" };

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case "set":
      return { ...state, ...action.patch };
    case "setInvite": {
      const invites = [...state.invites];
      invites[action.index] = action.value;
      return { ...state, invites };
    }
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    default:
      return state;
  }
}

function parseStored(raw: string | null): OnboardingState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<OnboardingState>;
    const invites = Array.from({ length: MAX_INVITES }, (_, i) =>
      typeof data.invites?.[i] === "string" ? (data.invites[i] as string) : "",
    );
    const theme =
      data.theme === "light" || data.theme === "dark" || data.theme === "system"
        ? data.theme
        : "system";
    return {
      name: typeof data.name === "string" ? data.name : "",
      email: typeof data.email === "string" ? data.email : "",
      workspaceName:
        typeof data.workspaceName === "string" ? data.workspaceName : "",
      teamSize: typeof data.teamSize === "string" ? data.teamSize : "",
      invites,
      theme,
      weeklyDigest:
        typeof data.weeklyDigest === "boolean" ? data.weeklyDigest : true,
    };
  } catch {
    return null;
  }
}

interface OnboardingContextValue {
  state: OnboardingState;
  hydrated: boolean;
  update: (patch: Partial<OnboardingState>) => void;
  setInvite: (index: number, value: string) => void;
  reset: () => void;
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(
  null,
);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    let stored: OnboardingState | null = null;
    try {
      stored = parseStored(window.sessionStorage.getItem(STORAGE_KEY));
    } catch {
      stored = null;
    }
    if (stored) dispatch({ type: "hydrate", state: stored });
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: state simply stays in memory */
    }
  }, [state, hydrated]);

  const update = React.useCallback(
    (patch: Partial<OnboardingState>) => dispatch({ type: "set", patch }),
    [],
  );
  const setInvite = React.useCallback(
    (index: number, value: string) =>
      dispatch({ type: "setInvite", index, value }),
    [],
  );
  const reset = React.useCallback(() => dispatch({ type: "reset" }), []);

  const value = React.useMemo(
    () => ({ state, hydrated, update, setInvite, reset }),
    [state, hydrated, update, setInvite, reset],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = React.useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
