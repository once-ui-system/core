"use client";

import {
  Avatar,
  Background,
  Card,
  Column,
  CountFx,
  Grid,
  Heading,
  Hover,
  Icon,
  Row,
  Text,
} from "@once-ui-system/core";

const stats = [
  { label: "GitHub stars", value: 4200, suffix: "+" },
  { label: "Contributors", value: 48, suffix: "" },
  { label: "Open repos", value: 12, suffix: "" },
];

const contributors = [
  { login: "lorant-one", avatar: "/images/creators/lorant.jpg", href: "#" },
  { login: "justin-chen", avatar: "/images/creators/justin.jpg", href: "#" },
  { login: "suhaib-khan", avatar: "/images/creators/suhaib.jpg", href: "#" },
  { login: "ryan-ford", avatar: "/images/creators/ryan.jpg", href: "#" },
  { login: "evan-carter", avatar: "/images/creators/evan.jpg", href: "#" },
  { login: "kevin-wu", avatar: "/images/creators/kevin.jpg", href: "#" },
  { login: "aryan-shah", avatar: "/images/creators/aryan.jpg", href: "#" },
  { login: "chander-s", avatar: "/images/creators/chander.jpg", href: "#" },
  { login: "dan-koe", avatar: "/images/creators/dan-koe.jpg", href: "#" },
];

export const About6 = () => {
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

          <Row fillWidth m={{ direction: "column" }}>
            <Column flex={1}>
              <Column
                fillWidth
                paddingY="24"
                paddingX="32"
                background="page"
                borderBottom
                position="sticky"
                top="56"
                gap="8"
              >
                <Heading as="h2" variant="heading-strong-l" wrap="balance">
                  Hall of fame
                </Heading>
                <Row vertical="center" gap="8" onBackground="neutral-weak">
                  <Icon name="github" size="xs" />
                  <Text variant="label-default-s">Open-source contributors</Text>
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
                  Builders who shape Once UI in public — every commit, review, and idea compounds
                  into shared infrastructure.
                </Text>
              </Column>
            </Column>

            <Column fillWidth flex={3} borderLeft>
              <Row fillWidth marginTop="48" borderTop>
                <Grid columns="3" m={{ columns: 3 }} s={{ columns: 2 }} fillWidth background="page">
                  {contributors.map((contributor) => (
                    <Hover
                      key={contributor.login}
                      trigger={
                        <Card
                          fillWidth
                          href={contributor.href}
                          padding="24"
                          vertical="center"
                          background="transparent"
                          gap="16"
                          align="center"
                          direction="column"
                          horizontal="center"
                          border="transparent"
                        >
                          <Avatar
                            src={contributor.avatar}
                            size="m"
                            style={{ filter: "grayscale(100%)" }}
                          />
                        </Card>
                      }
                      overlay={
                        <Row
                          fill
                          center
                          background="surface"
                          border
                          onBackground="neutral-medium"
                          textVariant="label-default-s"
                        >
                          {contributor.login}
                        </Row>
                      }
                    />
                  ))}
                </Grid>
              </Row>
            </Column>
          </Row>
        </Column>
      </Column>
    </Column>
  );
};
