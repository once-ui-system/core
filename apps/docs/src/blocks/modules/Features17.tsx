import {
  Background,
  Button,
  Column,
  Heading,
  Line,
  Row,
  StylePanel,
  Text,
} from "@once-ui-system/core";

export const Features17 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Column fillWidth horizontal="center" borderBottom paddingX="l">
        <Column maxWidth={120}>
          <Background
            position="absolute"
            top="0"
            left="0"
            dots={{ display: true, size: "4", color: "brand-background-strong" }}
            mask={{ x: 60, y: 70, radius: 50 }}
          />
          <Row fill vertical="end" l={{ direction: "column" }}>
            <Row flex={1} l={{ hide: true }} />
            <Column fillWidth flex={5} l={{ style: { flex: 0 } }}>
              <Column maxWidth={64} gap="16" paddingX="24" paddingY="80">
                <Text variant="heading-default-xl" onBackground="brand-weak">
                  Theme once, ship everywhere
                </Text>
                <Heading as="h2" variant="display-default-m" marginBottom="16" wrap="balance">
                  Manage colors, typography, and surfaces from a single semantic config.
                </Heading>
                <Text
                  variant="body-default-l"
                  onBackground="neutral-weak"
                  wrap="balance"
                  marginBottom="24"
                >
                  Swap brand palettes, border styles, and spacing scales without touching component
                  markup — the same blocks adapt instantly across light and dark modes.
                </Text>
                <Button data-border="rounded" suffixIcon="chevronRight" href="#" size="s">
                  Explore theming
                </Button>
              </Column>
              <Row
                topLeftRadius="l"
                borderTop
                borderLeft
                background="page"
                overflow="hidden"
                xs={{ style: { aspectRatio: "3 / 4" } }}
                s={{ style: { aspectRatio: "3 / 4" } }}
                m={{ style: { aspectRatio: "3 / 4" } }}
              >
                <Row fillWidth padding="24" gap="16">
                  <Background background="brand-strong" border width={4} height={4} radius="s" />
                  <Background background="brand-medium" border width={4} height={4} radius="s" />
                  <Background background="brand-weak" border width={4} height={4} radius="s" />
                </Row>
              </Row>
            </Column>
            <Line hide l={{ hide: false }} background="neutral-alpha-weak" />
            <Row flex={3} fillWidth background="page">
              <Row fill padding="4" borderX borderTop>
                <Row fill padding="4" radius="m" border background="page">
                  <StylePanel fillWidth maxHeight={36} padding="8" overflowY="auto" />
                </Row>
              </Row>
            </Row>
          </Row>
        </Column>
      </Column>
      <Row
        fillWidth
        horizontal="center"
        padding="8"
        textVariant="code-default-m"
        onBackground="neutral-weak"
        borderBottom
        borderX
        background="page"
      >
        <Row maxWidth="xl" vertical="center" gap="8" wrap>
          <Background
            lines={{ display: true, size: "2", color: "neutral-alpha-weak" }}
            height={1}
            minWidth={2}
            maxWidth={8}
            border
            radius="xs"
            fillHeight
          />
          <Row opacity={50}>
            <Text wrap="nowrap">styles.brand="blue"</Text>
          </Row>
          <Background
            lines={{ display: true, size: "2", color: "neutral-alpha-weak" }}
            height={1}
            minWidth={2}
            maxWidth={24}
            fillHeight
          />
          <Row opacity={50}>
            <Text wrap="nowrap">&lt;StylePanel /&gt;</Text>
          </Row>
          <Background
            lines={{ display: true, size: "2", angle: 45, color: "neutral-alpha-weak" }}
            height={1}
            minWidth={1}
            maxWidth={4}
            border
            radius="xs"
            fillHeight
          />
        </Row>
      </Row>
    </Column>
  );
};
