"use client";

import {
  Accordion,
  AvatarGroup,
  Background,
  Button,
  Column,
  Heading,
  Icon,
  Line,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";

const faqSections = [
  {
    label: "Getting started",
    items: [
      {
        title: "How quickly can I ship a landing page?",
        content:
          "Most teams copy a Hero, Features, and Pricing block into a Next.js app and have a polished page live within a day.",
      },
      {
        title: "Do blocks work with my existing theme?",
        content:
          "Yes. Blocks inherit semantic tokens from ThemeProvider, so brand colors, borders, and typography adapt automatically.",
      },
    ],
  },
  {
    label: "Pro & licensing",
    items: [
      {
        title: "What does Pro include?",
        content:
          "Pro unlocks 150+ blocks, Stack, Orbit Core, registry CLI access, and priority support.",
      },
      {
        title: "Can my whole team use Pro blocks?",
        content:
          "Team licenses cover unlimited commercial projects for everyone on your plan — no per-seat block limits.",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        title: "How fast do you respond?",
        content:
          "Pro subscribers get priority Discord support with a median first response under four hours on weekdays.",
      },
      {
        title: "Do you help with implementation?",
        content:
          "Our services team ships landing pages, dashboards, and full product frontends for founders who want a done-for-you build.",
      },
    ],
  },
];

const supportTeam = [
  { name: "Lorant", avatar: "/images/creators/lorant.jpg" },
  { name: "Justin", avatar: "/images/creators/justin.jpg" },
  { name: "Suhaib", avatar: "/images/creators/suhaib.jpg" },
];

export const Faq7 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" paddingX="l" {...flex}>
      <Row fillWidth maxWidth="l" gap="32" s={{ direction: "column" }} vertical="start">
        <Column
          minWidth={18}
          maxWidth={22}
          gap="24"
          padding="24"
          radius="xl"
          border="neutral-alpha-medium"
          overflow="hidden"
        >
          <Background
            position="absolute"
            fill
            gradient={{
              display: true,
              x: 0,
              y: 100,
              width: 100,
              height: 100,
              colorStart: "brand-background-medium",
              colorEnd: "static-transparent",
            }}
          />
          <Column gap="8">
            <Tag size="s" scheme="brand">
              Support
            </Tag>
            <Heading as="h2" variant="display-strong-s" wrap="balance">
              Still have questions?
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
              Our team helps founders pick blocks, wire themes, and ship production-ready pages.
            </Text>
          </Column>

          <Column gap="12">
            <Row gap="8" vertical="center">
              <AvatarGroup
                size="s"
                avatars={supportTeam.map((member) => ({ src: member.avatar }))}
              />
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Avg. response &lt; 4h
              </Text>
            </Row>
            <Button suffixIcon="chevronRight" fillWidth>
              Contact support
            </Button>
            <Button variant="secondary" fillWidth prefixIcon="discord">
              Join Discord
            </Button>
          </Column>

          <Line background="neutral-alpha-weak" />

          <Column gap="12">
            {[
              { icon: "book" as const, label: "Documentation", href: "#" },
              { icon: "cam" as const, label: "Video walkthroughs", href: "#" },
              { icon: "calendar" as const, label: "Book a call", href: "#" },
            ].map((link) => (
              <Row key={link.label} gap="12" vertical="center" cursor="interactive">
                <Icon name={link.icon} size="s" onBackground="brand-medium" />
                <Text variant="label-default-s">{link.label}</Text>
              </Row>
            ))}
          </Column>
        </Column>

        <Column fillWidth flex={1} gap="32">
          <Column gap="8">
            <Heading as="h2" variant="display-default-s" wrap="balance">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Everything you need to know before copying your first block.
            </Text>
          </Column>

          {faqSections.map((section, sectionIndex) => (
            <Column key={section.label} fillWidth gap="12">
              <Row gap="12" vertical="center">
                <Text variant="code-default-s" onBackground="brand-weak">
                  {String(sectionIndex + 1).padStart(2, "0")}
                </Text>
                <Heading variant="heading-strong-s">{section.label}</Heading>
              </Row>
              <Column fillWidth gap="8">
                {section.items.map((item) => (
                  <Column
                    key={item.title}
                    fillWidth
                    border
                    radius="l"
                    padding="4"
                    background="overlay"
                  >
                    <Accordion title={<Text variant="body-default-s">{item.title}</Text>}>
                      <Text variant="body-default-s" onBackground="neutral-medium">
                        {item.content}
                      </Text>
                    </Accordion>
                  </Column>
                ))}
              </Column>
            </Column>
          ))}
        </Column>
      </Row>
    </Column>
  );
};
