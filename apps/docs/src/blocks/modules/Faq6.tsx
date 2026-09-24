"use client";

import {
  Accordion,
  Column,
  Heading,
  Icon,
  type IconName,
  Line,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

interface FaqCategory {
  id: string;
  label: string;
  icon: IconName;
  items: { title: string; content: string }[];
}

const categories: FaqCategory[] = [
  {
    id: "product",
    label: "Product",
    icon: "pages" as const,
    items: [
      {
        title: "What is Once UI?",
        content:
          "Once UI is a design system and component library for building modern web products with consistent tokens, layouts, and Pro blocks.",
      },
      {
        title: "What do I get with Pro?",
        content: "Pro unlocks 147+ copy-paste blocks, Stack, Orbit Core, and priority support.",
      },
      {
        title: "Can I use blocks in commercial projects?",
        content:
          "Yes. Pro blocks are licensed for unlimited commercial projects for you and your team.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: "payment" as const,
    items: [
      {
        title: "Is there a free trial?",
        content:
          "Every Pro plan includes a 14-day trial. No credit card required until you choose to continue.",
      },
      {
        title: "Can I switch plans later?",
        content:
          "Upgrades apply immediately. Downgrades take effect at the start of your next billing cycle.",
      },
      {
        title: "Do you offer refunds?",
        content:
          "Contact support within 14 days of purchase if Pro is not the right fit for your workflow.",
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: "help" as const,
    items: [
      {
        title: "How do I get help?",
        content:
          "Pro subscribers get priority Discord support. Open-source users can ask in the community channel.",
      },
      {
        title: "Do you offer implementation help?",
        content:
          "Yes. Our services team helps founders ship landing pages, dashboards, and full product frontends.",
      },
      {
        title: "Where is documentation?",
        content:
          "Full docs live at docs.once-ui.com, including guides for theming, blocks, and deployment.",
      },
    ],
  },
];

export const Faq6 = (flex: React.ComponentProps<typeof Column>) => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const active = categories.find((category) => category.id === activeCategory) ?? categories[0];

  return (
    <Column fillWidth horizontal="center" gap="48" {...flex}>
      <Column fillWidth maxWidth={48} gap="8" paddingX="l">
        <Heading as="h2" variant="display-strong-m" wrap="balance">
          Questions, answered
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          Browse by topic or jump straight to what you need to know before getting started.
        </Text>
      </Column>

      <Row fillWidth maxWidth="l" gap="24" paddingX="l" s={{ direction: "column" }}>
        <Column minWidth={16} maxWidth={20} gap="8">
          {categories.map((category) => (
            <Row
              key={category.id}
              fillWidth
              gap="12"
              padding="12"
              radius="l"
              border={activeCategory === category.id ? "brand-alpha-medium" : "neutral-alpha-weak"}
              background={activeCategory === category.id ? "brand-alpha-weak" : "transparent"}
              vertical="center"
              onClick={() => setActiveCategory(category.id)}
              cursor="interactive"
            >
              <Icon
                name={category.icon}
                size="s"
                onBackground={activeCategory === category.id ? "brand-medium" : "neutral-weak"}
              />
              <Column gap="2" flex={1}>
                <Text variant="label-default-s">{category.label}</Text>
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  {category.items.length} questions
                </Text>
              </Column>
            </Row>
          ))}
        </Column>

        <Line vert hide s={{ hide: true }} background="neutral-alpha-weak" />

        <Column fillWidth flex={1} gap="16">
          <Row gap="8" vertical="center">
            <Tag size="s" scheme="neutral">
              {active.label}
            </Tag>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {active.items.length} answers
            </Text>
          </Row>
          <Column fillWidth gap="8">
            {active.items.map((item) => (
              <Column key={item.title} fillWidth border radius="l" padding="4" background="overlay">
                <Accordion title={<Text variant="body-default-s">{item.title}</Text>}>
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {item.content}
                  </Text>
                </Accordion>
              </Column>
            ))}
          </Column>
        </Column>
      </Row>
    </Column>
  );
};
