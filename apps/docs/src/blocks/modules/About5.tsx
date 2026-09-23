"use client";

import {
  Animation,
  Background,
  Button,
  Card,
  Column,
  CountFx,
  Grid,
  Heading,
  Hover,
  LetterFx,
  Line,
  Logo,
  Media,
  Row,
  Text,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Open source repos", value: 12, suffix: "+" },
  { label: "Community members", value: 4800, suffix: "+" },
  { label: "Countries reached", value: 64, suffix: "" },
];

const partners = [
  { dark: "/trademarks/brevo-dark.svg", light: "/trademarks/brevo-light.svg" },
  { dark: "/trademarks/microsoft-dark.svg", light: "/trademarks/microsoft-light.svg" },
  { dark: "/trademarks/nasa-dark.svg", light: "/trademarks/nasa-light.svg" },
  { dark: "/trademarks/logmein-dark.svg", light: "/trademarks/logmein-light.svg" },
];

const swag = [
  {
    href: "#",
    image: "/images/global/swag-promo-01.png",
    label: "Curiosity in code hoodie",
  },
  {
    href: "#",
    image: "/images/global/swag-promo-02.png",
    label: "Desk mat collection",
  },
];

function SwagCard({ href, image, label }: { href: string; image: string; label: string }) {
  const triggerLetterFxRef = useRef<(() => void) | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered && triggerLetterFxRef.current) {
      const timer = setTimeout(() => triggerLetterFxRef.current?.(), 50);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <Row
      fillWidth
      background="page"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Hover
        fillWidth
        trigger={
          <Card
            fillWidth
            href={href}
            overflow="hidden"
            border="transparent"
            background="transparent"
          >
            <Animation fillWidth scale={1.05} reverse fade={1} triggerType="hover">
              <Media aspectRatio="1/1" src={image} sizes="400px" alt={label} />
            </Animation>
          </Card>
        }
        overlay={
          <Row fill padding="4">
            <Row fill border="neutral-alpha-medium" radius="l" vertical="end" overflow="hidden">
              <Row fillWidth height="32">
                <Background
                  fill
                  borderTop="neutral-alpha-medium"
                  lines={{
                    display: true,
                    color: "neutral-alpha-weak",
                    angle: -45,
                    size: "4",
                  }}
                />
                <Button data-border="sharp" size="s" suffixIcon="chevronRight">
                  <Text variant="code-default-s">
                    <LetterFx
                      charset={["x", "y", "z", "0", "/", "!", "u", "o"]}
                      trigger="custom"
                      onTrigger={(triggerFn) => {
                        triggerLetterFxRef.current = triggerFn;
                      }}
                    >
                      Shop now
                    </LetterFx>
                  </Text>
                </Button>
                <Background
                  fill
                  borderTop="neutral-alpha-medium"
                  lines={{
                    display: true,
                    color: "neutral-alpha-weak",
                    angle: -45,
                    size: "4",
                  }}
                />
              </Row>
            </Row>
          </Row>
        }
      />
    </Row>
  );
}

export const About5 = () => {
  return (
    <Column fillWidth horizontal="center" borderY>
      <Column fillWidth horizontal="center" paddingX="l">
        <Column maxWidth="m" borderX>
          <Background
            position="absolute"
            fill
            m={{ hide: true }}
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4",
            }}
          />

          <Row fillWidth borderBottom background="page">
            <Column fillWidth paddingY="80" paddingX="32" gap="16">
              <Text variant="code-default-s" onBackground="brand-weak">
                Community
              </Text>
              <Heading variant="display-strong-s" wrap="balance">
                Powering creative minds.
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
                Used by professionals working at companies that value craft, curiosity, and
                independent creation.
              </Text>
            </Column>
          </Row>

          <Grid columns="3" m={{ columns: 1 }} fillWidth borderBottom>
            {stats.map((stat, index) => (
              <Column
                key={stat.label}
                fillWidth
                center
                paddingY="32"
                gap="8"
                background="page"
                borderRight={index < stats.length - 1 ? "neutral-alpha-weak" : undefined}
              >
                <Heading variant="display-strong-xs">
                  <CountFx value={stat.value} speed={800} separator="," />
                  {stat.suffix}
                </Heading>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {stat.label}
                </Text>
              </Column>
            ))}
          </Grid>

          <Grid columns="4" m={{ columns: 2 }} fillWidth background="page" borderBottom>
            {partners.map((partner, index) => (
              <Row
                key={partner.dark}
                fill
                center
                padding="24"
                borderRight={index % 2 === 0 ? "neutral-alpha-weak" : undefined}
                borderBottom={index < 2 ? "neutral-alpha-weak" : undefined}
                minHeight={4}
              >
                <Logo wordmark={partner.dark} />
                <Logo light wordmark={partner.light} />
              </Row>
            ))}
          </Grid>

          <Row fillWidth borderBottom>
            <Row flex={1} borderRight m={{ hide: true }} />
            <Column flex={3} background="page">
              <Heading as="h2" variant="heading-strong-l" padding="24">
                Swag designed for makers.
              </Heading>
            </Column>
          </Row>

          <Row fillWidth s={{ direction: "column" }}>
            {swag.map((item, index) => (
              <Row key={item.label} fillWidth flex={1}>
                <SwagCard href={item.href} image={item.image} label={item.label} />
                {index < swag.length - 1 && <Line background="neutral-alpha-weak" vert />}
              </Row>
            ))}
            <Row flex={1} m={{ hide: true }} borderLeft />
          </Row>
        </Column>
      </Column>
    </Column>
  );
};
