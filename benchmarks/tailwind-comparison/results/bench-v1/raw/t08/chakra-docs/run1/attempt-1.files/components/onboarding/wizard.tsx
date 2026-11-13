"use client";

import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Fieldset,
  Heading,
  Input,
  NativeSelect,
  RadioCard,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuCheck } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import {
  maxInvites,
  product,
  teamSizeOptions,
  themeOptions,
  wizardSteps,
  type TeamSize,
  type ThemeChoice,
} from "@/lib/data";
import {
  initialValues,
  validateStep,
  type WizardErrors,
  type WizardValues,
} from "@/lib/wizard";
import { StepIndicator } from "./step-indicator";
import { SummaryCard } from "./summary-card";

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardValues>(initialValues);
  const [errors, setErrors] = useState<WizardErrors>({});
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const isLast = step === wizardSteps.length - 1;

  function update<K extends keyof WizardValues>(key: K, value: WizardValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function updateInvite(index: number, value: string) {
    setValues((prev) => {
      const invites = [...prev.invites];
      invites[index] = value;
      return { ...prev, invites };
    });
    setErrors((prev) => {
      if (!Object.keys(prev).some((k) => k.startsWith("invite"))) return prev;
      const next: WizardErrors = {};
      for (const [k, v] of Object.entries(prev))
        if (!k.startsWith("invite")) next[k] = v;
      return next;
    });
  }

  function focusFirstError(errs: WizardErrors) {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      document.getElementById(`field-${first}`)?.focus();
    });
  }

  function goNext() {
    const errs = validateStep(step, values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }
    if (isLast) {
      setFinishing(true);
      router.push("/welcome");
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  function skipInvites() {
    setErrors({});
    setValues((prev) => ({ ...prev, invites: initialValues.invites }));
    setStep((s) => s + 1);
  }

  const stepInfo = wizardSteps[step];

  return (
    <Box maxW="6xl" mx="auto" px={{ base: "4", md: "8" }} py={{ base: "6", md: "12" }}>
      <Stack gap="2" mb={{ base: "6", md: "8" }}>
        <Text textStyle="sm" fontWeight="semibold" color="blue.fg">
          Welcome to {product.name}
        </Text>
        <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
          Let&apos;s set up your workspace
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Four quick steps and your team can start tracking product usage and
          issues in one place.
        </Text>
      </Stack>

      <Box mb={{ base: "6", md: "8" }}>
        <StepIndicator current={step} />
      </Box>

      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={{ base: "6", lg: "8" }}
        align="flex-start"
      >
        <Box
          as="form"
          flex="1"
          w="full"
          minW="0"
          aria-labelledby="step-heading"
          onSubmit={(e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault();
            goNext();
          }}
          {...{ noValidate: true }}
        >
          <Card.Root>
            <Card.Header>
              <Text
                textStyle="xs"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Step {step + 1} of {wizardSteps.length}
              </Text>
              <Heading
                as="h2"
                id="step-heading"
                size="xl"
                ref={headingRef}
                tabIndex={-1}
                outline="none"
              >
                {step === 0 && "Create your account"}
                {step === 1 && "Name your workspace"}
                {step === 2 && "Invite your teammates"}
                {step === 3 && "Choose your preferences"}
              </Heading>
              <Text color="fg.muted" textStyle="sm">
                {stepInfo.description}
                {step === 2 &&
                  ". You can add up to three people now and more later."}
              </Text>
            </Card.Header>

            <Card.Body>
              {step === 0 && (
                <Stack gap="5">
                  <Field.Root required invalid={!!errors.name}>
                    <Field.Label>
                      Full name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="field-name"
                      name="name"
                      autoComplete="name"
                      placeholder="e.g. Maya Okafor"
                      value={values.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                    <Field.ErrorText>{errors.name}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={!!errors.email}>
                    <Field.Label>
                      Work email <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="field-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. maya@acmelabs.io"
                      value={values.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                    <Field.HelperText>
                      We&apos;ll send your sign-in link and billing receipts
                      here.
                    </Field.HelperText>
                    <Field.ErrorText>{errors.email}</Field.ErrorText>
                  </Field.Root>
                </Stack>
              )}

              {step === 1 && (
                <Stack gap="5">
                  <Field.Root required invalid={!!errors.workspace}>
                    <Field.Label>
                      Workspace name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      id="field-workspace"
                      name="workspace"
                      autoComplete="organization"
                      placeholder="e.g. Acme Labs"
                      value={values.workspace}
                      onChange={(e) => update("workspace", e.target.value)}
                    />
                    <Field.HelperText>
                      Usually your company or team name.
                    </Field.HelperText>
                    <Field.ErrorText>{errors.workspace}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root required invalid={!!errors.teamSize}>
                    <Field.Label>
                      Team size <Field.RequiredIndicator />
                    </Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        id="field-teamSize"
                        name="teamSize"
                        value={values.teamSize}
                        onChange={(e) =>
                          update("teamSize", e.target.value as TeamSize | "")
                        }
                      >
                        <option value="">Select team size</option>
                        {teamSizeOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Field.ErrorText>{errors.teamSize}</Field.ErrorText>
                  </Field.Root>
                </Stack>
              )}

              {step === 2 && (
                <Stack gap="5">
                  {Array.from({ length: maxInvites }, (_, i) => (
                    <Field.Root key={i} invalid={!!errors[`invite${i}`]}>
                      <Field.Label>
                        Teammate {i + 1}
                        <Text as="span" color="fg.muted" fontWeight="normal">
                          (optional)
                        </Text>
                      </Field.Label>
                      <Input
                        id={`field-invite${i}`}
                        name={`invite${i}`}
                        type="email"
                        autoComplete="off"
                        placeholder={
                          [
                            "jonas@acmelabs.io",
                            "priya@acmelabs.io",
                            "tomas@acmelabs.io",
                          ][i]
                        }
                        value={values.invites[i] ?? ""}
                        onChange={(e) => updateInvite(i, e.target.value)}
                      />
                      <Field.ErrorText>{errors[`invite${i}`]}</Field.ErrorText>
                    </Field.Root>
                  ))}
                  <Text textStyle="sm" color="fg.muted">
                    Invitees join as Members. You&apos;re the Owner and can
                    change roles at any time.
                  </Text>
                </Stack>
              )}

              {step === 3 && (
                <Stack gap="6">
                  <Fieldset.Root>
                    <RadioCard.Root
                      value={values.theme}
                      onValueChange={(e) =>
                        e.value && update("theme", e.value as ThemeChoice)
                      }
                      orientation="vertical"
                      colorPalette="blue"
                    >
                      <RadioCard.Label>
                        <Text fontWeight="medium">Theme</Text>
                      </RadioCard.Label>
                      <Flex gap="3" direction={{ base: "column", sm: "row" }}>
                        {themeOptions.map((o) => (
                          <RadioCard.Item
                            key={o.value}
                            value={o.value}
                            flex="1"
                          >
                            <RadioCard.ItemHiddenInput />
                            <RadioCard.ItemControl>
                              <RadioCard.ItemContent>
                                <RadioCard.ItemText>
                                  {o.label}
                                </RadioCard.ItemText>
                                <RadioCard.ItemDescription>
                                  {o.description}
                                </RadioCard.ItemDescription>
                              </RadioCard.ItemContent>
                              <RadioCard.ItemIndicator />
                            </RadioCard.ItemControl>
                          </RadioCard.Item>
                        ))}
                      </Flex>
                    </RadioCard.Root>
                  </Fieldset.Root>

                  <Switch
                    colorPalette="blue"
                    checked={values.digest}
                    onCheckedChange={(e) => update("digest", e.checked)}
                  >
                    Send me a weekly digest of activity and open issues
                  </Switch>
                </Stack>
              )}
            </Card.Body>

            <Card.Footer justifyContent="space-between" flexWrap="wrap" gap="3">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0}
              >
                <LuArrowLeft aria-hidden /> Back
              </Button>
              <Flex gap="3" wrap="wrap" justify="flex-end">
                {step === 2 && (
                  <Button type="button" variant="ghost" onClick={skipInvites}>
                    Skip for now
                  </Button>
                )}
                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={finishing}
                  loadingText="Finishing"
                >
                  {isLast ? (
                    <>
                      Finish <LuCheck aria-hidden />
                    </>
                  ) : (
                    <>
                      Next <LuArrowRight aria-hidden />
                    </>
                  )}
                </Button>
              </Flex>
            </Card.Footer>
          </Card.Root>
        </Box>

        <Box w={{ base: "full", lg: "sm" }} flexShrink={0}>
          <SummaryCard values={values} />
        </Box>
      </Flex>
    </Box>
  );
}
