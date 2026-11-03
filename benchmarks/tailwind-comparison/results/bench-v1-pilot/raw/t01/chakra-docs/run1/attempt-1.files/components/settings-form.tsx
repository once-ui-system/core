"use client";

import { useState } from "react";
import { Box, Button, Card, Fieldset, HStack, Input, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const nameInvalid = name.trim().length === 0;
  const emailInvalid = !/^\S+@\S+\.\S+$/.test(email);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nameInvalid || emailInvalid) return;
    toaster.create({
      title: "Settings saved",
      description: "Your profile and notification preferences were updated.",
      type: "success",
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Box display="flex" flexDirection="column" gap="6" maxW="2xl">
        <Card.Root>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>
              Your role in this workspace is {user.role}.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <Box display="flex" flexDirection="column" gap="4">
              <Field
                label="Full name"
                required
                invalid={nameInvalid}
                errorText="Enter your name."
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field
                label="Email address"
                required
                invalid={emailInvalid}
                errorText="Enter a valid email address."
                helperText="Used for sign-in and notifications."
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
            </Box>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Fieldset.Root>
              <Fieldset.Legend>Notifications</Fieldset.Legend>
              <Fieldset.HelperText>
                Choose which emails you receive from Lumen.
              </Fieldset.HelperText>
              <Fieldset.Content>
                <Box display="flex" flexDirection="column" gap="4" mt="2">
                  <Switch
                    checked={weeklyReport}
                    onCheckedChange={(e) => setWeeklyReport(e.checked)}
                  >
                    <Text>Weekly analytics report</Text>
                  </Switch>
                  <Switch
                    checked={issueAlerts}
                    onCheckedChange={(e) => setIssueAlerts(e.checked)}
                  >
                    <Text>Alerts when I am assigned an issue</Text>
                  </Switch>
                  <Switch
                    checked={productNews}
                    onCheckedChange={(e) => setProductNews(e.checked)}
                  >
                    <Text>Product news and release notes</Text>
                  </Switch>
                </Box>
              </Fieldset.Content>
            </Fieldset.Root>
          </Card.Body>
        </Card.Root>

        <HStack justify="flex-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setWeeklyReport(true);
              setIssueAlerts(true);
              setProductNews(false);
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </HStack>
      </Box>
    </form>
  );
}
