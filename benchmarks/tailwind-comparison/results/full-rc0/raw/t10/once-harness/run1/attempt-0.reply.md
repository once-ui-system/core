The design uses the documented `DropdownWrapper` with a `Button` trigger, so the click menu is keyboard-accessible. Its dropdown holds a profile header, a stats grid and actions, and `useToast` gives feedback. No avatar image is loaded from the network; `Avatar` falls back to initials.

```tsx
"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Avatar,
  Button,
  Column,
  DropdownWrapper,
  Grid,
  Heading,
  Icon,
  IconButton,
  Line,
  Option,
  Row,
  Tag,
  Text,
  ThemeSwitcher,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";

type Stat = { id: string; label: string; value: string; trend: string };

type MenuItem = {
  value: string;
  label: string;
  description: string;
  icon: IconName;
  shortcut?: string;
};

const PROFILE = {
  name: "Marta Lindqvist",
  handle: "@marta.lindqvist",
  role: "Staff Product Designer",
  team: "Northwind Studio",
  location: "Gothenburg, Sweden",
  bio: "Leads the design systems group. Currently shipping the 4.0 component library and a new onboarding flow.",
  plan: "Team plan",
};

const STATS: Stat[] = [
  { id: "projects", label: "Projects", value: "42", trend: "+3 this month" },
  { id: "reviews", label: "Reviews", value: "318", trend: "+27 this month" },
  { id: "followers", label: "Followers", value: "1.2k", trend: "+86 this month" },
];

const MENU_ITEMS: MenuItem[] = [
  {
    value: "profile",
    label: "View profile",
    description: "See your public page",
    icon: "person",
  },
  {
    value: "notifications",
    label: "Notifications",
    description: "4 unread mentions",
    icon: "bell",
  },
  {
    value: "billing",
    label: "Billing & plan",
    description: "Team plan, renews 1 Dec",
    icon: "payment",
  },
  {
    value: "settings",
    label: "Account settings",
    description: "Security, email and API keys",
    icon: "settings",
  },
  {
    value: "help",
    label: "Help center",
    description: "Guides and contact support",
    icon: "help",
  },
];

const MENU_LABELS: Record<string, string> = {
  profile: "Opening your public profile",
  notifications: "Opening notifications",
  billing: "Opening billing & plan",
  settings: "Opening account settings",
  help: "Opening the help center",
  logout: "You have been signed out (demo)",
};

export default function Page() {
  const { addToast } = useToast();
  const [following, setFollowing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const message = MENU_LABELS[value];
    if (message) {
      addToast({ variant: value === "logout" ? "info" : "success", message });
    }
  };

  const handleFollow = () => {
    const next = !following;
    setFollowing(next);
    addToast({
      variant: "success",
      message: next
        ? `You are now following ${PROFILE.name}`
        : `You unfollowed ${PROFILE.name}`,
    });
  };

  const handleMessage = () => {
    setOpen(false);
    addToast({ variant: "info", message: `Draft started to ${PROFILE.name}` });
  };

  return (
    <Column fillWidth minHeight="100vh">
      <Row
        as="header"
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="24"
        s={{ paddingX: "12" }}
        height="64"
        borderBottom
        background="surface"
      >
        <Row vertical="center" gap="12">
          <Icon name="organization" onBackground="brand-strong" />
          <Text variant="label-strong-m">{PROFILE.team}</Text>
          <Tag size="s" scheme="brand" s={{ hide: true }}>
            Workspace
          </Tag>
        </Row>

        <Row vertical="center" gap="8">
          <IconButton
            icon="search"
            variant="tertiary"
            tooltip="Search"
            ariaLabel="Search the workspace"
          />
          <IconButton
            icon="bell"
            variant="tertiary"
            tooltip="Notifications"
            ariaLabel="Notifications, 4 unread"
          />

          <DropdownWrapper
            placement="bottom-end"
            open={open}
            onOpenChange={setOpen}
            onSelect={handleSelect}
            minWidth={22}
            trigger={
              <Button
                variant="tertiary"
                rounded
                aria-label={`Account menu for ${PROFILE.name}`}
              >
                <Row vertical="center" gap="8">
                  <Avatar
                    size="s"
                    value="ML"
                    statusIndicator={{ color: "green" }}
                  />
                  <Row s={{ hide: true }} vertical="center" gap="8">
                    <Text variant="label-default-s">{PROFILE.name}</Text>
                    <Icon name="chevronDown" size="xs" onBackground="neutral-weak" />
                  </Row>
                </Row>
              </Button>
            }
            dropdown={
              <Column minWidth={22} maxWidth={26} background="page" role="presentation">
                <Column fillWidth padding="16" gap="16">
                  <Row gap="12" vertical="center">
                    <Avatar
                      size="l"
                      value="ML"
                      statusIndicator={{ color: "green" }}
                    />
                    <Column gap="4" flex={1}>
                      <Heading as="h2" variant="heading-strong-m">
                        {PROFILE.name}
                      </Heading>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {PROFILE.handle}
                      </Text>
                    </Column>
                    <Tag size="s" scheme="success">
                      Online
                    </Tag>
                  </Row>

                  <Column gap="4">
                    <Text variant="label-default-s">{PROFILE.role}</Text>
                    <Row gap="4" vertical="center">
                      <Icon name="globe" size="xs" onBackground="neutral-weak" />
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {PROFILE.location}
                      </Text>
                    </Row>
                  </Column>

                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {PROFILE.bio}
                  </Text>

                  <Grid
                    columns="3"
                    gap="8"
                    fillWidth
                    as="dl"
                    margin="0"
                    aria-label="Profile statistics"
                  >
                    {STATS.map((stat) => (
                      <Column
                        key={stat.id}
                        background="surface"
                        border
                        radius="m"
                        padding="12"
                        gap="2"
                      >
                        <Text
                          as="dd"
                          variant="heading-strong-l"
                          style={{ margin: 0 }}
                        >
                          {stat.value}
                        </Text>
                        <Text
                          as="dt"
                          variant="label-default-xs"
                          onBackground="neutral-weak"
                        >
                          {stat.label}
                        </Text>
                        <Text
                          variant="body-default-xs"
                          onBackground="success-medium"
                        >
                          {stat.trend}
                        </Text>
                      </Column>
                    ))}
                  </Grid>

                  <Row gap="8" fillWidth>
                    <Button
                      size="s"
                      variant={following ? "secondary" : "primary"}
                      prefixIcon={following ? "check" : "plus"}
                      onClick={handleFollow}
                      aria-pressed={following}
                      fillWidth
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                    <Button
                      size="s"
                      variant="secondary"
                      prefixIcon="chat"
                      onClick={handleMessage}
                      fillWidth
                    >
                      Message
                    </Button>
                  </Row>
                </Column>

                <Line />

                <Column fillWidth padding="4" gap="2">
                  {MENU_ITEMS.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      description={item.description}
                      prefix={
                        <Icon
                          padding="4"
                          margin="2"
                          size="s"
                          name={item.icon}
                          onBackground="neutral-weak"
                        />
                      }
                    />
                  ))}
                </Column>

                <Line />

                <Row
                  fillWidth
                  paddingX="16"
                  paddingY="8"
                  horizontal="between"
                  vertical="center"
                  gap="8"
                >
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    Theme
                  </Text>
                  <ThemeSwitcher />
                </Row>

                <Line />

                <Column fillWidth padding="4">
                  <Option
                    danger
                    value="logout"
                    label="Log out"
                    prefix={
                      <Icon padding="4" margin="2" size="s" name="logout" />
                    }
                  />
                </Column>
              </Column>
            }
          />
        </Row>
      </Row>

      <Column
        as="main"
        fillWidth
        horizontal="center"
        paddingX="24"
        paddingY="64"
        s={{ paddingX: "16", paddingY: "40" }}
      >
        <Column maxWidth="m" gap="24">
          <Column gap="12">
            <Tag size="s" scheme="brand" fit>
              Design systems
            </Tag>
            <Heading as="h1" variant="display-strong-s" wrap="balance">
              Good morning, Marta
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Open the account menu in the top-right corner to see your profile
              summary, activity stats and quick actions. It works with a click,
              the Enter or Space key, and a tap on touch screens.
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-l">
              This week at Northwind
            </Heading>
            <Grid columns="3" gap="16" s={{ columns: 1 }} fillWidth>
              {[
                { label: "Open reviews", value: "7", icon: "eye" as const },
                { label: "Components shipped", value: "12", icon: "bolt" as const },
                { label: "Unread mentions", value: "4", icon: "bell" as const },
              ].map((card) => (
                <Row
                  key={card.label}
                  gap="12"
                  vertical="center"
                  padding="16"
                  radius="m"
                  border
                >
                  <Icon name={card.icon} onBackground="brand-strong" />
                  <Column gap="2">
                    <Text variant="heading-strong-l">{card.value}</Text>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {card.label}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Grid>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```