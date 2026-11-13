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
