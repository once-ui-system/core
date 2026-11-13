"use client";

import { useState } from "react";
import { Button, Card, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const nameInvalid = name.trim().length === 0;
  const emailInvalid = !/^\S+@\S+\.\S+$/.test(email);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nameInvalid || emailInvalid) return;
    toaster.create({
      title: "Settings saved",
      description: "Your profile and notification preferences are up to date.",
      type: "success",
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="6" maxW="2xl">
        <Card.Root variant="outline">
          <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>How you appear to your teammates.</Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Field
                label="Full name"
                required
                invalid={nameInvalid}
                errorText="Name is required."
              >
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field
                label="Email"
                required
                invalid={emailInvalid}
                errorText="Enter a valid email address."
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Text fontSize="sm" color="fg.muted">
                Role: {user.role}
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
            <Card.Description>Choose what lands in your inbox.</Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Switch checked={weeklyDigest} onCheckedChange={(e) => setWeeklyDigest(e.checked)}>
                Weekly analytics digest
              </Switch>
              <Switch checked={issueAlerts} onCheckedChange={(e) => setIssueAlerts(e.checked)}>
                Alerts when an issue is assigned to me
              </Switch>
              <Switch checked={productNews} onCheckedChange={(e) => setProductNews(e.checked)}>
                Product news and release notes
              </Switch>
            </Stack>
          </Card.Body>
        </Card.Root>

        <HStack justify="flex-end">
          <Button type="submit">Save changes</Button>
        </HStack>
      </Stack>
    </form>
  );
}
