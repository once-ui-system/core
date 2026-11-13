"use client"

import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Grid,
  Heading,
  Input,
  NativeSelect,
  RadioCard,
  Span,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { LuArrowLeft, LuArrowRight, LuCheck } from "react-icons/lu"
import { useColorMode } from "@/components/ui/color-mode"
import {
  initialData,
  MAX_INVITES,
  product,
  STORAGE_KEY,
  steps,
  teamSizes,
  themeOptions,
  type OnboardingData,
  type ThemeChoice,
} from "@/lib/data"
import { validateStep, type Errors } from "@/lib/validation"
import { StepIndicator } from "./step-indicator"
import { SummaryCard } from "./summary-card"

const invitePlaceholders = [
  "jon@acmelabs.io",
  "priya@acmelabs.io",
  "tomas@acmelabs.io",
]

export function OnboardingWizard() {
  const router = useRouter()
  const { setColorMode } = useColorMode()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [errors, setErrors] = useState<Errors>({})
  const [finishing, setFinishing] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const didMount = useRef(false)

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  // Move focus to the step heading after navigating (not on first render).
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    headingRef.current?.focus()
  }, [stepIndex])

  const update = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key as string]
        return next
      })
    },
    [],
  )

  const updateInvite = (index: number, value: string) => {
    setData((prev) => {
      const invites = [...prev.invites]
      invites[index] = value
      return { ...prev, invites }
    })
    setErrors((prev) => {
      const k = `invite-${index}`
      if (!(k in prev)) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  const focusFirstError = (errs: Errors) => {
    const firstKey = Object.keys(errs)[0]
    if (!firstKey) return
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstKey}"]`,
      )
      el?.focus()
    })
  }

  const handleNext = () => {
    const errs = validateStep(step.id, data)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs)
      return
    }
    if (isLast) {
      finish()
      return
    }
    setStepIndex((i) => i + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStepIndex((i) => Math.max(0, i - 1))
  }

  const handleSkip = () => {
    setErrors({})
    setData((prev) => ({ ...prev, invites: ["", "", ""] }))
    setStepIndex((i) => i + 1)
  }

  const handleTheme = (value: string | null) => {
    if (value !== "light" && value !== "dark" && value !== "system") return
    const choice: ThemeChoice = value
    update("theme", choice)
    if (choice === "system") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setColorMode(dark ? "dark" : "light")
    } else {
      setColorMode(choice)
    }
  }

  const finish = () => {
    setFinishing(true)
    try {
      const payload = {
        ...data,
        invites: data.invites
          .map((e) => e.trim())
          .filter((e) => e !== "")
          .slice(0, MAX_INVITES),
      }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Storage may be unavailable; /welcome falls back to sample content.
    }
    router.push("/welcome")
  }

  const invalid = (key: string) => key in errors

  return (
    <Box as="main" minH="100vh" bg="bg.subtle">
      <Box
        maxW="6xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "6", md: "12" }}
      >
        <Stack gap="2" mb={{ base: "6", md: "8" }}>
          <Text
            textStyle="sm"
            fontWeight="semibold"
            color="blue.fg"
            letterSpacing="wide"
          >
            {product.name}
          </Text>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
            Welcome to Lumen
          </Heading>
          <Text color="fg.muted" maxW="2xl">
            {product.tagline} Four quick steps and your team is ready to go.
          </Text>
        </Stack>

        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 1.6fr) minmax(0, 1fr)",
          }}
          gap={{ base: "6", lg: "8" }}
          alignItems="start"
        >
          <Card.Root variant="elevated">
            <Card.Body gap="6">
              <StepIndicator current={stepIndex} />

              <Box>
                <Heading
                  as="h2"
                  size="lg"
                  tabIndex={-1}
                  ref={headingRef}
                  outline="none"
                >
                  {step.title}
                </Heading>
                <Text color="fg.muted" mt="1">
                  {step.description}
                </Text>
              </Box>

              <form
                ref={formRef}
                noValidate
                aria-label={step.title}
                onSubmit={(e) => {
                  e.preventDefault()
                  handleNext()
                }}
              >
                <Stack gap="5">
                  {step.id === "account" && (
                    <>
                      <Field.Root invalid={invalid("name")} required>
                        <Field.Label>
                          Full name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          data-field="name"
                          name="name"
                          autoComplete="name"
                          placeholder="Maya Okafor"
                          value={data.name}
                          onChange={(e) => update("name", e.target.value)}
                        />
                        <Field.ErrorText>{errors.name}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={invalid("email")} required>
                        <Field.Label>
                          Work email <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          data-field="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="maya@acmelabs.io"
                          value={data.email}
                          onChange={(e) => update("email", e.target.value)}
                        />
                        <Field.HelperText>
                          We will send your sign-in link here.
                        </Field.HelperText>
                        <Field.ErrorText>{errors.email}</Field.ErrorText>
                      </Field.Root>
                    </>
                  )}

                  {step.id === "workspace" && (
                    <>
                      <Field.Root invalid={invalid("workspace")} required>
                        <Field.Label>
                          Workspace name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          data-field="workspace"
                          name="workspace"
                          autoComplete="organization"
                          placeholder="Acme Labs"
                          value={data.workspace}
                          onChange={(e) => update("workspace", e.target.value)}
                        />
                        <Field.HelperText>
                          Usually your company or team name.
                        </Field.HelperText>
                        <Field.ErrorText>{errors.workspace}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={invalid("teamSize")} required>
                        <Field.Label>
                          Team size <Field.RequiredIndicator />
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            data-field="teamSize"
                            name="teamSize"
                            value={data.teamSize}
                            onChange={(e) => update("teamSize", e.target.value)}
                          >
                            <option value="">Select team size</option>
                            {teamSizes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <Field.ErrorText>{errors.teamSize}</Field.ErrorText>
                      </Field.Root>
                    </>
                  )}

                  {step.id === "invite" && (
                    <>
                      {Array.from({ length: MAX_INVITES }, (_, i) => (
                        <Field.Root key={i} invalid={invalid(`invite-${i}`)}>
                          <Field.Label>Teammate {i + 1} email</Field.Label>
                          <Input
                            data-field={`invite-${i}`}
                            name={`invite-${i}`}
                            type="email"
                            autoComplete="off"
                            placeholder={invitePlaceholders[i]}
                            value={data.invites[i] ?? ""}
                            onChange={(e) => updateInvite(i, e.target.value)}
                          />
                          <Field.ErrorText>
                            {errors[`invite-${i}`]}
                          </Field.ErrorText>
                        </Field.Root>
                      ))}
                      <Text textStyle="sm" color="fg.muted">
                        Leave these blank to skip. Teammates join as Members;
                        you stay the Owner.
                      </Text>
                    </>
                  )}

                  {step.id === "preferences" && (
                    <>
                      <RadioCard.Root
                        value={data.theme}
                        onValueChange={(e) => handleTheme(e.value)}
                        colorPalette="blue"
                      >
                        <RadioCard.Label>Theme</RadioCard.Label>
                        <Grid
                          templateColumns={{
                            base: "minmax(0, 1fr)",
                            sm: "repeat(3, minmax(0, 1fr))",
                          }}
                          gap="3"
                        >
                          {themeOptions.map((opt) => (
                            <RadioCard.Item key={opt.value} value={opt.value}>
                              <RadioCard.ItemHiddenInput />
                              <RadioCard.ItemControl>
                                <RadioCard.ItemContent>
                                  <RadioCard.ItemText>
                                    {opt.label}
                                  </RadioCard.ItemText>
                                  <RadioCard.ItemDescription>
                                    {opt.description}
                                  </RadioCard.ItemDescription>
                                </RadioCard.ItemContent>
                                <RadioCard.ItemIndicator />
                              </RadioCard.ItemControl>
                            </RadioCard.Item>
                          ))}
                        </Grid>
                      </RadioCard.Root>

                      <Switch.Root
                        checked={data.weeklyDigest}
                        onCheckedChange={(e) =>
                          update("weeklyDigest", e.checked)
                        }
                        colorPalette="blue"
                      >
                        <Switch.HiddenInput name="weeklyDigest" />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Switch.Label>
                          Weekly digest email
                          <Span
                            display="block"
                            textStyle="sm"
                            color="fg.muted"
                            fontWeight="normal"
                          >
                            A Monday summary of new issues, closed work and key
                            metrics.
                          </Span>
                        </Switch.Label>
                      </Switch.Root>
                    </>
                  )}

                  <Flex
                    mt="2"
                    gap="3"
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isFirst || finishing}
                    >
                      <LuArrowLeft aria-hidden="true" />
                      Back
                    </Button>
                    <Flex gap="3" wrap="wrap" justify="flex-end">
                      {step.id === "invite" && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSkip}
                        >
                          Skip for now
                        </Button>
                      )}
                      <Button
                        type="submit"
                        colorPalette="blue"
                        loading={finishing}
                        loadingText="Finishing..."
                      >
                        {isLast ? "Finish setup" : "Next"}
                        {isLast ? (
                          <LuCheck aria-hidden="true" />
                        ) : (
                          <LuArrowRight aria-hidden="true" />
                        )}
                      </Button>
                    </Flex>
                  </Flex>
                </Stack>
              </form>
            </Card.Body>
          </Card.Root>

          <SummaryCard data={data} />
        </Grid>
      </Box>
    </Box>
  )
}
