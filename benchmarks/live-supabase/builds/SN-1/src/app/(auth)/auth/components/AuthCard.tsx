import { PrismGlow } from "@/components/effects/PrismGlow";
import { Column, Heading, IconButton, Logo, Row, Text } from "@once-ui-system/core";
import type React from "react";
import { schema } from "@/resources";

/**
 * The prism takes the theme's own colours, so a project that rebrands in
 * once-ui.config.js gets a sign-in screen in its brand without touching this.
 */
const PRISM = [
  "var(--brand-background-strong)",
  "var(--brand-on-background-weak)",
  "var(--accent-on-background-weak)",
];

interface AuthCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Below the card, outside it: the account switch and the legal links. */
  footer?: React.ReactNode;
}

/** The sign-in screen: one card on a field of prism light. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Column
      fill
      center
      overflow="hidden"
      radius="xl"
      paddingX="16"
      paddingY="80"
      style={{ minHeight: "calc(100dvh - 1rem)" }}
    >
      <PrismGlow
        position="absolute"
        top="0"
        left="0"
        count={10}
        angle={-24}
        spread={18}
        clearance={0.45}
        blur={0.8}
        intensity={0.8}
        colors={PRISM}
      />
      <Row position="absolute" top="16" left="16" zIndex={1}>
        <IconButton icon="chevronLeft" variant="tertiary" href="/" tooltip="Back to home" />
      </Row>
      <Column
        zIndex={1}
        fillWidth
        maxWidth={26}
        gap="32"
        paddingX="32"
        paddingTop="40"
        paddingBottom="32"
        radius="xl"
        border="neutral-alpha-weak"
        background="page"
        shadow="xl"
        s={{ paddingX: "20" }}
      >
        <Column gap="20" horizontal="center">
          <Logo href="/" size="m" icon={schema.logo} />
          <Column gap="8" horizontal="center">
            <Heading as="h1" variant="heading-strong-xl" align="center">
              {title}
            </Heading>
            {description && (
              <Text variant="body-default-s" onBackground="neutral-weak" align="center" wrap="balance">
                {description}
              </Text>
            )}
          </Column>
        </Column>
        {children}
      </Column>
      {footer && (
        <Column zIndex={1} gap="16" horizontal="center" marginTop="24">
          {footer}
        </Column>
      )}
    </Column>
  );
}
