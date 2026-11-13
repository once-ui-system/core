"use client"

import { Box, Button, Card, Heading, Input, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [timezone, setTimezone] = useState("Europe/London")
  const [digest, setDigest] = useState(true)
  const [assigned, setAssigned] = useState(true)
  const [mentions, setMentions] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toaster.create({
      title: "Settings saved",
      description: "Your profile and notification preferences are up to date.",
      type: "success",
    })
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Settings
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="4">
        Manage your profile and how Lumen keeps you informed.
      </Text>

      <form onSubmit={onSubmit}>
        <Stack gap="4" maxW="2xl">
          <Card.Root size="sm" variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Profile
              </Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap="3">
                <Field label="Full name">
                  <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </Field>
                <Field label="Email" helperText="Used for sign-in and notifications.">
                  <Input size="sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </Field>
                <Field label="Role" helperText="Only another owner can change roles.">
                  <Input size="sm" value={user.role} readOnly />
                </Field>
                <Field label="Time zone">
                  <NativeSelectRoot size="sm">
                    <NativeSelectField
                      value={timezone}
                      onChange={(e) => setTimezone(e.currentTarget.value)}
                      items={["Europe/London", "Europe/Berlin", "America/New_York", "Asia/Tokyo"]}
                    />
                  </NativeSelectRoot>
                </Field>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root size="sm" variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Notifications
              </Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap="3">
                <Switch size="sm" checked={digest} onCheckedChange={(e) => setDigest(e.checked)}>
                  Weekly digest of project activity
                </Switch>
                <Switch size="sm" checked={assigned} onCheckedChange={(e) => setAssigned(e.checked)}>
                  Email me when an issue is assigned to me
                </Switch>
                <Switch size="sm" checked={mentions} onCheckedChange={(e) => setMentions(e.checked)}>
                  Email me when I am mentioned
                </Switch>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Box>
            <Button type="submit" size="sm">
              Save changes
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  )
}
