"use client";

import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Switch,
  Text,
  useTheme,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

const panel = { background: "surface", border: true, radius: "m", padding: "16", gap: "12" } as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [landing, setLanding] = useState("/");
  const [issueEmails, setIssueEmails] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ tone: "success", children: "Settings saved" });
  };

  return (
    <Column as="form" onSubmit={save} fillWidth gap="16" maxWidth="40rem">
      <PageHeader title="Settings" description="Your profile, notifications and appearance." />

      <Column as="section" aria-labelledby="profile" {...panel}>
        <Heading as="h2" id="profile" textVariant="heading-strong-s">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input id="role" label="Role" value={user.role} readOnly description="Set by the workspace owner." />
        <Select
          id="landing"
          label="Open Lumen on"
          value={landing}
          onValueChange={(value) => setLanding(String(value))}
          options={[
            { value: "/", label: "Overview" },
            { value: "/projects", label: "Projects" },
            { value: "/reports", label: "Reports" },
          ]}
        />
      </Column>

      <Column as="section" aria-labelledby="notifications" {...panel}>
        <Heading as="h2" id="notifications" textVariant="heading-strong-s">
          Notifications
        </Heading>
        <Switch
          id="issue-emails"
          label="Issue assignments"
          description="Email me when an issue is assigned to me."
          checked={issueEmails}
          onCheckedChange={setIssueEmails}
        />
        <Switch
          id="weekly-digest"
          label="Weekly digest"
          description="A Monday summary of open issues and project activity."
          checked={weeklyDigest}
          onCheckedChange={setWeeklyDigest}
        />
        <Switch
          id="product-news"
          label="Product news"
          description="Occasional notes about new Lumen features."
          checked={productNews}
          onCheckedChange={setProductNews}
        />
      </Column>

      <Column as="section" aria-labelledby="appearance" {...panel}>
        <Heading as="h2" id="appearance" textVariant="heading-strong-s">
          Appearance
        </Heading>
        <Text id="theme-label" textVariant="label-default-s" onBackground="neutral-weak">
          Theme
        </Text>
        <SegmentedControl
          aria-labelledby="theme-label"
          maxWidth="20rem"
          value={theme}
          onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
          buttons={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </Column>

      <Row gap="8">
        <Button type="submit" label="Save changes" />
        <Button
          type="button"
          variant="secondary"
          label="Reset"
          onClick={() => {
            setName(user.name);
            setEmail(user.email);
            setLanding("/");
            setIssueEmails(true);
            setWeeklyDigest(true);
            setProductNews(false);
          }}
        />
      </Row>
    </Column>
  );
}
