I have what I need.

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
  ProgressBar,
  Row,
  SmartLink,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";

type Stat = { id: string; label: string; value: string };
type Action = { value: string; label: string; icon: IconName; description?: string };

const user = {
  name: "Maya Okafor",
  handle: "@mayaokafor",
  initials: "MO",
  role: "Staff Product Designer",
  team: "Harbor Design Systems",
  location: "Lisbon, Portugal",
  plan: "Pro",
  storageUsed: 7.4,
  storageTotal: 10,
};

const stats: Stat[] = [
  { id: "projects", label: "Projects", value: "24" },
  { id: "followers", label: "Followers", value: "1.8k" },
  { id: "reviews", label: "Reviews", value: "312" },
];

const actions: Action[] = [
  { value: "profile", label: "View profile", icon: "person", description: "See your public page" },
  { value: "settings", label: "Account settings", icon: "settings" },
  { value: "billing", label: "Billing and plan", icon: "payment" },
  { value: "notifications", label: "Notifications", icon: "bell", description: "3 unread" },
];

const recentActivity = [
  { id: "a1", text: "Published “Onboarding flow v3” to the Harbor library", time: "2h ago" },
  { id: "a2", text: "Reviewed 4 pull requests on the token pipeline", time: "Yesterday" },
  { id: "a3", text: "Joined the Accessibility guild", time: "3 days ago" },
];

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    if (value === "signout") {
      setLastAction("Signed out");
      addToast({ variant: "success", message: "You have been signed out." });
      return;
    }
    const match = actions.find((action) => action.value === value);
    if (match) {
      setLastAction(match.label);
      addToast({ variant: "info", message: `${match.label} is a demo action.` });
    }
  };

  const storagePercent = Math.round((user.storageUsed / user.storageTotal) * 100);

  return (
    <Column fillWidth minHeight="100vh">
      <Row
        as="header"
        fillWidth
        borderBottom
        background="page"
        paddingX="16"
        minHeight="56"
        vertical="center"
        horizontal="between"
        gap="16"
      >
        <Row vertical="center" gap="12">
          <Icon name="organization" size="m" onBackground="brand-medium" />
          <Text variant="heading-strong-s">Harbor</Text>
          <Row s={{ hide: true }}>
            <Tag size="s" scheme="neutral">
              Design systems
            </Tag>
          </Row>
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
            open={open}
            onOpenChange={setOpen}
            onSelect={handleSelect}
            minWidth={20}
            maxWidth={24}
            trigger={
              <button
                type="button"
                aria-label={`Account menu for ${user.name}`}
                aria-haspopup="menu"
                aria-expanded={open}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  borderRadius: "999px",
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                <Avatar
                  size="m"
                  value={user.initials}
                  statusIndicator={{ color: "green" }}
                />
              </button>
            }
            dropdown={
              <Column fillWidth padding="8" gap="8">
                <Row gap="12" vertical="center" padding="8">
                  <Avatar size="l" value={user.initials} />
                  <Column gap="2" flex={1}>
                    <Row gap="8" vertical="center" wrap>
                      <Text variant="heading-strong-s">{user.name}</Text>
                      <Tag size="s" scheme="brand">
                        {user.plan}
                      </Tag>
                    </Row>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {user.handle} · {user.role}
                    </Text>
                  </Column>
                </Row>

                <Grid
                  as="ul"
                  columns="3"
                  gap="8"
                  paddingX="8"
                  margin="0"
                  aria-label="Profile statistics"
                  style={{ listStyle: "none" }}
                >
                  {stats.map((stat) => (
                    <Column
                      as="li"
                      key={stat.id}
                      background="neutral-alpha-weak"
                      radius="m"
                      paddingY="8"
                      paddingX="12"
                      gap="2"
                      horizontal="center"
                    >
                      <Text variant="heading-strong-m">{stat.value}</Text>
                      <Text variant="label-default-xs" onBackground="neutral-weak">
                        {stat.label}
                      </Text>
                    </Column>
                  ))}
                </Grid>

                <Column paddingX="8" gap="4">
                  <Row horizontal="between" vertical="center">
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      Storage
                    </Text>
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {user.storageUsed} of {user.storageTotal} GB
                    </Text>
                  </Row>
                  <ProgressBar value={storagePercent} showLabel={false} />
                </Column>

                <Line />

                <Column gap="2">
                  {actions.map((action) => (
                    <Option
                      key={action.value}
                      value={action.value}
                      label={action.label}
                      description={action.description}
                      prefix={<Icon name={action.icon} size="s" onBackground="neutral-weak" />}
                    />
                  ))}
                </Column>

                <Line />

                <Option
                  value="signout"
                  label="Sign out"
                  danger
                  prefix={<Icon name="logout" size="s" />}
                />
              </Column>
            }
          />
        </Row>
      </Row>

      <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40">
        <Column maxWidth="m" gap="32">
          <Column gap="12">
            <Text variant="label-default-s" onBackground="brand-medium">
              Workspace
            </Text>
            <Heading as="h1" variant="display-strong-s">
              Good morning, Maya
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
              Open the avatar in the top right to see your profile summary, storage
              usage and account shortcuts. It works with a click, a tap, or the
              keyboard: Enter to open, arrow keys to move, Escape to close.
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="16">
            <Row gap="16" vertical="center" wrap>
              <Avatar size="xl" value={user.initials} />
              <Column gap="4" flex={1} minWidth={12}>
                <Heading as="h2" variant="heading-strong-l">
                  {user.name}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {user.role} at {user.team}
                </Text>
                <Row gap="4" vertical="center">
                  <Icon name="globe" size="xs" onBackground="neutral-weak" />
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {user.location}
                  </Text>
                </Row>
              </Column>
              <Button
                variant="secondary"
                size="s"
                prefixIcon="edit"
                label="Edit profile"
                onClick={() =>
                  addToast({ variant: "info", message: "Profile editing is a demo action." })
                }
              />
            </Row>
          </Column>

          <Column gap="16">
            <Heading as="h2" variant="heading-strong-m">
              Recent activity
            </Heading>
            <Column
              as="ul"
              background="surface"
              border
              radius="l"
              margin="0"
              padding="0"
              style={{ listStyle: "none" }}
            >
              {recentActivity.map((item, index) => (
                <Row
                  as="li"
                  key={item.id}
                  padding="16"
                  gap="16"
                  horizontal="between"
                  vertical="center"
                  borderTop={index === 0 ? undefined : true}
                >
                  <Text variant="body-default-s" wrap="pretty">
                    {item.text}
                  </Text>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    {item.time}
                  </Text>
                </Row>
              ))}
            </Column>
            <Row>
              <SmartLink href="#" suffixIcon="arrowRight">
                <Text variant="label-default-s">View all activity</Text>
              </SmartLink>
            </Row>
          </Column>

          <Text variant="label-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            {lastAction ? `Last action: ${lastAction}` : "No menu action chosen yet."}
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
```