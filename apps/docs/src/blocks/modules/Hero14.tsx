"use client";

import {
  Avatar,
  Background,
  Badge,
  Button,
  Card,
  Column,
  CompareImage,
  Heading,
  InlineCode,
  Media,
  Row,
  Tag,
  Text,
  TiltFx,
} from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";

export const Hero14 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column
      fillWidth
      horizontal="center"
      paddingX="l"
      gap="48"
      paddingBottom="xl"
      paddingTop="l"
      {...flex}
    >
      <Column maxWidth="xl" gap="56" horizontal="center">
        <Column maxWidth="l" gap="24" paddingX="s" paddingBottom="l" paddingTop="m">
          <Badge
            background="overlay"
            paddingLeft="8"
            paddingRight="20"
            border="brand-alpha-medium"
            paddingY="8"
            href="#"
            data-border="rounded"
          >
            <Row vertical="center">
              <Tag scheme="brand">v1.7</Tag>
              <Row
                marginLeft="12"
                textVariant="code-default-xs"
                onBackground="brand-medium"
                gap="8"
                vertical="center"
              >
                Discover what&apos;s new
              </Row>
            </Row>
          </Badge>
          <Heading variant="display-default-xl" marginTop="8" wrap="balance">
            Write 70% less code with human-readable, machine-writable syntax
            <Text onBackground="brand-medium">.</Text>
          </Heading>
          <Text wrap="balance" variant="heading-default-l" onBackground="neutral-weak">
            Build semantic layouts with <InlineCode>Row</InlineCode>,{" "}
            <InlineCode>Column</InlineCode> and <InlineCode>Grid</InlineCode>. Add 100+ pre-styled
            components. Manage themes in a single file.
          </Text>
          <Row
            gap="16"
            data-border="rounded"
            vertical="center"
            paddingTop="16"
            paddingLeft="8"
            wrap
          >
            <Button href="#" size="l">
              View docs
            </Button>
            <Row center padding="2" overflow="hidden" radius="l-4">
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
                <Button href="#" variant="secondary" size="l">
                  Discover Pro
                </Button>
              </Row>
            </Row>
          </Row>
        </Column>

        <CompareImage
          data-solid="inverse"
          border="brand-alpha-medium"
          radius="xl"
          overflow="hidden"
          s={{ style: { aspectRatio: "3 / 4" } }}
          xs={{ style: { aspectRatio: "3 / 5" } }}
          rightContent={{
            src: (
              <Row fillWidth background="page" center>
                <Background
                  position="absolute"
                  top="0"
                  left="0"
                  gradient={{ display: true, x: 0, y: 100, colorStart: "brand-solid-medium" }}
                />
                <Column fill m={{ hide: true }} borderRight="brand-alpha-weak">
                  <Row flex={1}>
                    <Row flex={1} />
                    <Row maxWidth={24} borderX="brand-alpha-weak" />
                    <Row flex={1} />
                  </Row>
                  <Row flex={1} borderY="brand-alpha-weak">
                    <Row flex={1} />
                    <Row
                      maxWidth={24}
                      borderX="brand-alpha-weak"
                      center
                      textVariant="code-default-s"
                      onBackground="brand-weak"
                      padding="l"
                    >
                      Build once. Reuse infinitely.
                    </Row>
                    <Row flex={1} />
                  </Row>
                  <Row flex={1}>
                    <Row flex={1} />
                    <Row maxWidth={24} borderX="brand-alpha-weak" />
                    <Row flex={1} />
                  </Row>
                </Column>
                <Column fill>
                  <Row flex={1}>
                    <Row flex={1} />
                    <Row maxWidth={24} borderX="brand-alpha-weak" />
                    <Row flex={1} />
                  </Row>
                  <Row flex={1} borderY="brand-alpha-weak">
                    <Row flex={1} />
                    <Row maxWidth={24} borderX="brand-alpha-weak">
                      <Row fillWidth padding="4">
                        <TiltFx>
                          <Row
                            fillWidth
                            data-scaling="110"
                            radius="l"
                            background="overlay"
                            style={{ backdropFilter: "blur(0.125rem)" }}
                          >
                            <Card
                              fillWidth
                              padding="4"
                              radius="l"
                              direction="column"
                              border
                              background="transparent"
                            >
                              <Row fillWidth paddingX="20" paddingY="12" gap="12" vertical="center">
                                <Avatar size="xs" src="/images/creators/lorant.jpg" />
                                <Text variant="label-default-s">Lorant One</Text>
                              </Row>
                              <Media
                                border
                                sizes="400px"
                                fillWidth
                                aspectRatio="16 / 9"
                                radius="l"
                                alt="Product preview"
                                src="/images/og/home.jpg"
                              />
                              <Column
                                fillWidth
                                paddingX="24"
                                paddingTop="32"
                                paddingBottom="20"
                                gap="12"
                              >
                                <Heading as="h2" variant="body-default-xl">
                                  Your AI hallucinates. Let Once UI fix it.
                                </Heading>
                                <Text onBackground="neutral-weak" wrap="balance">
                                  Coding agents are only as strong as their context window.
                                  Don&apos;t fill it up with obscure spaghetti code.
                                </Text>
                                <Row gap="8" paddingTop="8">
                                  <Button
                                    prefixIcon="heartFilled"
                                    variant="tertiary"
                                    weight="default"
                                    size="s"
                                  >
                                    1.4k
                                  </Button>
                                  <Button
                                    prefixIcon="chat"
                                    variant="tertiary"
                                    weight="default"
                                    size="s"
                                  >
                                    256
                                  </Button>
                                </Row>
                              </Column>
                            </Card>
                          </Row>
                        </TiltFx>
                      </Row>
                    </Row>
                    <Row flex={1} />
                  </Row>
                  <Row flex={1}>
                    <Row flex={1} />
                    <Row maxWidth={24} borderX="brand-alpha-weak" />
                    <Row flex={1} />
                  </Row>
                </Column>
              </Row>
            ),
          }}
          leftContent={{
            src: (
              <CodeBlock
                fillHeight
                compact
                paddingX="16"
                paddingY="20"
                background="page"
                border="transparent"
                vertical="start"
                copyButton={false}
                codes={[
                  {
                    language: "tsx",
                    label: "Example code",
                    code: `<TiltFx>
  <Card fillWidth direction="column" padding="4" radius="l" border>
    <Row fillWidth vertical="center" paddingX="20" paddingY="12" gap="12">
      <Avatar size="xs" src="/avatar.jpg"/>
      <Text variant="label-default-s">Lorant One</Text>
    </Row>
    <Media
      border
      sizes="400px"
      fillWidth
      aspectRatio="16 / 9"
      radius="l"
      src="/cover.jpg"
    />
    <Column fillWidth paddingX="24" paddingTop="32" paddingBottom="20" gap="12">
      <Heading as="h2" variant="body-default-xl">
        Your AI hallucinates. Let Once UI fix it.
      </Heading>
      <Text onBackground="neutral-weak" wrap="balance">
        Coding agents are only as strong as their context window.
      </Text>
      <Row gap="8" paddingTop="8">
        <Button variant="tertiary" size="s" prefixIcon="heart">1.4k</Button>
        <Button variant="tertiary" size="s" prefixIcon="chat">256</Button>
      </Row>
    </Column>
  </Card>
</TiltFx>`,
                  },
                ]}
              />
            ),
          }}
        />
      </Column>
      <Row>
        <Text variant="label-default-s" align="center" onBackground="brand-weak">
          Built for React. Tuned for Next.js.
        </Text>
      </Row>
    </Column>
  );
};
