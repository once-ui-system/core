import { Shot } from "./Shot";
import { PrismGlow } from "@/components/effects/PrismGlow";
import { Button, Column, Heading, RevealFx, Row, SmartLink, Text } from "@once-ui-system/core";

/** The theme's own colours, so a rebrand in once-ui.config.js carries here too. */
const PRISM = [
  "var(--brand-background-strong)",
  "var(--brand-on-background-weak)",
  "var(--accent-on-background-weak)",
];

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
      <Column maxWidth="s" horizontal="center" align="center" gap="24" paddingTop="64" zIndex={1}>
        <SmartLink href="/blog" unstyled>
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
              New
            </Row>
            Teams, roles and billing
          </Row>
        </SmartLink>
        <Heading as="h1" variant="display-strong-l" wrap="balance">
          Launch your product, <Text onBackground="neutral-weak">not another boilerplate</Text>
        </Heading>
        <Text variant="body-default-xl" onBackground="neutral-medium" wrap="balance">
          Stack is a production-ready Next.js app built on Once UI. Auth, dashboard, billing,
          docs and a marketing site, already wired together and on brand.
        </Text>
        <Row gap="12" horizontal="center" paddingTop="8" s={{ direction: "column" }}>
          <Button id="hero-cta" href="/auth?state=signup" arrowIcon>
            Start building
          </Button>
          <Button variant="secondary" href="/app">
            Explore the demo
          </Button>
        </Row>
      </Column>
      <Column fillWidth maxWidth="l" horizontal="center" zIndex={1}>
        <RevealFx fillWidth translateY="16">
          <Column fillWidth padding="8" radius="xl" border="neutral-alpha-medium" background="page">
            <Shot
              name="dashboard"
              alt="The Stack dashboard"
              fillWidth
              priority
              radius="l"
              border="neutral-alpha-weak"
              aspectRatio="16 / 10"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </Column>
        </RevealFx>
      </Column>
    </Column>
  );
};
