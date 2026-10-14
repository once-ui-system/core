"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Avatar,
  Background,
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
  StatusIndicator,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";

type Stat = { id: string; label: string; value: string; icon: IconName };
type Action = {
  value: string;
  label: string;
  icon: IconName;
  description?: string;
  message: string;
  danger?: boolean;
};

const profile = {
  name: "Maya Okafor",
  handle: "@mayaokafor",
  initials: "MO",
  role: "Staff Product Designer",
  team: "Northwind Studio",
  location: "Lisbon, Portugal",
  bio: "Design systems, accessible interfaces and calm dashboards. Currently shipping the Northwind component library.",
  completion: 82,
};

const stats: Stat[] = [
  { id: "projects", label: "Projects", value: "24", icon: "folder" },
  { id: "followers", label: "Followers", value: "3.2k", icon: "person" },
  { id: "reviews", label: "Reviews", value: "187", icon: "chat" },
];

const primaryActions: Action[] = [
  {
    value: "profile",
    label: "View profile",
    icon: "person",
    description: "See how others see you",
    message: "Opening your public profile",
  },
  {
    value: "edit",
    label: "Edit profile",
    icon: "edit",
    description: "Photo, bio and links",
    message: "Profile editor opened",
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: "bell",
    description: "3 unread",
    message: "You have 3 unread notifications",
  },
];

const secondaryActions: Action[] = [
  { value: "settings", label: "Account settings", icon: "settings", message: "Opening settings" },
  { value: "billing", label: "Billing & plan", icon: "payment", message: "Opening billing" },
  { value: "help", label: "Help center", icon: "help", message: "Opening the help center" },
];

const signOut: Action = {
  value: "signout",
  label: "Sign out",
  icon: "logout",
  message: "You have been signed out (demo)",
  danger: true,
};

const recentActivity: { id: string; text: string; time: string; icon: IconName }[] = [
  { id: "a1", text: "Published “Form patterns v2” to the library", time: "2h ago", icon: "upload" },
  { id: "a2", text: "Reviewed 4 pull requests on Tokens", time: "Yesterday", icon: "check" },
  { id: "a3", text: "Commented on “Empty states audit”", time: "Mon", icon: "chat" },
];

const ActionOption = ({
  action,
  onAction,
}: {
  action: Action;
  onAction: (action: Action) => void;
}) => (
  <Option
    value={action.value}
    label={action.label}
    description={action.description}
    danger={action.danger}
    onClick={() => onAction(action)}
    prefix={
      <Icon
        name={action.icon}
        size="s"
        padding="4"
        onBackground={action.danger ? "danger-weak" : "neutral-weak"}
      />
    }
  />
);

const StatCell = ({ stat }: { stat: Stat }) => (
  <Column
    as="li"
    fillWidth
    horizontal="center"
    gap="4"
    paddingY="12"
    paddingX="8"
    background="neutral-alpha-weak"
    radius="m"
    style={{ listStyle: "none" }}
  >
    <Text variant="heading-strong-m">{stat.value}</Text>
    <Row gap="4" vertical="center" onBackground="neutral-weak">
      <Icon name={stat.icon} size="xs" />
      <Text variant="label-default-xs">{stat.label}</Text>
    </Row>
  </Column>
);

const PopoverBody = ({ onAction }: { onAction: (action: Action) => void }) => (
  <Column minWidth={20} maxWidth={22} fitHeight background="surface" overflow="hidden">
    <Column fillWidth padding="16" gap="16">
      <Background
        position="absolute"
        top="0"
        left="0"
        fill
        pointerEvents="none"
        gradient={{
          display: true,
          colorStart: "brand-alpha-medium",
          colorEnd: "static-transparent",
          x: 50,
          y: 0,
          width: 200,
          height: 100,
          opacity: 50,
        }}
      />
      <Row gap="12" vertical="center" zIndex={1}>
        <Avatar value={profile.initials} size="l" statusIndicator={{ color: "green" }} />
        <Column gap="2" flex={1}>
          <Text variant="heading-strong-s" truncate>
            {profile.name}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
            {profile.role}
          </Text>
        </Column>
        <Tag scheme="brand" size="s" label="Pro" />
      </Row>
      <Grid as="ul" columns="3" gap="8" zIndex={1} margin="0" padding="0" aria-label="Profile stats">
        {stats.map((stat) => (
          <StatCell key={stat.id} stat={stat} />
        ))}
      </Grid>
      <Column gap="8" zIndex={1}>
        <Row horizontal="between" vertical="center">
          <Text variant="label-default-s">Profile completion</Text>
          <Text variant="label-strong-s">{profile.completion}%</Text>
        </Row>
        <ProgressBar value={profile.completion} showLabel={false} />
      </Column>
    </Column>
    <Line />
    <Column fillWidth padding="4" gap="2">
      {primaryActions.map((action) => (
        <ActionOption key={action.value} action={action} onAction={onAction} />
      ))}
    </Column>
    <Line />
    <Column fillWidth padding="4" gap="2">
      {secondaryActions.map((action) => (
        <ActionOption key={action.value} action={action} onAction={onAction} />
      ))}
    </Column>
    <Line />
    <Column fillWidth padding="4">
      <ActionOption action={signOut} onAction={onAction} />
    </Column>
  </Column>
);

export default function Page() {
  const { addToast } = useToast();
  const [following, setFollowing] = useState(false);

  const handleAction = (action: Action) => {
    addToast({
      variant: action.danger ? "warning" : "info",
      message: action.message,
    });
  };

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    addToast({
      variant: "success",
      message: next ? `You are now following ${profile.name}` : `Unfollowed ${profile.name}`,
    });
  };

  return (
    <Column fillWidth minHeight="100vh">
      <Row
        as="header"
        fillWidth
        height="64"
        paddingX="l"
        s={{ paddingX: "16" }}
        vertical="center"
        horizontal="between"
        borderBottom
        background="surface"
      >
        <Row gap="12" vertical="center">
          <Row
            width="32"
            height="32"
            radius="m"
            center
            solid="brand-strong"
            onSolid="brand-strong"
            aria-hidden="true"
          >
            <Icon name="organization" size="s" />
          </Row>
          <Text variant="label-strong-m">Northwind Studio</Text>
        </Row>
        <Row gap="8" vertical="center">
          <IconButton
            icon="search"
            variant="tertiary"
            tooltip="Search"
            ariaLabel="Search"
          />
          <IconButton icon="bell" variant="tertiary" tooltip="Notifications" ariaLabel="Notifications" />
          <DropdownWrapper
            placement="bottom-end"
            dropdownId="profile-popover"
            trigger={
              <IconButton
                variant="ghost"
                rounded
                ariaLabel={`Account menu for ${profile.name}`}
                tooltip="Account"
                tooltipPosition="bottom"
              >
                <Avatar value={profile.initials} size="s" statusIndicator={{ color: "green" }} />
              </IconButton>
            }
            dropdown={<PopoverBody onAction={handleAction} />}
          />
        </Row>
      </Row>

      <Column as="main" fillWidth horizontal="center" paddingX="l" paddingY="48" s={{ paddingX: "16", paddingY: "24" }}>
        <Column maxWidth="m" gap="32">
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Account
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Your profile at a glance
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Select the avatar in the top right to open the account popover with your stats and
              quick actions. It opens with the keyboard too: focus the avatar, press Enter, then use
              the arrow keys and Escape.
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="24" s={{ padding: "16" }}>
            <Row gap="16" vertical="center" wrap>
              <Avatar value={profile.initials} size="xl" statusIndicator={{ color: "green" }} />
              <Column gap="4" flex={1} minWidth={12}>
                <Row gap="8" vertical="center" wrap>
                  <Heading as="h2" variant="heading-strong-l">
                    {profile.name}
                  </Heading>
                  <Tag scheme="brand" size="s" label="Pro" />
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {profile.handle} · {profile.role} at {profile.team}
                </Text>
                <Row gap="4" vertical="center" onBackground="neutral-weak">
                  <Icon name="globe" size="xs" />
                  <Text variant="body-default-xs">{profile.location}</Text>
                  <Row marginLeft="8" gap="4" vertical="center">
                    <StatusIndicator size="s" color="green" ariaLabel="Online" />
                    <Text variant="body-default-xs">Online</Text>
                  </Row>
                </Row>
              </Column>
              <Button
                variant={following ? "secondary" : "primary"}
                size="m"
                prefixIcon={following ? "check" : "plus"}
                label={following ? "Following" : "Follow"}
                onClick={toggleFollow}
                aria-pressed={following}
              />
            </Row>

            <Text variant="body-default-m" onBackground="neutral-medium">
              {profile.bio}
            </Text>

            <Grid as="ul" columns="3" gap="12" margin="0" padding="0" s={{ columns: 1 }} aria-label="Profile statistics">
              {stats.map((stat) => (
                <StatCell key={stat.id} stat={stat} />
              ))}
            </Grid>
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
                  fillWidth
                  gap="12"
                  padding="16"
                  vertical="center"
                  borderTop={index > 0}
                >
                  <Row
                    width="32"
                    height="32"
                    radius="full"
                    center
                    background="neutral-alpha-weak"
                    onBackground="neutral-medium"
                    aria-hidden="true"
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Text variant="body-default-s" flex={1}>
                    {item.text}
                  </Text>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
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
