import { Background, Column, Heading, Row, type SpacingToken, Text } from "@once-ui-system/core";
import type { ReactNode } from "react";

type StickyCard = {
  title?: string;
  description?: ReactNode;
  paddingX?: SpacingToken;
  paddingTop?: SpacingToken;
};

const stickyCards: StickyCard[] = [
  {
    title: "Startups are ditching the $5k design subscription model.",
    description: "They don’t need more screens. They need systems.",
    paddingX: "32",
  },
  {
    title: "Modern products are no longer single websites. They are ecosystems.",
    description: "Landing page. Dashboard. Documentation. Community. Brand. All moving at once.",
    paddingX: "24",
    paddingTop: "8",
  },
  {
    title: "This only works with a system. Not tools. Not prompts.",
    paddingX: "16",
    paddingTop: "16",
  },
  {
    title: "Once UI is that system.",
    paddingX: "8",
    paddingTop: "24",
  },
  {
    title: "You’re not selling design anymore. You’re selling a digital business.",
    description:
      "Based on pre-built, deployment-ready app skeletons. Just customize, deploy, and scale.",
    paddingX: "0",
    paddingTop: "32",
  },
];

export const Features12 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth gap="64" {...flex}>
      {stickyCards.map((card, index) => (
        <Row
          key={index}
          fillWidth
          position="sticky"
          top="0"
          paddingTop={card.paddingTop}
          paddingX={card.paddingX}
        >
          <Row
            fillWidth
            height="80dvh"
            radius="l"
            border
            maxHeight={44}
            center
            align="center"
            gap="xl"
            background="page"
            overflow="hidden"
            s={{ direction: "column" }}
          >
            <Background
              data-solid="color"
              position="absolute"
              left="0"
              top="0"
              fill
              gradient={{
                display: true,
                colorStart: "brand-solid-weak",
                x: 40,
                y: 100,
                width: 75,
                height: 75,
              }}
            />
            <Background
              position="absolute"
              left="0"
              top="0"
              fill
              gradient={{
                display: true,
                colorStart: "accent-solid-weak",
                x: 60,
                y: 100,
                width: 75,
                height: 75,
              }}
            />
            <Column fillWidth center padding="xl">
              <Column maxWidth="m" gap="24">
                <Heading as="h2" variant="display-strong-m">
                  {card.title}
                </Heading>
                <Text onBackground="neutral-weak" variant="heading-default-xl" wrap="balance">
                  {card.description}
                </Text>
              </Column>
            </Column>
          </Row>
        </Row>
      ))}
    </Column>
  );
};
