"use client"

import {
  Button,
  Card,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const [name, setName] = useState(user.name)
  const [weekly, setWeekly] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [releases, setReleases] = useState(false)

  const nameInvalid = name.trim().length === 0

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (nameInvalid) return
    toaster.create({
      title: "Settings saved",
      description: "Your changes are live for the whole team.",
      type: "success",
    })
  }

  return (
    <Stack gap="10" as="form" onSubmit={save} maxW="3xl">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Settings
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Your profile and how Lumen keeps you in the loop.
        </Text>
      </Stack>

      <Card.Root size="lg">
        <Card.Header>
          <Heading as="h2" size="xl">
            Profile
          </Heading>
        </Card.Header>
        <Card.Body gap="6">
          <Field
            label="Full name"
            invalid={nameInvalid}
            errorText="Please enter your name."
            required
          >
            <Input
              size="lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Email" helperText="Contact your workspace owner to change this.">
            <Input size="lg" type="email" value={user.email} readOnly />
          </Field>
          <Field label="Role">
            <Input size="lg" value={user.role} readOnly />
          </Field>
        </Card.Body>
      </Card.Root>

      <Card.Root size="lg">
        <Card.Header>
          <Heading as="h2" size="xl">
            Notifications
          </Heading>
        </Card.Header>
        <Card.Body gap="6">
          <Switch
            size="lg"
            checked={weekly}
            onCheckedChange={(e) => setWeekly(e.checked)}
          >
            Weekly summary email
          </Switch>
          <Switch
            size="lg"
            checked={mentions}
            onCheckedChange={(e) => setMentions(e.checked)}
          >
            Tell me when someone mentions me
          </Switch>
          <Switch
            size="lg"
            checked={releases}
            onCheckedChange={(e) => setReleases(e.checked)}
          >
            Product news and releases
          </Switch>
        </Card.Body>
      </Card.Root>

      <Button type="submit" size="xl" alignSelf="flex-start" px="8">
        Save changes
      </Button>
    </Stack>
  )
}
