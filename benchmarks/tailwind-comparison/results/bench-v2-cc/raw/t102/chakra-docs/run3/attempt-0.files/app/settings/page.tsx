"use client"

import {
  Box,
  Button,
  Card,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = useState(user.name)
  const [weekly, setWeekly] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [releases, setReleases] = useState(false)

  const invalid = name.trim().length === 0

  return (
    <Stack gap="8" maxW="3xl">
      <Stack gap="3">
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
          Settings
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Make Lumen feel like home for you and your team.
        </Text>
      </Stack>

      <Card.Root as="section" aria-labelledby="profile-title" size="lg">
        <Card.Header>
          <Heading as="h2" id="profile-title" size="xl">
            Profile
          </Heading>
        </Card.Header>
        <Card.Body>
          <Box
            as="form"
            id="profile-form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault()
              if (invalid) return
              toaster.create({
                title: "Profile saved",
                description: `Thanks, ${name.trim().split(" ")[0]}. Your changes are live.`,
                type: "success",
              })
            }}
          >
            <Stack gap="6">
              <Field
                label="Full name"
                required
                invalid={invalid}
                errorText="Please enter your name"
              >
                <Input
                  size="lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email" helperText="Your sign-in email can only be changed by support.">
                <Input size="lg" value={user.email} readOnly autoComplete="email" />
              </Field>
              <Field label="Role">
                <Input size="lg" value={user.role} readOnly />
              </Field>
            </Stack>
          </Box>
        </Card.Body>
        <Card.Footer>
          <Button type="submit" form="profile-form" size="lg">
            Save profile
          </Button>
        </Card.Footer>
      </Card.Root>

      <Card.Root as="section" aria-labelledby="notify-title" size="lg">
        <Card.Header>
          <Heading as="h2" id="notify-title" size="xl">
            Notifications
          </Heading>
          <Text color="fg.muted">Choose what lands in your inbox.</Text>
        </Card.Header>
        <Card.Body>
          <Stack gap="6">
            <Switch size="lg" checked={weekly} onCheckedChange={(e) => setWeekly(e.checked)}>
              Weekly summary of project activity
            </Switch>
            <Switch size="lg" checked={mentions} onCheckedChange={(e) => setMentions(e.checked)}>
              Someone mentions me on an issue
            </Switch>
            <Switch size="lg" checked={releases} onCheckedChange={(e) => setReleases(e.checked)}>
              Product news and new features
            </Switch>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root as="section" aria-labelledby="appearance-title" size="lg">
        <Card.Header>
          <Heading as="h2" id="appearance-title" size="xl">
            Appearance
          </Heading>
        </Card.Header>
        <Card.Body>
          <Switch
            size="lg"
            checked={colorMode === "dark"}
            onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
          >
            Dark mode
          </Switch>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
