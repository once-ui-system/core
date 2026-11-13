"use client"

import { PageHeader } from "@/components/page-header"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"
import { Badge, Button, Card, Flex, Grid, Heading, Input, chakra } from "@chakra-ui/react"
import { useState } from "react"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SettingsView() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [defaultView, setDefaultView] = useState("overview")
  const [assigned, setAssigned] = useState(true)
  const [weekly, setWeekly] = useState(true)
  const [product, setProduct] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const nameError = name.trim() === "" ? "Enter your name." : ""
  const emailError = emailPattern.test(email.trim()) ? "" : "Enter a valid email address."

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (nameError || emailError) return
    toaster.create({
      type: "success",
      title: "Settings saved",
      description: "Your profile and notification preferences were updated.",
    })
  }

  function handleReset() {
    setName(user.name)
    setEmail(user.email)
    setDefaultView("overview")
    setAssigned(true)
    setWeekly(true)
    setProduct(false)
    setSubmitted(false)
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications and how Lumen looks."
      />

      <chakra.form onSubmit={handleSubmit} noValidate display="flex" flexDirection="column" gap="3" maxW="3xl">
        <Card.Root as="section" aria-labelledby="profile-heading">
          <Card.Header>
            <Heading as="h2" size="md" id="profile-heading">
              Profile
            </Heading>
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }} gap="3">
              <Field
                label="Full name"
                required
                invalid={submitted && nameError !== ""}
                errorText={nameError}
              >
                <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
              </Field>
              <Field
                label="Email"
                required
                invalid={submitted && emailError !== ""}
                errorText={emailError}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Role" helperText="Only another owner can change this.">
                <Flex align="center" h="8">
                  <Badge colorPalette="brand" variant="subtle">
                    {user.role}
                  </Badge>
                </Flex>
              </Field>
              <Field label="Start page">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={defaultView}
                    onChange={(event) => setDefaultView(event.currentTarget.value)}
                    items={[
                      { value: "overview", label: "Overview" },
                      { value: "projects", label: "Projects" },
                      { value: "reports", label: "Reports" },
                    ]}
                  />
                </NativeSelectRoot>
              </Field>
            </Grid>
          </Card.Body>
        </Card.Root>

        <Card.Root as="section" aria-labelledby="notifications-heading">
          <Card.Header>
            <Heading as="h2" size="md" id="notifications-heading">
              Notifications
            </Heading>
          </Card.Header>
          <Card.Body>
            <Flex direction="column" gap="3">
              <Switch
                colorPalette="brand"
                checked={assigned}
                onCheckedChange={(event) => setAssigned(event.checked)}
              >
                Email me when an issue is assigned to me
              </Switch>
              <Switch
                colorPalette="brand"
                checked={weekly}
                onCheckedChange={(event) => setWeekly(event.checked)}
              >
                Send a weekly summary of project activity
              </Switch>
              <Switch
                colorPalette="brand"
                checked={product}
                onCheckedChange={(event) => setProduct(event.checked)}
              >
                Send product updates and release notes
              </Switch>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root as="section" aria-labelledby="appearance-heading">
          <Card.Header>
            <Heading as="h2" size="md" id="appearance-heading">
              Appearance
            </Heading>
          </Card.Header>
          <Card.Body>
            <Field label="Color mode" maxW={{ md: "xs" }}>
              <NativeSelectRoot>
                <NativeSelectField
                  value={colorMode === "dark" ? "dark" : "light"}
                  onChange={(event) =>
                    setColorMode(event.currentTarget.value === "dark" ? "dark" : "light")
                  }
                  items={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              </NativeSelectRoot>
            </Field>
          </Card.Body>
        </Card.Root>

        <Flex gap="2" justify={{ base: "stretch", sm: "flex-end" }}>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" colorPalette="brand">
            Save changes
          </Button>
        </Flex>
      </chakra.form>
    </>
  )
}
