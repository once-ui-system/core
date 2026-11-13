"use client"

import { Button, Card, Heading, Input, Stack, Text } from "@chakra-ui/react"
import { type FormEvent, useState } from "react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export function SettingsForm() {
  const [displayName, setDisplayName] = useState(user.name)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [issueAlerts, setIssueAlerts] = useState(true)
  const [productNews, setProductNews] = useState(false)

  const nameInvalid = displayName.trim().length === 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (nameInvalid) return
    toaster.create({
      title: "Settings saved",
      description: "Your preferences have been updated.",
      type: "success",
    })
  }

  return (
    <Card.Root variant="outline" asChild>
      <form onSubmit={handleSubmit} noValidate>
        <Card.Header>
          <Heading as="h2" size="md">
            Preferences
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Choose your display name and notification settings.
          </Text>
        </Card.Header>
        <Card.Body>
          <Stack gap="5">
            <Field
              label="Display name"
              invalid={nameInvalid}
              errorText="Display name is required."
              helperText="Shown to teammates on issues and comments."
              required
            >
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </Field>

            <Stack gap="4" role="group" aria-label="Notifications">
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(e) => setWeeklyDigest(e.checked)}
              >
                Weekly analytics digest
              </Switch>
              <Switch
                checked={issueAlerts}
                onCheckedChange={(e) => setIssueAlerts(e.checked)}
              >
                Alert me when an issue is assigned to me
              </Switch>
              <Switch
                checked={productNews}
                onCheckedChange={(e) => setProductNews(e.checked)}
              >
                Product news and release notes
              </Switch>
            </Stack>
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent="flex-end">
          <Button type="submit" colorPalette="blue">
            Save changes
          </Button>
        </Card.Footer>
      </form>
    </Card.Root>
  )
}
