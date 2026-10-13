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
  Option,
  Row,
  StatusIndicator,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useState } from "react";

type PresenceId = "online" | "focus" | "away";

type Presence = {
  id: PresenceId;
  label: string;
  description: string;
  color: "green" | "orange" | "gray";
};

const PRESENCE: Presence[] = [
  { id: "online", label: "Available", description: "Show as online to your team", color: "green" },
  { id: "focus", label: "Focus mode", description: "Pause notifications for 2 hours", color: "orange" },
  { id: "away", label: "Away", description: "Appear offline until you return", color: "gray" },
];

const PROFILE = {
  name: "Maya Okonkwo",
  handle: "@maya.okonkwo",
  role: "Staff Product Designer",
  team: "Design Systems",
  initials: "MO",
};

const STATS: { label: string; value: string; delta: string }[] = [
  { label: "Projects", value: "24", delta: "+3 this month" },
  { label: "Reviews", value: "1,284", delta: "+86 this week" },
  { label: "Followers", value: "3.2k", delta: "+212 this month" },
];

type ActionItem = { value: string; label: string; icon: IconName; description?: string };

const ACTIONS: ActionItem[] = [
  { value: "profile", label: "View profile", icon: "person", description: "See your public page" },
  { value: "settings", label: "Account settings", icon: "settings" },
  { value: "billing", label: "Billing and plans", icon: "payment" },
  { value: "help", label: "Help and support", icon: "help" },
];

const ACTIVITY: { id: string; text: string; time: string; icon: IconName }[] = [
  { id: "a1", text: "Approved the Checkout redesign", time: "12 min ago", icon: "check" },
  { id: "a2", text: "Commented on Token audit v3", time: "2 hours ago", icon: "chat" },
  { id: "a3", text: "Published Button spec 2.4", time: "Yesterday", icon: "document" },
];

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [presence, setPresence] = useState<PresenceId>("online");
  const [following, setFollowing] = useState(false);

  const current = PRESENCE.find((p) => p.id === presence) ?? PRESENCE[0];

  const handleSelect = (value: string) => {
    const presenceMatch = PRESENCE.find((p) => `presence-${p.id}` === value);
    if (presenceMatch) {
      setPresence(presenceMatch.id);
      addToast({ variant: "success", message: `Status set to ${presenceMatch.label}` });
      return;
    }
    if (value === "logout") {
      addToast({ variant: "info", message: "You have been signed out (demo)" });
      setOpen(false);
      return;
    }
    const action = ACTIONS.find((a) => a.value === value);
    if (action) {
      addToast({ variant: "info", message: `${action.label} is not part of this demo` });
      setOpen(false);
    }
  };

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    addToast({
      variant: "success",
      message: next ? `You are now following ${PROFILE.name}` : `Unfollowed ${PROFILE.name}`,
    });
  };

  const trigger = (
    <Row
      as="span"
      fit
      radius="full"
      cursor="interactive"
      padding="2"
      border={open ? "brand-alpha-medium" : "transparent"}
    >
      <Avatar
        size="m"
        value={PROFILE.initials}
        statusIndicator={{
          color: current.color === "orange" ? "yellow" : current.color,
        }}
      />
    </Row>
  );

  const panel = (
    <Column
      minWidth={20}
      maxWidth={24}
      background="surface"
      aria-label={`${PROFILE.name} profile`}
      role="group"
    >
      <Column padding="16" gap="16">
        <Row gap="12" vertical="center">
          <Avatar size="l" value={PROFILE.initials} />
          <Column gap="2" flex={1}>
            <Text variant="heading-strong-s">{PROFILE.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {PROFILE.handle}
            </Text>
          </Column>
          <Tag scheme="brand" size="s" label="Pro" />
        </Row>
        <Column gap="2">
          <Text variant="body-default-s">{PROFILE.role}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {PROFILE.team} · Lagos, Nigeria
          </Text>
        </Column>
        <Row gap="8">
          <Button
            size="s"
            variant={following ? "secondary" : "primary"}
            prefixIcon={following ? "check" : "plus"}
            label={following ? "Following" : "Follow"}
            onClick={toggleFollow}
            fillWidth
          />
          <IconButton
            icon="mail"
            variant="secondary"
            size="m"
            tooltip="Send message"
            ariaLabel="Send message"
            onClick={() => addToast({ variant: "info", message: "Messaging is not part of this demo" })}
          />
        </Row>
      </Column>

      <Line />

      <Row
        paddingX="8"
        paddingY="12"
        role="list"
        aria-label="Profile statistics"
      >
        {STATS.map((stat) => (
          <Column key={stat.label} role="listitem" flex={1} horizontal="center" gap="2" paddingX="4">
            <Text variant="heading-strong-m">{stat.value}</Text>
            <Text variant="label-default-xs" onBackground="neutral-weak">
              {stat.label}
            </Text>
            <Text variant="body-default-xs" onBackground="brand-medium" align="center">
              {stat.delta}
            </Text>
          </Column>
        ))}
      </Row>

      <Line />

      <Column padding="8" gap="2" role="group" aria-label="Set your status">
        <Text variant="label-default-xs" onBackground="neutral-weak" paddingX="8" paddingY="4">
          Status
        </Text>
        {PRESENCE.map((p) => (
          <Option
            key={p.id}
            value={`presence-${p.id}`}
            label={p.label}
            description={p.description}
            selected={presence === p.id}
            prefix={<StatusIndicator color={p.color} ariaLabel={`${p.label} status`} />}
            suffix={presence === p.id ? <Icon name="check" size="s" /> : undefined}
          />
        ))}
      </Column>

      <Line />

      <Column padding="8" gap="2" role="group" aria-label="Account actions">
        {ACTIONS.map((action) => (
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

      <Column padding="8">
        <Option
          value="logout"
          label="Sign out"
          danger
          prefix={<Icon name="logout" size="s" />}
        />
      </Column>
    </Column>
  );

  return (
    <Column as="main" fillWidth horizontal="center" minHeight="100vh">
      <Row
        as="header"
        fillWidth
        height="64"
        paddingX="16"
        vertical="center"
        horizontal="between"
        borderBottom
        background="surface"
        gap="16"
      >
        <Row gap="12" vertical="center">
          <Row width="32" height="32" radius="m" solid="brand-strong" center>
            <Icon name="sparkle" size="s" onSolid="brand-strong" />
          </Row>
          <Text variant="heading-strong-s">Northwind Studio</Text>
        </Row>

        <Row gap="8" vertical="center" fit>
          <IconButton
            icon="bell"
            variant="tertiary"
            tooltip="Notifications"
            ariaLabel="Notifications"
            onClick={() => addToast({ variant: "info", message: "You are all caught up" })}
          />
          <DropdownWrapper
            placement="bottom-end"
            open={open}
            onOpenChange={setOpen}
            closeAfterClick={false}
            onSelect={handleSelect}
            trigger={trigger}
            dropdown={panel}
          />
        </Row>
      </Row>

      <Column maxWidth="l" fillWidth paddingX="16" paddingY="40" gap="32">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Team workspace
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Good afternoon, Maya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Open your profile from the avatar in the top right. It shows your stats, lets you change
            your status and jump to account actions without leaving the page.
          </Text>
        </Column>

        <Row gap="12" vertical="center" wrap>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Current status
          </Text>
          <Tag
            scheme={current.color === "green" ? "green" : current.color === "orange" ? "orange" : "neutral"}
            size="m"
            label={current.label}
          />
        </Row>

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="recent-activity">
          <Heading as="h2" id="recent-activity" variant="heading-strong-m">
            Recent activity
          </Heading>
          <Column gap="4">
            {ACTIVITY.map((item, index) => (
              <Column key={item.id} gap="4">
                {index > 0 && <Line />}
                <Row gap="12" vertical="center" paddingY="8">
                  <Row
                    width="32"
                    height="32"
                    radius="full"
                    background="neutral-alpha-weak"
                    center
                  >
                    <Icon name={item.icon} size="s" onBackground="neutral-medium" />
                  </Row>
                  <Column flex={1} gap="2">
                    <Text variant="body-default-s">{item.text}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {item.time}
                    </Text>
                  </Column>
                </Row>
              </Column>
            ))}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
