I'll build a realistic "app header" scene with two interaction patterns: a click-triggered account menu (`DropdownWrapper`, keyboard accessible) whose panel contains the profile card with stats and actions, plus a hover/focus preview card (`Hover interactive`) on a teammate avatar. I'll use `useToast` for action feedback.

```tsx
"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Heading,
  Hover,
  IconButton,
  Line,
  Option,
  Row,
  StatusIndicator,
  Tag,
  Text,
  DropdownWrapper,
  useToast,
} from "@once-ui-system/core";

type Stat = { label: string; value: string };

const PROFILE = {
  name: "Maya Okafor",
  handle: "@mayaokafor",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  email: "maya.okafor@northlight.studio",
  bio: "Designing calm, fast interfaces for the Northlight design system. Currently shipping the 4.0 token overhaul.",
  initials: "Maya Okafor",
};

const STATS: Stat[] = [
  { label: "Projects", value: "42" },
  { label: "Followers", value: "1.8k" },
  { label: "Reviews", value: "317" },
];

const TEAMMATE = {
  name: "Tomás Ribeiro",
  handle: "@tomasr",
  role: "Frontend Engineer",
  bio: "Owns the component library release train. Coffee, accessibility audits and Rust on weekends.",
  stats: [
    { label: "Commits", value: "2.4k" },
    { label: "PRs", value: "186" },
    { label: "Reviews", value: "540" },
  ] as Stat[],
};

function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <Row
      fillWidth
      border
      radius="m"
      background="neutral-alpha-weak"
      paddingY="12"
      as="dl"
      margin="0"
    >
      {stats.map((stat, index) => (
        <Row key={stat.label} flex={1} horizontal="center">
          {index > 0 && <Line vert height="32" />}
          <Column fillWidth horizontal="center" gap="2">
            <Text as="dd" variant="heading-strong-m" style={{ margin: 0 }}>
              {stat.value}
            </Text>
            <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
              {stat.label}
            </Text>
          </Column>
        </Row>
      ))}
    </Row>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const notify = (message: string) => {
    addToast({ variant: "success", message });
  };

  const handleSelect = (value: string) => {
    switch (value) {
      case "profile":
        notify("Opening your public profile…");
        break;
      case "settings":
        notify("Opening account settings…");
        break;
      case "billing":
        notify("Opening billing & plans…");
        break;
      case "support":
        notify("Connecting you to support…");
        break;
      case "signout":
        notify("You have been signed out.");
        break;
      default:
        break;
    }
  };

  return (
    <Column as="main" fillWidth minHeight="100vh">
      {/* App header */}
      <Row
        as="header"
        fillWidth
        borderBottom
        background="surface"
        paddingX="16"
        paddingY="12"
        horizontal="between"
        vertical="center"
        gap="16"
      >
        <Row vertical="center" gap="12">
          <Row
            width="32"
            height="32"
            radius="m"
            background="brand-alpha-medium"
            center
            aria-hidden="true"
          >
            <Text variant="label-strong-m" onBackground="brand-strong">
              N
            </Text>
          </Row>
          <Text variant="heading-strong-m">Northlight</Text>
        </Row>

        <Row vertical="center" gap="8">
          <IconButton
            icon="bell"
            variant="tertiary"
            tooltip="Notifications"
            ariaLabel="Notifications, 3 unread"
          />
          <DropdownWrapper
            placement="bottom-end"
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onSelect={handleSelect}
            minWidth={20}
            trigger={
              <Row
                vertical="center"
                gap="8"
                padding="4"
                paddingRight="8"
                radius="full"
                border
                background="surface"
                cursor="interactive"
                aria-label={`Account menu for ${PROFILE.name}`}
              >
                <Avatar
                  size="s"
                  value="MO"
                  statusIndicator={{ color: "green" }}
                />
                <Row s={{ hide: true }} vertical="center" gap="4">
                  <Text variant="label-default-s">Maya</Text>
                </Row>
              </Row>
            }
            dropdown={
              <Column
                minWidth={18}
                maxWidth={22}
                padding="8"
                gap="8"
                role="menu"
                aria-label="Account"
              >
                <Column padding="8" gap="12">
                  <Row gap="12" vertical="center">
                    <Avatar
                      size="l"
                      value="MO"
                      statusIndicator={{ color: "green" }}
                    />
                    <Column gap="2" fillWidth>
                      <Text variant="label-strong-m" truncate>
                        {PROFILE.name}
                      </Text>
                      <Text
                        variant="body-default-xs"
                        onBackground="neutral-weak"
                        truncate
                      >
                        {PROFILE.email}
                      </Text>
                    </Column>
                  </Row>
                  <StatRow stats={STATS} />
                </Column>
                <Line />
                <Option
                  value="profile"
                  label="View profile"
                  prefix={<Text onBackground="neutral-weak">·</Text>}
                />
                <Option value="settings" label="Account settings" />
                <Option value="billing" label="Billing & plans" />
                <Option value="support" label="Help & support" />
                <Line />
                <Option value="signout" label="Sign out" danger />
              </Column>
            }
          />
        </Row>
      </Row>

      {/* Page content */}
      <Column fillWidth horizontal="center" paddingX="16" paddingY="40">
        <Column maxWidth="m" fillWidth gap="40">
          <Column gap="12">
            <Tag scheme="brand" label="Design systems" prefixIcon="sparkle" />
            <Heading as="h1" variant="display-strong-s">
              Token overhaul 4.0 — review hub
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Everything the team needs to sign off on the new color, spacing
              and typography tokens before the March release.
            </Text>
          </Column>

          <Column
            background="surface"
            border
            radius="l"
            padding="24"
            gap="24"
          >
            <Row horizontal="between" vertical="center" gap="16" wrap>
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l">
                  Reviewers
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Hover or focus a name to preview their profile.
                </Text>
              </Column>
              <Tag scheme="success" label="2 of 3 approved" prefixIcon="check" />
            </Row>

            <Line />

            <Row gap="16" vertical="center" wrap>
              <Hover
                interactive
                delay={150}
                hideDelay={150}
                touch="enable"
                trigger={
                  <Row
                    as="button"
                    type="button"
                    vertical="center"
                    gap="12"
                    padding="8"
                    paddingRight="16"
                    radius="full"
                    border
                    background="transparent"
                    cursor="interactive"
                    aria-label={`${TEAMMATE.name}, ${TEAMMATE.role}. Preview profile`}
                  >
                    <Avatar size="m" value="TR" />
                    <Column gap="2" horizontal="start">
                      <Text variant="label-strong-s">{TEAMMATE.name}</Text>
                      <Text
                        variant="body-default-xs"
                        onBackground="neutral-weak"
                      >
                        {TEAMMATE.role}
                      </Text>
                    </Column>
                  </Row>
                }
                overlay={
                  <Column
                    background="surface"
                    border
                    radius="l"
                    shadow="l"
                    padding="16"
                    gap="16"
                    width={20}
                    maxWidth={22}
                    role="dialog"
                    aria-label={`${TEAMMATE.name} profile preview`}
                  >
                    <Row gap="12" vertical="center">
                      <Avatar size="l" value="TR" />
                      <Column gap="2" fillWidth>
                        <Text variant="heading-strong-s">{TEAMMATE.name}</Text>
                        <Text
                          variant="body-default-xs"
                          onBackground="neutral-weak"
                        >
                          {TEAMMATE.handle} · {TEAMMATE.role}
                        </Text>
                      </Column>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {TEAMMATE.bio}
                    </Text>
                    <StatRow stats={TEAMMATE.stats} />
                    <Row gap="8">
                      <Button
                        size="s"
                        fillWidth
                        variant={following ? "secondary" : "primary"}
                        prefixIcon={following ? "check" : "plus"}
                        onClick={() => {
                          setFollowing((current) => !current);
                          notify(
                            following
                              ? `Unfollowed ${TEAMMATE.name}`
                              : `Following ${TEAMMATE.name}`,
                          );
                        }}
                      >
                        {following ? "Following" : "Follow"}
                      </Button>
                      <Button
                        size="s"
                        variant="secondary"
                        prefixIcon="mail"
                        onClick={() =>
                          notify(`Message draft opened for ${TEAMMATE.name}`)
                        }
                      >
                        Message
                      </Button>
                    </Row>
                  </Column>
                }
              />

              <Row gap="12" vertical="center" paddingX="8">
                <Avatar size="m" value="PN" />
                <Column gap="2">
                  <Text variant="label-strong-s">Priya Natarajan</Text>
                  <Row gap="4" vertical="center">
                    <StatusIndicator color="green" size="s" />
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      Approved
                    </Text>
                  </Row>
                </Column>
              </Row>

              <Row gap="12" vertical="center" paddingX="8">
                <Avatar size="m" value="JL" />
                <Column gap="2">
                  <Text variant="label-strong-s">Jonas Lindqvist</Text>
                  <Row gap="4" vertical="center">
                    <StatusIndicator color="yellow" size="s" />
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      Awaiting review
                    </Text>
                  </Row>
                </Column>
              </Row>
            </Row>
          </Column>

          <Column
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
          >
            <Heading as="h2" variant="heading-strong-l">
              Your profile
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {PROFILE.bio}
            </Text>
            <Row gap="8" wrap>
              <Tag label={PROFILE.role} prefixIcon="person" />
              <Tag label={PROFILE.location} prefixIcon="globe" />
              <Tag label={PROFILE.handle} prefixIcon="link" />
            </Row>
            <Row gap="8" wrap>
              <Button
                variant="secondary"
                prefixIcon="edit"
                onClick={() => notify("Profile editor opened")}
              >
                Edit profile
              </Button>
              <Button
                variant="tertiary"
                prefixIcon="copy"
                onClick={() => notify("Profile link copied to clipboard")}
              >
                Copy link
              </Button>
            </Row>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```