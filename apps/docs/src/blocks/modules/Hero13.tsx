"use client";

import {
  Background,
  Badge,
  Button,
  Column,
  Heading,
  InlineCode,
  Line,
  Media,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";

export const Hero13 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" paddingX="l" paddingY="xl" overflow="hidden" {...flex}>
      <Background
        position="absolute"
        top="0"
        left="0"
        gradient={{
          display: true,
          x: 50,
          y: 0,
          width: 80,
          height: 60,
          colorStart: "brand-background-medium",
        }}
      />
      <Row
        fillWidth
        maxWidth="xl"
        gap="48"
        vertical="center"
        m={{ direction: "column" }}
        position="relative"
      >
        <Column fill gap="24" maxWidth={48}>
          <Badge
            background="overlay"
            paddingLeft="8"
            paddingRight="20"
            border="brand-alpha-medium"
            paddingY="8"
            data-border="rounded"
          >
            <Row vertical="center" gap="8">
              <Tag scheme="brand" size="s">
                Pro
              </Tag>
              <Text variant="code-default-s" onBackground="brand-medium">
                140+ copy-paste blocks
              </Text>
            </Row>
          </Badge>
          <Heading variant="display-default-l" wrap="balance">
            Ship polished interfaces without reinventing layout every sprint
            <Text onBackground="brand-medium">.</Text>
          </Heading>
          <Text variant="heading-default-l" onBackground="neutral-weak" wrap="balance">
            Compose pages with semantic <InlineCode>Row</InlineCode>,{" "}
            <InlineCode>Column</InlineCode>, and production-ready Pro blocks — then customize
            everything from a single theme file.
          </Text>
          <Row gap="12" paddingTop="8" wrap>
            <Button href="#" size="l" arrowIcon>
              Browse blocks
            </Button>
            <Row padding="4" radius="l" overflow="hidden">
              <Background
                data-solid="color"
                fill
                position="absolute"
                gradient={{
                  display: true,
                  colorStart: "brand-solid-strong",
                  colorEnd: "accent-solid-weak",
                }}
                mask={{ cursor: true, radius: 20 }}
              />
              <Row background="page" radius="l">
                <Button href="#" size="l" variant="secondary">
                  View docs
                </Button>
              </Row>
            </Row>
          </Row>
        </Column>

        <Column fill horizontal="center">
          <Row
            fillWidth
            maxWidth={48}
            radius="xl"
            border="brand-alpha-weak"
            overflow="hidden"
            background="page"
            position="relative"
          >
            <Column fill borderRight="brand-alpha-weak" m={{ hide: true }}>
              <Row flex={1} borderBottom="brand-alpha-weak" />
              <Row flex={2} borderBottom="brand-alpha-weak" />
              <Row flex={1} />
            </Column>
            <Column fill padding="4">
              <Media
                fillWidth
                sizes="(max-width: 768px) 100vw, 560px"
                src="/images/products/studio-04.jpg"
                alt="Dashboard preview"
                aspectRatio="4 / 3"
                radius="l"
                border
              />
            </Column>
          </Row>
          <Row fillWidth maxWidth={48} paddingTop="12" gap="8" vertical="center">
            <Line flex={1} background="neutral-alpha-weak" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              Built with Once UI Pro
            </Text>
            <Line flex={1} background="neutral-alpha-weak" />
          </Row>
        </Column>
      </Row>
    </Column>
  );
};
