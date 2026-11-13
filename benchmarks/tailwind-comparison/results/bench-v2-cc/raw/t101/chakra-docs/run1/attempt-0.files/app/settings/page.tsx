"use client"

import { useState } from "react"
import { Button, Card, Heading, Input, Stack } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { PageHeader } from "@/components/page-header"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile and notification preferences."
      />

      <Stack
        as="form"
        gap="4"
        maxW="xl"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault()
          toaster.create({
            title: "Settings saved",
            description: "Your changes have been applied.",
            type: "success",
          })
        }}
      >
        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md" fontWeight="semibold">
              Profile
            </Heading>
          </Card.Header>
          <Card.Body gap="3">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Email" helperText={`Role: ${user.role}`}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md" fontWeight="semibold">
              Notifications
            </Heading>
          </Card.Header>
          <Card.Body gap="3">
            <Switch colorPalette="brand" defaultChecked>
              Weekly digest by email
            </Switch>
            <Switch colorPalette="brand" defaultChecked>
              Notify me when an issue is assigned to me
            </Switch>
            <Switch colorPalette="brand">Product updates and tips</Switch>
          </Card.Body>
        </Card.Root>

        <Button type="submit" colorPalette="brand" alignSelf="flex-start">
          Save changes
        </Button>
      </Stack>
    </>
  )
}
