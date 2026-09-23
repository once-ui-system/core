"use client";

import { Accordion, Column, Heading, Icon, Input, Row, Tag, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";

interface FaqEntry {
  title: string;
  content: string;
  topic: string;
}

const topics = ["Billing", "Onboarding", "Security", "Integrations"];

const faqItems: FaqEntry[] = [
  {
    title: "Can I switch plans at any time?",
    content:
      "Yes. Upgrades apply immediately and downgrades take effect at the start of your next billing cycle, so you never lose access mid-month.",
    topic: "Billing",
  },
  {
    title: "Do you offer a free trial?",
    content:
      "Every plan starts with a 14-day trial, no credit card required until you decide to continue.",
    topic: "Billing",
  },
  {
    title: "How long does setup take?",
    content:
      "Most teams are fully onboarded in under an hour. Import your existing data with our guided setup wizard and invite teammates whenever you're ready.",
    topic: "Onboarding",
  },
  {
    title: "Can I import data from another tool?",
    content:
      "We support CSV imports and direct migrations from most popular platforms via our import assistant.",
    topic: "Onboarding",
  },
  {
    title: "Is my data encrypted?",
    content:
      "All data is encrypted in transit and at rest. We run regular third-party audits and maintain SOC 2 Type II compliance.",
    topic: "Security",
  },
  {
    title: "Do you support single sign-on?",
    content:
      "SAML and OAuth-based SSO are available on Team and Enterprise plans, with SCIM provisioning on request.",
    topic: "Security",
  },
  {
    title: "Which tools can I connect?",
    content:
      "Native integrations cover Slack, Notion, Linear, and GitHub, plus a public API and webhooks for anything custom.",
    topic: "Integrations",
  },
  {
    title: "Is there a Zapier integration?",
    content:
      "Yes, our Zapier app supports both triggers and actions so you can automate workflows without writing code.",
    topic: "Integrations",
  },
];

export const Faq5 = (flex: React.ComponentProps<typeof Column>) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return faqItems;
    return faqItems.filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) ||
        item.content.toLowerCase().includes(normalized) ||
        item.topic.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <Column fillWidth horizontal="center" gap="32" {...flex}>
      <Column fillWidth maxWidth="xs" horizontal="center" gap="8" align="center">
        <Heading as="h2" variant="display-strong-s" align="center">
          Frequently asked questions
        </Heading>
        <Text onBackground="neutral-medium" variant="body-default-l" align="center">
          Search our knowledge base or browse by topic.
        </Text>
      </Column>
      <Column fillWidth maxWidth="s" gap="16">
        <Input
          id="faq-search"
          placeholder="Search questions..."
          value={query}
          prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Row fillWidth gap="8" wrap>
          {topics.map((topic) => (
            <Tag
              key={topic}
              size="l"
              scheme={query.toLowerCase() === topic.toLowerCase() ? "brand" : "neutral"}
              onClick={() => setQuery(query.toLowerCase() === topic.toLowerCase() ? "" : topic)}
              style={{ cursor: "pointer" }}
            >
              {topic}
            </Tag>
          ))}
        </Row>
        {filtered.length > 0 ? (
          <Column fillWidth gap="8">
            {filtered.map((item) => (
              <Column key={item.title} fillWidth border radius="l" padding="4" background="overlay">
                <Accordion title={<Text variant="body-default-s">{item.title}</Text>}>
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {item.content}
                  </Text>
                </Accordion>
              </Column>
            ))}
          </Column>
        ) : (
          <Column fillWidth border radius="l" padding="40" gap="8" horizontal="center">
            <Icon name="search" size="m" onBackground="neutral-weak" />
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              No questions found for "{query}"
            </Text>
          </Column>
        )}
      </Column>
    </Column>
  );
};
