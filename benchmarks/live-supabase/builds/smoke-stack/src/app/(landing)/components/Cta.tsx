import { PrismGlow } from "@/components/effects/PrismGlow";
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";

/** The theme's own colours, so a rebrand in once-ui.config.js carries here too. */
const PRISM = [
  "var(--brand-background-strong)",
  "var(--brand-on-background-weak)",
  "var(--accent-on-background-weak)",
];

export const Cta = () => {
  return (
    <Row fillWidth horizontal="center" paddingX="l" s={{ paddingX: "16" }}>
      <Column
        maxWidth="l"
        fillWidth
        center
        gap="24"
        paddingX="l"
        paddingY="104"
        radius="xl"
        border="neutral-alpha-weak"
        overflow="hidden"
        align="center"
      >
        <PrismGlow
          position="absolute"
          top="0"
          left="0"
          count={8}
          angle={-18}
          spread={16}
          clearance={0.6}
          blur={0.85}
          intensity={0.8}
          colors={PRISM}
        />
        <Column zIndex={1} gap="16" horizontal="center" maxWidth="s">
          <Heading as="h2" variant="display-strong-m" wrap="balance" data-exclude-nav>
            Start building today
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-medium" wrap="balance">
            Free to start. Your app, your code, your brand.
          </Text>
        </Column>
        <Row zIndex={1} gap="12" s={{ direction: "column" }}>
          <Button id="cta-button" href="/auth?state=signup" arrowIcon>
            Start building
          </Button>
          <Button variant="secondary" href="/pricing">
            See pricing
          </Button>
        </Row>
      </Column>
    </Row>
  );
};
