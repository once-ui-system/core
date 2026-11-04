Here are all the files.

```ts lib/data.ts
export const PRODUCT = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
} as const;

export const USER = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const STEPS = [
  { label: "Account", description: "Tell us who you are" },
  { label: "Workspace", description: "Name your team's home" },
  { label: "Invite", description: "Bring in teammates" },
  { label: "Preferences", description: "Make Lumen yours" },
] as const;

export const TEAM_SIZES = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more" },
] as const;

export type TeamSize = (typeof TEAM_SIZES)[number]["value"];

export const THEME_OPTIONS = [
  { value: "system", label: "System", hint: "Match your device" },
  { value: "light", label: "Light", hint: "Bright and clear" },
  { value: "dark", label: "Dark", hint: "Easy on the eyes" },
] as const;

export type ThemeChoice = (typeof THEME_OPTIONS)[number]["value"];

export const MAX_INVITES = 3;

export const NEXT_STEPS = [
  {
    id: "install",
    title: "Install the Lumen snippet",
    detail:
      "Paste the two-line tracking snippet into your app to start collecting events within minutes.",
  },
  {
    id: "project",
    title: "Create your first project",
    detail:
      "Projects group events, dashboards and issues. Most teams start with one per product.",
  },
  {
    id: "issue",
    title: "File an issue from a chart",
    detail:
      "Spot a drop in sign-ups? Turn it into a tracked issue and assign it in one click.",
  },
  {
    id: "integrations",
    title: "Connect Slack or GitHub",
    detail:
      "Send alerts to a channel and link pull requests to issues automatically.",
  },
] as const;
```

```ts lib/validation.ts
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
```

```tsx lib/onboarding.tsx
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
```

```tsx components/SummaryCard.tsx
"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TEAM_SIZES, THEME_OPTIONS } from "@/lib/data";
import type { OnboardingState } from "@/lib/validation";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="dt">
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="dd"
        sx={{ m: 0, overflowWrap: "anywhere" }}
      >
        {children}
      </Typography>
    </Box>
  );
}

const NOT_SET = (
  <Typography
    component="span"
    variant="body2"
    color="text.secondary"
    sx={{ fontStyle: "italic" }}
  >
    Not set yet
  </Typography>
);

export default function SummaryCard({ state }: { state: OnboardingState }) {
  const teamSize = TEAM_SIZES.find((t) => t.value === state.teamSize);
  const themeLabel = THEME_OPTIONS.find((t) => t.value === state.theme)?.label;
  const invites = state.invites.map((i) => i.trim()).filter(Boolean);

  return (
    <Card
      variant="outlined"
      component="aside"
      aria-labelledby="summary-heading"
      sx={{ position: { md: "sticky" }, top: { md: 24 } }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography
          id="summary-heading"
          variant="overline"
          color="text.secondary"
          component="h2"
        >
          Your setup so far
        </Typography>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center", my: 2 }}>
          <Avatar
            aria-hidden
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            {initials(state.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
            >
              {state.name.trim() || "Your name"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: "anywhere" }}
            >
              {state.email.trim() || "you@company.com"}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack component="dl" spacing={1.75} sx={{ m: 0 }}>
          <Row label="Workspace">{state.workspaceName.trim() || NOT_SET}</Row>
          <Row label="Team size">{teamSize ? teamSize.label : NOT_SET}</Row>
          <Row label="Invites">
            {invites.length > 0 ? (
              <Stack
                direction="row"
                useFlexGap
                sx={{ flexWrap: "wrap", gap: 0.75, mt: 0.5 }}
              >
                {invites.map((email) => (
                  <Chip key={email} size="small" label={email} />
                ))}
              </Stack>
            ) : (
              NOT_SET
            )}
          </Row>
          <Row label="Theme">{themeLabel}</Row>
          <Row label="Weekly digest">
            {state.weeklyDigest ? "On, every Monday" : "Off"}
          </Row>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

```tsx components/OnboardingWizard.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useColorScheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import {
  MAX_INVITES,
  PRODUCT,
  STEPS,
  TEAM_SIZES,
  THEME_OPTIONS,
  USER,
  type ThemeChoice,
} from "@/lib/data";
import { useOnboarding } from "@/lib/onboarding";
import { validateStep, type Errors } from "@/lib/validation";
import SummaryCard from "./SummaryCard";

const LAST_STEP = STEPS.length - 1;

export default function OnboardingWizard() {
  const router = useRouter();
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("sm"));
  const { setMode } = useColorScheme();
  const { state, update, setInvite } = useOnboarding();

  const [activeStep, setActiveStep] = React.useState(0);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const firstRender = React.useRef(true);

  // Move focus to the step heading after navigating, so keyboard and
  // screen-reader users land at the start of the new step.
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [activeStep]);

  const focusFirstError = (errs: Errors) => {
    const firstKey = Object.keys(errs).find((k) => errs[k]);
    if (!firstKey) return;
    window.requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstKey}"]`,
      );
      el?.focus();
    });
  };

  const clearError = (key: string) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const goNext = () => {
    const errs = validateStep(activeStep, state);
    const hasErrors = Object.values(errs).some(Boolean);
    if (hasErrors) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setErrors({});
    if (activeStep === LAST_STEP) {
      setSubmitting(true);
      router.push("/welcome");
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setActiveStep((s) => Math.max(0, s - 1));
  };

  const skipInvites = () => {
    for (let i = 0; i < MAX_INVITES; i += 1) setInvite(i, "");
    setErrors({});
    setActiveStep((s) => s + 1);
  };

  const useMyDetails = () => {
    update({ name: USER.name, email: USER.email });
    setErrors({});
  };

  const onThemeChange = (_: React.MouseEvent<HTMLElement>, value: ThemeChoice | null) => {
    if (!value) return;
    update({ theme: value });
    setMode(value);
  };

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", bgcolor: "background.default", py: { xs: 3, md: 6 } }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: { xs: 2.5, md: 4 } }}
        >
          <Box
            aria-hidden
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <AutoGraphIcon />
          </Box>
          <Box>
            <Typography variant="h6" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {PRODUCT.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {PRODUCT.tagline}
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel={!isNarrow}
                  aria-label="Onboarding progress"
                  sx={{ mb: { xs: 3, sm: 4 } }}
                >
                  {STEPS.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        error={false}
                        slotProps={{
                          label: {
                            sx: isNarrow && index !== activeStep
                              ? { display: "none" }
                              : undefined,
                          },
                        }}
                        aria-current={index === activeStep ? "step" : undefined}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Typography variant="caption" color="text.secondary" aria-live="polite">
                  Step {activeStep + 1} of {STEPS.length}
                </Typography>
                <Typography
                  ref={headingRef}
                  tabIndex={-1}
                  variant="h5"
                  component="h1"
                  sx={{ fontWeight: 700, mt: 0.5, outline: "none" }}
                >
                  {activeStep === 0 && "Create your account"}
                  {activeStep === 1 && "Set up your workspace"}
                  {activeStep === 2 && "Invite your teammates"}
                  {activeStep === 3 && "Choose your preferences"}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                  {STEPS[activeStep].description}.
                </Typography>

                <Box
                  component="form"
                  ref={formRef}
                  noValidate
                  onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    goNext();
                  }}
                >
                  {activeStep === 0 && (
                    <Stack spacing={2.5}>
                      <Alert
                        severity="info"
                        action={
                          <Button color="inherit" size="small" onClick={useMyDetails}>
                            Use my details
                          </Button>
                        }
                      >
                        Signed in as {USER.role.toLowerCase()} {USER.name}?
                      </Alert>
                      <TextField
                        id="name"
                        label="Full name"
                        placeholder={USER.name}
                        autoComplete="name"
                        required
                        fullWidth
                        value={state.name}
                        onChange={(e) => {
                          update({ name: e.target.value });
                          clearError("name");
                        }}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        slotProps={{
                          htmlInput: { "data-field": "name" },
                          formHelperText: { id: "name-error" },
                        }}
                      />
                      <TextField
                        id="email"
                        type="email"
                        label="Work email"
                        placeholder={USER.email}
                        autoComplete="email"
                        required
                        fullWidth
                        value={state.email}
                        onChange={(e) => {
                          update({ email: e.target.value });
                          clearError("email");
                        }}
                        error={Boolean(errors.email)}
                        helperText={errors.email ?? "We'll send your workspace receipts here."}
                        slotProps={{
                          htmlInput: { "data-field": "email" },
                          formHelperText: { id: "email-error" },
                        }}
                      />
                    </Stack>
                  )}

                  {activeStep === 1 && (
                    <Stack spacing={2.5}>
                      <TextField
                        id="workspaceName"
                        label="Workspace name"
                        placeholder="Acme Labs"
                        autoComplete="organization"
                        required
                        fullWidth
                        value={state.workspaceName}
                        onChange={(e) => {
                          update({ workspaceName: e.target.value });
                          clearError("workspaceName");
                        }}
                        error={Boolean(errors.workspaceName)}
                        helperText={
                          errors.workspaceName ?? "Usually your company or team name."
                        }
                        slotProps={{
                          htmlInput: { "data-field": "workspaceName" },
                          formHelperText: { id: "workspaceName-error" },
                        }}
                      />
                      <TextField
                        id="teamSize"
                        select
                        label="Team size"
                        required
                        fullWidth
                        value={state.teamSize}
                        onChange={(e) => {
                          update({ teamSize: e.target.value });
                          clearError("teamSize");
                        }}
                        error={Boolean(errors.teamSize)}
                        helperText={errors.teamSize ?? "Helps us suggest sensible defaults."}
                        slotProps={{
                          select: {
                            SelectDisplayProps: {
                              // @ts-expect-error data attributes are valid on the select div
                              "data-field": "teamSize",
                            },
                          },
                          formHelperText: { id: "teamSize-error" },
                        }}
                      >
                        {TEAM_SIZES.map((size) => (
                          <MenuItem key={size.value} value={size.value}>
                            {size.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  )}

                  {activeStep === 2 && (
                    <Stack spacing={2.5}>
                      <Typography variant="body2" color="text.secondary">
                        Add up to {MAX_INVITES} teammates. They&apos;ll get an email
                        invitation. You can skip this and invite people later.
                      </Typography>
                      {Array.from({ length: MAX_INVITES }, (_, i) => {
                        const key = `invite-${i}`;
                        return (
                          <TextField
                            key={key}
                            id={key}
                            type="email"
                            label={`Teammate ${i + 1} email`}
                            placeholder={
                              ["sam@acmelabs.io", "priya@acmelabs.io", "tomas@acmelabs.io"][i]
                            }
                            autoComplete="off"
                            fullWidth
                            value={state.invites[i] ?? ""}
                            onChange={(e) => {
                              setInvite(i, e.target.value);
                              clearError(key);
                            }}
                            error={Boolean(errors[key])}
                            helperText={errors[key]}
                            slotProps={{
                              htmlInput: { "data-field": key },
                              formHelperText: { id: `${key}-error` },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  )}

                  {activeStep === 3 && (
                    <Stack spacing={3}>
                      <FormControl>
                        <FormLabel id="theme-label" sx={{ mb: 1 }}>
                          Theme
                        </FormLabel>
                        <ToggleButtonGroup
                          exclusive
                          fullWidth
                          color="primary"
                          value={state.theme}
                          onChange={onThemeChange}
                          aria-labelledby="theme-label"
                        >
                          {THEME_OPTIONS.map((opt) => (
                            <ToggleButton
                              key={opt.value}
                              value={opt.value}
                              sx={{ flexDirection: "column", py: 1.5, textTransform: "none" }}
                            >
                              <Typography component="span" sx={{ fontWeight: 600 }}>
                                {opt.label}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: { xs: "none", sm: "block" } }}
                              >
                                {opt.hint}
                              </Typography>
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                        <FormHelperText>
                          Applies right away. Change it any time in settings.
                        </FormHelperText>
                      </FormControl>

                      <FormControl>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={state.weeklyDigest}
                              onChange={(e) => update({ weeklyDigest: e.target.checked })}
                              slotProps={{ input: { "aria-describedby": "digest-help" } }}
                            />
                          }
                          label="Send me the weekly digest"
                        />
                        <FormHelperText id="digest-help" sx={{ ml: 0 }}>
                          A Monday summary of new issues, top events and
                          what changed in your funnels.
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                  )}

                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    spacing={1.5}
                    sx={{ mt: 4, justifyContent: "space-between" }}
                  >
                    <Button
                      type="button"
                      onClick={goBack}
                      disabled={activeStep === 0 || submitting}
                      color="inherit"
                    >
                      Back
                    </Button>
                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      spacing={1.5}
                    >
                      {activeStep === 2 && (
                        <Button type="button" onClick={skipInvites} color="inherit">
                          Skip for now
                        </Button>
                      )}
                      <Button type="submit" variant="contained" disabled={submitting}>
                        {activeStep === LAST_STEP ? "Finish setup" : "Next"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryCard state={state} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
```

```tsx components/WelcomeContent.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { NEXT_STEPS, TEAM_SIZES, USER } from "@/lib/data";
import { useOnboarding } from "@/lib/onboarding";

export default function WelcomeContent() {
  const { state, hydrated, reset } = useOnboarding();
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  const firstName = (state.name.trim() || USER.name).split(/\s+/)[0];
  const workspace = state.workspaceName.trim();
  const teamSize = TEAM_SIZES.find((t) => t.value === state.teamSize);
  const invited = state.invites.filter((i) => i.trim()).length;

  const completed = NEXT_STEPS.filter((s) => done[s.id]).length;
  const progress = (completed / NEXT_STEPS.length) * 100;

  const toggle = (id: string) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", bgcolor: "background.default", py: { xs: 4, md: 8 } }}
    >
      <Container maxWidth="sm">
        <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center", mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 56 }} aria-hidden />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {hydrated ? `You're all set, ${firstName}!` : "You're all set!"}
          </Typography>
          <Typography color="text.secondary">
            {hydrated && workspace ? (
              <>
                <strong>{workspace}</strong> is ready
                {teamSize ? ` for a team of ${teamSize.label.toLowerCase()}` : ""}
                {invited > 0
                  ? `, and ${invited} invitation${invited === 1 ? " is" : "s are"} on the way`
                  : ""}
                .
              </>
            ) : (
              "Your Lumen workspace is ready."
            )}{" "}
            Here&apos;s how to get the most out of your first week.
          </Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "baseline", px: 1 }}
            >
              <Typography variant="h6" component="h2" id="checklist-heading">
                Next steps
              </Typography>
              <Typography variant="body2" color="text.secondary" aria-live="polite">
                {completed} of {NEXT_STEPS.length} done
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              aria-label="Checklist progress"
              sx={{ mx: 1, my: 1.5, borderRadius: 1 }}
            />
            <List aria-labelledby="checklist-heading" disablePadding>
              {NEXT_STEPS.map((step) => {
                const labelId = `step-${step.id}`;
                return (
                  <ListItem key={step.id} disablePadding>
                    <ListItemButton
                      role={undefined}
                      onClick={() => toggle(step.id)}
                      sx={{ borderRadius: 1, alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}>
                        <Checkbox
                          edge="start"
                          checked={Boolean(done[step.id])}
                          tabIndex={-1}
                          disableRipple
                          slotProps={{ input: { "aria-labelledby": labelId } }}
                          sx={{ p: 0.5 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        id={labelId}
                        primary={step.title}
                        secondary={step.detail}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: 600,
                              textDecoration: done[step.id] ? "line-through" : "none",
                              color: done[step.id] ? "text.secondary" : "text.primary",
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3, justifyContent: "center" }}
        >
          <Button
            component={Link}
            href="/"
            variant="text"
            color="inherit"
            onClick={reset}
          >
            Start over
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import WelcomeContent from "@/components/WelcomeContent";
import { OnboardingProvider } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Welcome to Lumen",
  description: "Your Lumen workspace is ready. Here are your next steps.",
};

export default function WelcomePage() {
  return (
    <OnboardingProvider>
      <WelcomeContent />
    </OnboardingProvider>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import OnboardingWizard from "@/components/OnboardingWizard";
import { OnboardingProvider } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Get started with Lumen",
  description:
    "Set up your Lumen account, workspace, team and preferences in four short steps.",
};

export default function Page() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
```