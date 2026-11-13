"use client"

import {
  Badge,
  Button,
  Card,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [landing, setLanding] = React.useState("overview")
  const [issueEmails, setIssueEmails] = React.useState(true)
  const [weeklyDigest, setWeeklyDigest] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toaster.create({
      title: "Settings saved",
      description: "Your changes are applied to this workspace.",
      type: "success",
    })
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen behaves for you."
      />

      <form onSubmit={handleSubmit}>
        <Stack gap="6" maxW="3xl">
          <Card.Root variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Profile
              </Heading>
            </Card.Header>
            <Card.Body pt="0" gap="4">
              <Field label="Full name">
                <Input
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Email" helperText="Used for sign-in and notifications.">
                <Input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Stack direction="row" align="center" gap="3">
                <Text fontSize="sm" color="fg.muted">
                  Role
                </Text>
                <Badge colorPalette="brand">{user.role}</Badge>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Preferences
              </Heading>
            </Card.Header>
            <Card.Body pt="0" gap="5">
              <Field label="Start page">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={landing}
                    onChange={(e) => setLanding(e.currentTarget.value)}
                    items={[
                      { value: "overview", label: "Overview" },
                      { value: "projects", label: "Projects" },
                      { value: "reports", label: "Reports" },
                    ]}
                  />
                </NativeSelectRoot>
              </Field>
              <Switch
                checked={colorMode === "dark"}
                onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
              >
                Dark theme
              </Switch>
              <Switch
                checked={issueEmails}
                onCheckedChange={(e) => setIssueEmails(e.checked)}
              >
                Email me when an issue is assigned to me
              </Switch>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(e) => setWeeklyDigest(e.checked)}
              >
                Send a weekly activity digest
              </Switch>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Button type="submit">Save changes</Button>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </form>
    </>
  )
}
