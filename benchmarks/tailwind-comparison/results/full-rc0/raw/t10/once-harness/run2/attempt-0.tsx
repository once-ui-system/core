"use client";

import {
  Avatar,
  Button,
  Column,
  DropdownWrapper,
  Heading,
  Icon,
  IconButton,
  Line,
  Row,
  StatusIndicator,
  Switch,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useCallback, useId, useState } from "react";

type Stat = { label: string; value: string };
type Action = { id: string; label: string; icon: IconName; hint?: string; danger?: boolean };

const profile = {
  name: "Maren Okafor",
  handle: "@maren.okafor",
  role: "Staff Product Designer",
  org: "Northwind Labs",
  location: "Lisbon, Portugal",
  bio: "Designing calm interfaces for complex tools. Currently leading the Atlas design system.",
  plan: "Team plan",
};

const stats: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "318" },
];

const actions: Action[] = [
  { id: "profile", label: "View profile", icon: "person", hint: "Public page" },
  { id: "messages", label: "Messages", icon: "chat", hint: "3 unread" },
  { id: "settings", label: "Account settings", icon: "settings" },
  { id: "billing", label: "Billing and plan", icon: "payment" },
  { id: "help", label: "Help center", icon: "help" },
];

const activity = [
  { id: "a1", title: "Published “Atlas tokens v2.3”", time: "2 hours ago" },
  { id: "a2", title: "Commented on “Onboarding revamp”", time: "Yesterday" },
  { id: "a3", title: "Joined the Accessibility guild", time: "3 days ago" },
];

type ProfileCardProps = {
  onAction: (action: Action) => void;
  onSignOut: () => void;
  available: boolean;
  onAvailableChange: (value: boolean) => void;
};

function ProfileCard({ onAction, onSignOut, available, onAvailableChange }: ProfileCardProps) {
  const headingId = useId();

  return (
    <Column
      as="section"
      aria-labelledby={headingId}
      background="surface"
      border
      radius="l"
      shadow="l"
      fillWidth
      minWidth={20}
      maxWidth={24}
      overflow="hidden"
    >
      <Column padding="16" gap="16">
        <Row gap="12" vertical="start">
          <Avatar
            size="l"
            value="MO"
            statusIndicator={{ color: available ? "green" : "gray" }}
          />
          <Column flex={1} gap="4">
            <Heading as="h2" id={headingId} variant="heading-strong-m">
              {profile.name}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {profile.handle}
            </Text>
            <Row gap="8" wrap paddingTop="4">
              <Tag size="s" scheme="brand" label={profile.plan} />
              <Tag size="s" prefixIcon="organization" label={profile.org} />
            </Row>
          </Column>
        </Row>

        <Text variant="body-default-s" onBackground="neutral-medium">
          {profile.bio}
        </Text>

        <Row
          as="dl"
          margin="0"
          fillWidth
          border
          radius="m"
          background="page"
          paddingY="12"
        >
          {stats.map((stat, index) => (
            <Column
              key={stat.label}
              flex={1}
              center
              gap="2"
              borderLeft={index > 0 ? true : undefined}
            >
              <Text as="dd" variant="heading-strong-m" style={{ margin: 0 }}>
                {stat.value}
              </Text>
              <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
                {stat.label}
              </Text>
            </Column>
          ))}
        </Row>

        <Row horizontal="between" vertical="center" gap="12">
          <Row gap="8" vertical="center">
            <Icon name="time" size="s" onBackground="neutral-weak" />
            <Text variant="label-default-s">Available for chat</Text>
          </Row>
          <Switch
            ariaLabel="Available for chat"
            checked={available}
            onToggle={onAvailableChange}
          />
        </Row>
      </Column>

      <Line />

      <Column padding="8" gap="2" role="group" aria-label="Account actions">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="tertiary"
            size="m"
            fillWidth
            horizontal="start"
            prefixIcon={action.icon}
            onClick={() => onAction(action)}
          >
            <Row fillWidth horizontal="between" vertical="center" gap="8">
              <Text variant="label-default-m">{action.label}</Text>
              {action.hint ? (
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  {action.hint}
                </Text>
              ) : null}
            </Row>
          </Button>
        ))}
      </Column>

      <Line />

      <Column padding="8">
        <Button
          variant="tertiary"
          size="m"
          fillWidth
          horizontal="start"
          prefixIcon="logout"
          onClick={onSignOut}
        >
          Sign out
        </Button>
      </Column>
    </Column>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(true);

  const handleAction = useCallback(
    (action: Action) => {
      setOpen(false);
      addToast({
        variant: "success",
        message: `${action.label} opened (demo)`,
      });
    },
    [addToast],
  );

  const handleSignOut = useCallback(() => {
    setOpen(false);
    addToast({ variant: "danger", message: "You have been signed out (demo)" });
  }, [addToast]);

  return (
    <Column as="main" fillWidth minHeight="100vh">
      <Row
        as="header"
        fillWidth
        paddingX="16"
        paddingY="12"
        horizontal="between"
        vertical="center"
        gap="16"
        borderBottom
        background="surface"
      >
        <Row gap="12" vertical="center">
          <Icon name="sparkle" onBackground="brand-medium" />
          <Text variant="heading-strong-m">Atlas</Text>
        </Row>

        <Row gap="8" vertical="center">
          <IconButton
            icon="bell"
            variant="tertiary"
            tooltip="Notifications"
            ariaLabel="Notifications, 2 new"
          />
          <DropdownWrapper
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            closeAfterClick={false}
            handleArrowNavigation={false}
            minWidth={20}
            trigger={
              <Row
                as="span"
                radius="full"
                cursor="interactive"
                padding="2"
                aria-label={`Account menu for ${profile.name}`}
              >
                <Avatar
                  size="m"
                  value="MO"
                  statusIndicator={{ color: available ? "green" : "gray" }}
                />
              </Row>
            }
            dropdown={
              <ProfileCard
                onAction={handleAction}
                onSignOut={handleSignOut}
                available={available}
                onAvailableChange={setAvailable}
              />
            }
          />
        </Row>
      </Row>

      <Column fillWidth horizontal="center" paddingX="16" paddingY="40">
        <Column maxWidth="m" gap="32">
          <Column gap="12">
            <Row gap="8" vertical="center">
              <StatusIndicator color={available ? "green" : "gray"} ariaLabel={available ? "Online" : "Away"} />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {available ? "You appear online" : "You appear away"}
              </Text>
            </Row>
            <Heading as="h1" variant="display-strong-xs">
              Welcome back, Maren
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-medium">
              Select your avatar in the top right corner to open your profile card with stats,
              availability and quick account actions.
            </Text>
            <Row>
              <Button
                variant="secondary"
                prefixIcon="person"
                onClick={() => setOpen(true)}
              >
                Open profile card
              </Button>
            </Row>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-l">
              Recent activity
            </Heading>
            <Column as="ul" margin="0" padding="0" gap="12" style={{ listStyle: "none" }}>
              {activity.map((item) => (
                <Row
                  as="li"
                  key={item.id}
                  horizontal="between"
                  vertical="center"
                  gap="16"
                  wrap
                >
                  <Row gap="12" vertical="center" flex={1} minWidth={12}>
                    <Icon name="check" size="s" onBackground="brand-medium" />
                    <Text variant="body-default-m">{item.title}</Text>
                  </Row>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {item.time}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
