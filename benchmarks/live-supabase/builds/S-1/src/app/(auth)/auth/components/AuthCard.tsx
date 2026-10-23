import { brand } from "@/resources";
import { Background, Column, Heading, IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import type React from "react";

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
      <Background
        position="absolute"
        fill
        gradient={{
          display: true,
          x: 50,
          y: 0,
          width: 120,
          height: 80,
          colorStart: "brand-background-strong",
          colorEnd: "static-transparent",
        }}
        pointerEvents="none"
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
          <SmartLink href="/" unstyled>
            <Text variant="heading-strong-m">{brand.name}</Text>
          </SmartLink>
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
