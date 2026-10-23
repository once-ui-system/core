"use client";

import type React from "react";
import { Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";
import { PrismGlow } from "@/components/effects/PrismGlow";
import { useNewsletter } from "@/lib/newsletter";

/** The theme's own colours, so a rebrand in once-ui.config.js carries here too. */
const PRISM = [
  "var(--brand-background-strong)",
  "var(--brand-on-background-weak)",
  "var(--accent-on-background-weak)",
];

/** Newsletter capture; see src/lib/newsletter.ts for the Aveiro wiring. */
export const Newsletter: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const { email, setEmail, pending, subscribe } = useNewsletter();

  return (
    <Column
      overflow="hidden"
      fillWidth
      paddingX="32"
      paddingY="64"
      radius="xl"
      horizontal="center"
      align="center"
      gap="24"
      border="neutral-alpha-weak"
      {...flex}
    >
      <PrismGlow
        position="absolute"
        top="0"
        left="0"
        count={7}
        angle={-12}
        spread={14}
        clearance={0.7}
        blur={0.9}
        intensity={0.6}
        colors={PRISM}
        pointerEvents="none"
      />
      <Column zIndex={1} horizontal="center" maxWidth="xs" gap="12">
        <Heading as="h2" variant="display-strong-xs" wrap="balance" data-exclude-nav>
          Get new posts by email
        </Heading>
        <Text variant="body-default-m" wrap="balance" onBackground="neutral-weak">
          Product updates and build notes, about twice a month. No spam, unsubscribe any time.
        </Text>
      </Column>
      <Row zIndex={1} fillWidth maxWidth={24} data-border="rounded">
        <Input
          id="newsletter-email"
          type="email"
          placeholder="you@example.com"
          aria-label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") subscribe();
          }}
          suffix={
            <Button
              id="newsletter-button"
              size="s"
              style={{ marginRight: "-0.5rem" }}
              disabled={pending}
              loading={pending}
              onClick={subscribe}
            >
              Subscribe
            </Button>
          }
        />
      </Row>
    </Column>
  );
};
