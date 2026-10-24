import { PrismGlow } from "@/components/effects/PrismGlow";
import { landingCopy } from "@/content";
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";

const { cta } = landingCopy;

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
            {cta.title}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-medium" wrap="balance">
            {cta.description}
          </Text>
        </Column>
        <Row zIndex={1} gap="12" s={{ direction: "column" }}>
          <Button id="cta-button" href={cta.primary.href} arrowIcon>
            {cta.primary.label}
          </Button>
          <Button variant="secondary" href={cta.secondary.href}>
            {cta.secondary.label}
          </Button>
        </Row>
      </Column>
    </Row>
  );
};
