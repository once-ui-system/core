"use client";

import {
  Avatar,
  Button,
  Card,
  Column,
  Heading,
  Icon,
  Line,
  Row,
  Switch,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const navItems = [
  { label: "Notifications", value: "notifications", icon: "bell" },
  { label: "Billing", value: "billing", icon: "banknotes" },
  { label: "Privacy", value: "privacy", icon: "security" },
] as const;

const notificationGroups = [
  {
    title: "Product updates",
    description: "Release notes, changelog, and feature announcements",
    enabled: true,
  },
  {
    title: "Community activity",
    description: "Replies, mentions, and space invitations",
    enabled: true,
  },
  {
    title: "Billing reminders",
    description: "Invoices, renewals, and payment confirmations",
    enabled: false,
  },
  {
    title: "Marketing",
    description: "Tips, events, and partner offers",
    enabled: false,
  },
];

const privacyGroups = [
  {
    title: "Public profile",
    description: "Allow others to discover your profile in search",
    enabled: true,
  },
  {
    title: "Activity status",
    description: "Show when you were last active",
    enabled: false,
  },
  {
    title: "Analytics",
    description: "Share anonymous usage data to improve Once UI",
    enabled: true,
  },
];

export const Settings3 = (flex: React.ComponentProps<typeof Row>) => {
  const [section, setSection] = useState<(typeof navItems)[number]["value"]>("notifications");
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      [...notificationGroups, ...privacyGroups].map((item) => [item.title, item.enabled]),
    ),
  );

  const activeGroups = section === "privacy" ? privacyGroups : notificationGroups;

  return (
    <Row fill radius="l" overflow="hidden" gap="8" {...flex}>
      <Column
        minWidth={24}
        maxWidth={24}
        fill
        background="surface"
        border="surface"
        overflowY="auto"
        m={{ hide: true }}
      >
        <Column fillWidth paddingX="24" paddingY="24" gap="4" borderBottom>
          <Heading variant="heading-strong-l">Account</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Notifications, billing, and privacy controls
          </Text>
        </Column>
        <Column fillWidth padding="12" gap="4">
          {navItems.map((item) => (
            <Button
              key={item.value}
              fillWidth
              size="m"
              variant={section === item.value ? "primary" : "tertiary"}
              prefixIcon={item.icon}
              onClick={() => setSection(item.value)}
              horizontal="start"
            >
              {item.label}
            </Button>
          ))}
        </Column>
      </Column>

      <Column fill background="page" overflowY="auto">
        <Column maxWidth="s" fillWidth padding="32" gap="24">
          {section !== "billing" && (
            <>
              <Column gap="8">
                <Heading variant="heading-strong-xl">
                  {section === "notifications" ? "Notifications" : "Privacy"}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Choose what you want to hear about and what stays private.
                </Text>
              </Column>
              <Column fillWidth gap="12">
                {activeGroups.map((item) => (
                  <Card
                    key={item.title}
                    fillWidth
                    padding="16"
                    radius="l"
                    border
                    background="surface"
                  >
                    <Row fillWidth horizontal="between" vertical="center" gap="16">
                      <Column gap="4" flex={1}>
                        <Text variant="label-strong-s">{item.title}</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {item.description}
                        </Text>
                      </Column>
                      <Switch
                        checked={toggles[item.title]}
                        onToggle={() =>
                          setToggles((prev) => ({
                            ...prev,
                            [item.title]: !prev[item.title],
                          }))
                        }
                      />
                    </Row>
                  </Card>
                ))}
              </Column>
            </>
          )}

          {section === "billing" && (
            <>
              <Column gap="8">
                <Heading variant="heading-strong-xl">Billing</Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Manage your subscription, payment method, and invoices.
                </Text>
              </Column>

              <Card fillWidth padding="20" radius="l" border background="surface">
                <Column gap="16">
                  <Row fillWidth horizontal="between" vertical="center">
                    <Column gap="4">
                      <Text variant="label-strong-s">Pro plan</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Renews on Aug 19, 2026
                      </Text>
                    </Column>
                    <Text variant="heading-strong-m">$149/yr</Text>
                  </Row>
                  <Line />
                  <Row gap="12" vertical="center">
                    <Row
                      minWidth="48"
                      minHeight="32"
                      radius="m"
                      center
                      solid="brand-strong"
                      onSolid="brand-strong"
                    >
                      <Icon name="payment" size="s" />
                    </Row>
                    <Column gap="2" flex={1}>
                      <Text variant="label-strong-s">Visa ending in 4242</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        Expires 09/28
                      </Text>
                    </Column>
                    <Button size="s" variant="secondary">
                      Update
                    </Button>
                  </Row>
                </Column>
              </Card>

              <Column gap="12">
                <Text variant="heading-strong-s">Recent invoices</Text>
                {[
                  { date: "Jul 19, 2026", amount: "$149.00", status: "Paid" },
                  { date: "Jul 19, 2025", amount: "$149.00", status: "Paid" },
                  { date: "Jul 19, 2024", amount: "$129.00", status: "Paid" },
                ].map((invoice) => (
                  <Card
                    key={invoice.date}
                    fillWidth
                    padding="16"
                    radius="l"
                    border
                    background="surface"
                  >
                    <Row fillWidth horizontal="between" vertical="center" gap="16">
                      <Row gap="12" vertical="center">
                        <Avatar size="s" value={invoice.date.charAt(0)} />
                        <Column gap="2">
                          <Text variant="label-strong-s">{invoice.date}</Text>
                          <Text variant="body-default-xs" onBackground="neutral-weak">
                            Annual subscription
                          </Text>
                        </Column>
                      </Row>
                      <Row gap="12" vertical="center">
                        <Text variant="label-strong-s">{invoice.amount}</Text>
                        <Text variant="label-default-s" onBackground="success-medium">
                          {invoice.status}
                        </Text>
                        <Button size="s" variant="tertiary" prefixIcon="download" />
                      </Row>
                    </Row>
                  </Card>
                ))}
              </Column>
            </>
          )}
        </Column>
      </Column>
    </Row>
  );
};
