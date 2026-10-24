import { PrismGlow } from "@/components/effects/PrismGlow";
import { landingCopy } from "@/content";
import { Button, Column, Heading, Row, SmartLink, Text } from "@once-ui-system/core";

/** The theme's own colours, so a rebrand in once-ui.config.js carries here too. */
const PRISM = [
  "var(--brand-background-strong)",
  "var(--brand-on-background-weak)",
  "var(--accent-on-background-weak)",
];

const { hero } = landingCopy;

export const Hero: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" gap="64" {...flex}>
      <PrismGlow
        position="absolute"
        top="0"
        left="0"
        fillWidth
        height={48}
        count={9}
        angle={-16}
        spread={16}
        clearance={0.6}
        blur={0.85}
        intensity={0.85}
        colors={PRISM}
        pointerEvents="none"
        style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 55%, transparent)" }}
      />
      <Column maxWidth="s" horizontal="center" align="center" gap="24" paddingY="80" zIndex={1}>
        <SmartLink href={hero.badge.href} unstyled>
          <Row
            vertical="center"
            gap="8"
            paddingLeft="4"
            paddingRight="12"
            paddingY="4"
            radius="full"
            border="neutral-alpha-medium"
            background="neutral-alpha-weak"
            textVariant="label-default-s"
          >
            <Row
              paddingX="8"
              paddingY="2"
              radius="full"
              background="brand-alpha-medium"
              onBackground="brand-strong"
              textVariant="label-strong-xs"
            >
              {hero.badge.label}
            </Row>
            {hero.badge.text}
          </Row>
        </SmartLink>
        <Heading as="h1" variant="display-strong-l" wrap="balance">
          {hero.title} <Text onBackground="neutral-weak">{hero.titleMuted}</Text>
        </Heading>
        <Text variant="body-default-xl" onBackground="neutral-medium" wrap="balance">
          {hero.description}
        </Text>
        <Row gap="12" horizontal="center" paddingTop="8" s={{ direction: "column" }}>
          <Button id="hero-cta" href={hero.primary.href} arrowIcon>
            {hero.primary.label}
          </Button>
          <Button variant="secondary" href={hero.secondary.href}>
            {hero.secondary.label}
          </Button>
        </Row>
      </Column>
    </Column>
  );
};
