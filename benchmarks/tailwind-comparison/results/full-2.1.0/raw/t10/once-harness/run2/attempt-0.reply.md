I have what I need. Design:

- **Header bar** with a product name and, on the right, the avatar trigger (`DropdownWrapper`, `placement="bottom-end"`) that opens a profile menu with identity, a 3-stat grid, quick actions and menu options.
- **Article body** with a byline using `Hover` (interactive hover card) for the author, showing the same pattern at a smaller scale. `touch="enable"` keeps it usable on phones.
- Toasts confirm actions. Follow state is real local state.

I'm using no avatar `src` (it falls back to initials via `value`), so nothing loads from the network.

```tsx
"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  Column,
  Dropdown,
  DropdownWrapper,
  Grid,
  Hover,
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

type Profile = {
  name: string;
  handle: string;
  initials: string;
  role: string;
  location: string;
  bio: string;
  stats: { label: string; value: string }[];
};

const profile: Profile = {
  name: "Maya Okafor",
  handle: "@mayaokafor",
  initials: "MO",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm interfaces for complicated tools. Currently leading the design system team at Fieldnote.",
  stats: [
    { label: "Projects", value: "42" },
    { label: "Followers", value: "12.8k" },
    { label: "Following", value: "318" },
  ],
};

type MenuItem = {
  value: string;
  label: string;
  icon: "person" | "settings" | "bookmark" | "bell" | "help";
  description?: string;
};

const menuItems: MenuItem[] = [
  { value: "profile", label: "View profile", icon: "person" },
  { value: "saved", label: "Saved articles", icon: "bookmark", description: "17 items" },
  { value: "notifications", label: "Notifications", icon: "bell", description: "3 unread" },
  { value: "settings", label: "Account settings", icon: "settings" },
  { value: "help", label: "Help & support", icon: "help" },
];

function StatGrid({ stats }: { stats: Profile["stats"] }) {
  return (
    <Grid columns="3" gap="8" fillWidth as="dl" margin="0">
      {stats.map((stat) => (
        <Column
          key={stat.label}
          background="neutral-alpha-weak"
          radius="m"
          paddingY="12"
          paddingX="8"
          horizontal="center"
          gap="4"
        >
          <Text as="dd" variant="heading-strong-m" style={{ margin: 0 }}>
            {stat.value}
          </Text>
          <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
            {stat.label}
          </Text>
        </Column>
      ))}
    </Grid>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [following, setFollowing] = useState(false);

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    addToast({
      variant: "success",
      message: next ? `You are now following ${profile.name}` : `You unfollowed ${profile.name}`,
    });
  };

  const handleSelect = (value: string) => {
    if (value === "signout") {
      addToast({ variant: "info", message: "You have been signed out (demo only)" });
      return;
    }
    const item = menuItems.find((entry) => entry.value === value);
    if (item) {
      addToast({ variant: "info", message: `${item.label} would open here` });
    }
  };

  const profileMenu = (
    <Dropdown minWidth={20} padding="4" onSelect={handleSelect}>
      <Column gap="4" fillWidth>
        <Column padding="12" gap="16" fillWidth>
          <Row gap="12" vertical="center">
            <Avatar
              value={profile.initials}
              size="l"
              statusIndicator={{ color: "green" }}
            />
            <Column gap="4" minWidth={0}>
              <Text variant="heading-strong-s">{profile.name}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {profile.handle}
              </Text>
            </Column>
          </Row>
          <Row gap="8" wrap vertical="center">
            <Tag size="s" scheme="brand" label="Pro plan" />
            <Row gap="4" vertical="center">
              <StatusIndicator size="s" color="green" ariaLabel="Online" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Online now
              </Text>
            </Row>
          </Row>
          <StatGrid stats={profile.stats} />
        </Column>

        <Line />

        <Column fillWidth gap="2" paddingY="4">
          {menuItems.map((item) => (
            <Option
              key={item.value}
              value={item.value}
              label={item.label}
              description={item.description}
              prefix={<Icon name={item.icon} size="s" onBackground="neutral-weak" />}
            />
          ))}
        </Column>

        <Line />

        <Column fillWidth paddingY="4">
          <Option
            value="signout"
            label="Sign out"
            danger
            prefix={<Icon name="logout" size="s" />}
          />
        </Column>
      </Column>
    </Dropdown>
  );

  const hoverCard = (
    <Column
      background="surface"
      border
      radius="l"
      shadow="l"
      padding="16"
      gap="16"
      width={22}
      maxWidth={22}
    >
      <Row gap="12" vertical="start">
        <Avatar value={profile.initials} size="l" />
        <Column gap="4" flex={1} minWidth={0}>
          <Text variant="heading-strong-s">{profile.name}</Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {profile.role}
          </Text>
          <Row gap="4" vertical="center">
            <Icon name="globe" size="xs" onBackground="neutral-weak" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {profile.location}
            </Text>
          </Row>
        </Column>
      </Row>
      <Text variant="body-default-s" onBackground="neutral-medium">
        {profile.bio}
      </Text>
      <StatGrid stats={profile.stats} />
      <Row gap="8">
        <Button
          size="s"
          fillWidth
          variant={following ? "secondary" : "primary"}
          prefixIcon={following ? "check" : "plus"}
          label={following ? "Following" : "Follow"}
          onClick={toggleFollow}
        />
        <Button
          size="s"
          fillWidth
          variant="secondary"
          prefixIcon="mail"
          label="Message"
          onClick={() =>
            addToast({ variant: "info", message: `Message composer for ${profile.name} would open here` })
          }
        />
      </Row>
    </Column>
  );

  return (
    <Column as="main" fillWidth minHeight="100vh">
      <Row
        as="header"
        fillWidth
        borderBottom
        background="surface"
        paddingX="16"
        paddingY="12"
        horizontal="center"
      >
        <Row fillWidth maxWidth="l" horizontal="between" vertical="center" gap="16">
          <Row gap="8" vertical="center">
            <Icon name="book" size="m" onBackground="brand-medium" />
            <Text variant="heading-strong-m">Fieldnote</Text>
          </Row>
          <Row gap="8" vertical="center">
            <Row s={{ hide: true }}>
              <IconButton
                icon="bell"
                variant="tertiary"
                tooltip="Notifications"
                aria-label="Notifications"
                onClick={() => addToast({ variant: "info", message: "You have 3 unread notifications" })}
              />
            </Row>
            <DropdownWrapper
              placement="bottom-end"
              onSelect={handleSelect}
              trigger={
                <Row
                  as="button"
                  aria-label={`Open account menu for ${profile.name}`}
                  aria-haspopup="menu"
                  padding="4"
                  radius="full"
                  background="transparent"
                  border="transparent"
                  cursor="pointer"
                  style={{ appearance: "none" }}
                >
                  <Avatar
                    value={profile.initials}
                    size="m"
                    statusIndicator={{ color: "green" }}
                  />
                </Row>
              }
              dropdown={profileMenu}
            />
          </Row>
        </Row>
      </Row>

      <Column fillWidth horizontal="center" paddingX="16" paddingY="48">
        <Column as="article" maxWidth="s" gap="24">
          <Column gap="12">
            <Tag size="m" scheme="accent" label="Design systems" />
            <Text as="h1" variant="display-strong-xs" wrap="balance">
              Why your design tokens need an owner, not a committee
            </Text>
          </Column>

          <Row gap="12" vertical="center" wrap>
            <Hover
              interactive
              delay={150}
              hideDelay={200}
              touch="enable"
              trigger={
                <Row
                  as="button"
                  gap="8"
                  vertical="center"
                  aria-label={`${profile.name}, author. Show profile preview`}
                  background="transparent"
                  border="transparent"
                  radius="m"
                  padding="4"
                  cursor="pointer"
                  style={{ appearance: "none" }}
                >
                  <Avatar value={profile.initials} size="s" />
                  <Text variant="label-strong-m">{profile.name}</Text>
                </Row>
              }
              overlay={hoverCard}
            />
            <Text variant="body-default-s" onBackground="neutral-weak">
              9 min read · Updated March 4
            </Text>
          </Row>

          <Line />

          <Column gap="16">
            <Text variant="body-default-l" onBackground="neutral-medium">
              Every team that has shipped a design system has watched the same thing happen: a token
              gets added for one screen, renamed for another, and quietly duplicated by a third.
              Within a year the palette has forty near-identical greys and nobody knows which one is
              safe to delete.
            </Text>
            <Text variant="body-default-l" onBackground="neutral-medium">
              The fix is rarely more process. It is a named owner who can say no, a short review
              window, and a changelog that people actually read. Committees optimise for consensus;
              owners optimise for a system that still makes sense in two years.
            </Text>
          </Column>

          <Column
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
          >
            <Text variant="heading-strong-s">Try it</Text>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Click the avatar in the header to open the account menu, or hover (or tap) the
              author&apos;s name above to preview their profile card. Both are fully keyboard
              accessible.
            </Text>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```