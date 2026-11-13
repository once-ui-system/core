"use client"

import {
  Box,
  Button,
  ClientOnly,
  Card,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { PageIntro } from "@/components/page-intro"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

function AppearanceSwitch() {
  const { colorMode, setColorMode } = useColorMode()
  return (
    <Switch
      size="lg"
      checked={colorMode === "dark"}
      onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
    >
      Dark mode
    </Switch>
  )
}

export function SettingsView() {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [notify, setNotify] = React.useState({
    assigned: true,
    weekly: true,
    mentions: false,
  })

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nameValid = name.trim().length > 0

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailValid || !nameValid) return
    toaster.create({
      title: "Settings saved",
      description: "Your changes are live. Thanks for keeping things tidy.",
      type: "success",
    })
  }

  return (
    <Box maxW="3xl">
      <PageIntro
        title="Settings"
        description="Tune your profile and how Lumen keeps you in the loop."
      />
      <form onSubmit={save} noValidate>
        <Stack gap="8">
          <Card.Root variant="outline">
            <Card.Body gap="6">
              <Heading as="h2" size="xl">
                Profile
              </Heading>
              <Field label="Full name" invalid={!nameValid} errorText="Please enter your name.">
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field
                label="Email"
                invalid={!emailValid}
                errorText="Enter an email like name@company.com."
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Role" helperText="Only the workspace owner can change roles.">
                <Input value={user.role} readOnly />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Body gap="6">
              <Box>
                <Heading as="h2" size="xl">
                  Notifications
                </Heading>
                <Text color="fg.muted" mt="1">
                  Choose what lands in your inbox.
                </Text>
              </Box>
              <Switch
                size="lg"
                checked={notify.assigned}
                onCheckedChange={(e) => setNotify((n) => ({ ...n, assigned: e.checked }))}
              >
                Issues assigned to me
              </Switch>
              <Switch
                size="lg"
                checked={notify.weekly}
                onCheckedChange={(e) => setNotify((n) => ({ ...n, weekly: e.checked }))}
              >
                Weekly summary every Monday
              </Switch>
              <Switch
                size="lg"
                checked={notify.mentions}
                onCheckedChange={(e) => setNotify((n) => ({ ...n, mentions: e.checked }))}
              >
                Mentions in comments
              </Switch>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Body gap="6">
              <Heading as="h2" size="xl">
                Appearance
              </Heading>
              <ClientOnly fallback={<Skeleton h="8" w="40" />}>
                <AppearanceSwitch />
              </ClientOnly>
            </Card.Body>
          </Card.Root>

          <Box>
            <Button type="submit" size="lg" colorPalette="brand">
              Save changes
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  )
}
