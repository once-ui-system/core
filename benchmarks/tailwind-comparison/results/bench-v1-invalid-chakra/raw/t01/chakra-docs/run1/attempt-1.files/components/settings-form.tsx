"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Stack gap="6" maxW="2xl">
      <Box>
        <Heading as="h1" size="2xl">
          Settings
        </Heading>
        <Text color="fg.muted" mt="1">
          Manage your profile and notification preferences.
        </Text>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <Stack gap="6">
          <Card.Root variant="outline">
            <Card.Header>
              <Card.Title>Profile</Card.Title>
              <Card.Description>
                This information is visible to your teammates.
              </Card.Description>
            </Card.Header>
            <Card.Body gap="4">
              <HStack gap="3">
                <Avatar name={user.name} size="lg" />
                <Box>
                  <Text fontWeight="medium">{user.name}</Text>
                  <Badge colorPalette="blue">{user.role}</Badge>
                </Box>
              </HStack>
              <Field label="Full name">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSaved(false);
                  }}
                  autoComplete="email"
                />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Header>
              <Card.Title>Notifications</Card.Title>
              <Card.Description>
                Choose what Lumen sends to {email}.
              </Card.Description>
            </Card.Header>
            <Card.Body gap="4">
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(e) => {
                  setWeeklyDigest(e.checked);
                  setSaved(false);
                }}
              >
                Weekly analytics digest
              </Switch>
              <Switch
                checked={issueAlerts}
                onCheckedChange={(e) => {
                  setIssueAlerts(e.checked);
                  setSaved(false);
                }}
              >
                Alerts when an issue is assigned to me
              </Switch>
              <Switch
                checked={productNews}
                onCheckedChange={(e) => {
                  setProductNews(e.checked);
                  setSaved(false);
                }}
              >
                Product news and release notes
              </Switch>
            </Card.Body>
          </Card.Root>

          <HStack gap="4">
            <Button type="submit">Save changes</Button>
            <Text
              role="status"
              aria-live="polite"
              textStyle="sm"
              color="fg.success"
            >
              {saved ? "Settings saved." : ""}
            </Text>
          </HStack>
        </Stack>
      </form>
    </Stack>
  );
}
