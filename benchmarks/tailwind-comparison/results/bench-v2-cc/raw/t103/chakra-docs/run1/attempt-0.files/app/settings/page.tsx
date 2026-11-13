"use client"

import {
  Button,
  Card,
  ClientOnly,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

const themeItems = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
]

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [assigned, setAssigned] = React.useState(true)
  const [digest, setDigest] = React.useState(true)
  const [weekly, setWeekly] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toaster.create({
      title: "Settings saved",
      description: `Changes for ${name} are applied.`,
      type: "success",
    })
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications and how Lumen looks."
      />

      <form onSubmit={handleSubmit}>
        <Stack gap="6" maxW="2xl">
          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="md">
                Profile
              </Heading>
            </Card.Header>
            <Card.Body gap="4">
              <Field label="Full name">
                <Input
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </Field>
              <Field label="Role" helperText="Your role in this workspace.">
                <Input value={user.role} readOnly />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="md">
                Notifications
              </Heading>
            </Card.Header>
            <Card.Body gap="4">
              <Switch checked={assigned} onCheckedChange={(e) => setAssigned(e.checked)}>
                Email me when an issue is assigned to me
              </Switch>
              <Switch checked={digest} onCheckedChange={(e) => setDigest(e.checked)}>
                Send a daily project activity digest
              </Switch>
              <Switch checked={weekly} onCheckedChange={(e) => setWeekly(e.checked)}>
                Send a weekly throughput report
              </Switch>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="md">
                Appearance
              </Heading>
            </Card.Header>
            <Card.Body gap="3">
              <Text id="theme-label" color="fg.muted" fontSize="sm">
                Color theme
              </Text>
              <ClientOnly fallback={<Skeleton h="9" w="40" />}>
                <SegmentedControl
                  aria-labelledby="theme-label"
                  items={themeItems}
                  value={colorMode === "light" ? "light" : "dark"}
                  onValueChange={(e) => {
                    if (e.value === "dark" || e.value === "light") {
                      setColorMode(e.value)
                    }
                  }}
                />
              </ClientOnly>
            </Card.Body>
          </Card.Root>

          <Button type="submit" alignSelf="flex-start">
            Save changes
          </Button>
        </Stack>
      </form>
    </>
  )
}
