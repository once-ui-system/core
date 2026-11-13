"use client";

import { Button, Card, Heading, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useColorMode } from "@/components/ui/color-mode";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toaster.create({
      title: "Settings saved",
      description: `Profile for ${name} was updated.`,
      type: "success",
    });
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, notifications and appearance."
      />

      <Stack gap="4" maxW="3xl">
        <form onSubmit={onSubmit}>
          <Stack gap="4">
            <Card.Root variant="outline" bg="bg.panel">
              <Card.Header>
                <Heading as="h2" size="md">
                  Profile
                </Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap="4">
                  <Field label="Full name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field label="Role" helperText="Roles are managed by the workspace owner.">
                    <Input value={user.role} readOnly />
                  </Field>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="outline" bg="bg.panel">
              <Card.Header>
                <Heading as="h2" size="md">
                  Notifications
                </Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap="4">
                  <Switch checked={digest} onCheckedChange={(e) => setDigest(e.checked)}>
                    Weekly digest of open issues
                  </Switch>
                  <Switch checked={mentions} onCheckedChange={(e) => setMentions(e.checked)}>
                    Email me when I am mentioned
                  </Switch>
                </Stack>
              </Card.Body>
            </Card.Root>

            <Button type="submit" colorPalette="brand" alignSelf="flex-start">
              Save changes
            </Button>
          </Stack>
        </form>

        <Card.Root variant="outline" bg="bg.panel">
          <Card.Header>
            <Heading as="h2" size="md">
              Appearance
            </Heading>
          </Card.Header>
          <Card.Body>
            <Switch
              checked={colorMode === "dark"}
              onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
            >
              Dark mode
            </Switch>
          </Card.Body>
        </Card.Root>
      </Stack>
    </>
  );
}
