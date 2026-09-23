"use client";

import {
  BlobFx,
  Button,
  Column,
  CountFx,
  Heading,
  Line,
  Pulse,
  Row,
  Text,
} from "@once-ui-system/core";

export const Hero12 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column
      fillWidth
      horizontal="center"
      overflow="hidden"
      paddingTop="xl"
      paddingX="l"
      position="relative"
      {...flex}
    >
      <BlobFx position="absolute" top="0" translateY="50%" data-solid="inverse" />
      <Row
        s={{ hide: true }}
        position="absolute"
        bottom="24"
        left="0"
        style={{
          transform: "rotate(-90deg) translateY(calc(100% + 1.5rem))",
          transformOrigin: "left bottom",
        }}
      >
        <Row vertical="center" gap="8">
          <Pulse size="s" scheme="brand" />
          <Text variant="code-default-s" onBackground="brand-medium">
            Now shipping v3.0
          </Text>
        </Row>
      </Row>
      <Column maxWidth="l" fillWidth horizontal="center" gap="32" paddingBottom="xl">
        <Column maxWidth="m" gap="16" horizontal="center">
          <Heading variant="display-default-l" align="center" wrap="balance">
            Software that grows with your team<Text onBackground="brand-medium">.</Text>
          </Heading>
          <Text
            variant="heading-default-l"
            onBackground="neutral-weak"
            align="center"
            wrap="balance"
          >
            One workspace for planning, building, and shipping — built to stay simple no matter how
            big your team gets.
          </Text>
          <Row gap="12" paddingTop="8">
            <Button href="#" size="l" arrowIcon>
              Start for free
            </Button>
            <Button href="#" size="l" variant="secondary">
              Book a demo
            </Button>
          </Row>
        </Column>

        <Row fillWidth horizontal="center" gap="40" paddingTop="24">
          <Column gap="4" horizontal="center">
            <Heading variant="display-default-s">
              <CountFx value={28400} separator="," />+
            </Heading>
            <Text variant="label-default-s" onBackground="neutral-weak">
              teams onboard
            </Text>
          </Column>
          <Line vert height="40" background="neutral-alpha-weak" />
          <Column gap="4" horizontal="center">
            <Heading variant="display-default-s">
              <CountFx value={99} />%
            </Heading>
            <Text variant="label-default-s" onBackground="neutral-weak">
              uptime SLA
            </Text>
          </Column>
          <Line vert height="40" background="neutral-alpha-weak" />
          <Column gap="4" horizontal="center">
            <Heading variant="display-default-s">
              <CountFx value={4.9} decimals={1} />
              /5
            </Heading>
            <Text variant="label-default-s" onBackground="neutral-weak">
              average rating
            </Text>
          </Column>
        </Row>
      </Column>
    </Column>
  );
};
