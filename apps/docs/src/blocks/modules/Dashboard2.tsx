"use client";

import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  ProgressBar,
  Pulse,
  Row,
  SegmentedControl,
  StatusIndicator,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Header1, Sidebar1 } from ".";

const metrics = [
  {
    title: "Active users",
    value: 12840,
    change: "+18%",
    progress: 72,
    positive: true,
  },
  {
    title: "Deployments",
    value: 342,
    change: "+6%",
    progress: 54,
    positive: true,
  },
  {
    title: "Error rate",
    value: 0.4,
    change: "-12%",
    progress: 8,
    positive: true,
    suffix: "%",
  },
  {
    title: "Avg. response",
    value: 142,
    change: "+4%",
    progress: 38,
    positive: false,
    suffix: "ms",
  },
];

const deployments = [
  {
    name: "once-ui/core v1.4.2",
    environment: "Production",
    status: "Live",
    time: "12 min ago",
    author: "/images/creators/lorant.jpg",
  },
  {
    name: "magic-portfolio v2.1.0",
    environment: "Staging",
    status: "Building",
    time: "28 min ago",
    author: "/images/creators/zsofia.jpg",
  },
  {
    name: "studio/docs",
    environment: "Preview",
    status: "Queued",
    time: "1 hr ago",
    author: "/images/creators/vincent.jpg",
  },
  {
    name: "blocks/registry",
    environment: "Production",
    status: "Live",
    time: "3 hr ago",
    author: "/images/creators/texz.jpg",
  },
];

const services = [
  { name: "API Gateway", status: "Operational", color: "green" as const },
  { name: "Auth Service", status: "Operational", color: "green" as const },
  { name: "CDN Edge", status: "Degraded", color: "yellow" as const },
  { name: "Background Jobs", status: "Operational", color: "green" as const },
];

const ranges = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
];

export const Dashboard2 = () => {
  const [range, setRange] = useState("24h");

  return (
    <Column fill>
      <Header1 authenticated avatar="/images/creators/lorant.jpg" borderBottom="transparent" />
      <Row fill>
        <Row m={{ hide: true }} maxWidth={16} horizontal="center">
          <Sidebar1 background="transparent" radius={undefined} fitHeight />
        </Row>
        <Row fill padding="8">
          <Row fill radius="l" overflow="hidden">
            <Row
              fill
              overflowY="auto"
              horizontal="center"
              paddingX="l"
              paddingBottom="l"
              background="surface"
            >
              <Column fitHeight gap="m" maxWidth="xl">
                <Row
                  fillWidth
                  paddingTop="l"
                  paddingX="16"
                  horizontal="between"
                  vertical="center"
                  wrap
                  gap="16"
                >
                  <Column gap="4">
                    <Row vertical="center" gap="12">
                      <Heading variant="display-strong-s">Workspace pulse</Heading>
                      <Pulse size="s" />
                    </Row>
                    <Text variant="body-default-m" onBackground="neutral-medium">
                      Real-time health across your projects and deployments.
                    </Text>
                  </Column>
                  <SegmentedControl buttons={ranges} value={range} onChange={setRange} />
                </Row>

                <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="8" fillWidth>
                  {metrics.map((metric) => (
                    <Card
                      key={metric.title}
                      fillWidth
                      direction="column"
                      padding="20"
                      gap="16"
                      radius="l"
                      border
                      background="transparent"
                    >
                      <Row fillWidth horizontal="between" vertical="center">
                        <Text variant="label-default-s" onBackground="neutral-medium">
                          {metric.title}
                        </Text>
                        <Row
                          gap="4"
                          vertical="center"
                          onBackground={metric.positive ? "success-weak" : "danger-weak"}
                        >
                          <Icon size="xs" name={metric.positive ? "trendUp" : "trendDown"} />
                          <Text variant="body-default-xs">{metric.change}</Text>
                        </Row>
                      </Row>
                      <Heading variant="display-strong-xs">
                        {metric.suffix === "%" ? (
                          <>
                            {metric.value}
                            {metric.suffix}
                          </>
                        ) : metric.suffix === "ms" ? (
                          <>
                            <CountFx value={metric.value} speed={600} />
                            {metric.suffix}
                          </>
                        ) : (
                          <CountFx value={metric.value} speed={800} separator="," />
                        )}
                      </Heading>
                      <ProgressBar showLabel={false} value={metric.progress} />
                    </Card>
                  ))}
                </Grid>

                <Grid columns="2" m={{ columns: 1 }} gap="8" fillWidth>
                  <Column fillWidth border radius="l" overflow="hidden">
                    <Row
                      fillWidth
                      vertical="center"
                      horizontal="between"
                      paddingLeft="24"
                      paddingRight="12"
                      paddingY="12"
                      gap="12"
                      wrap
                    >
                      <Heading variant="heading-strong-s">Recent deployments</Heading>
                      <Button size="s" variant="secondary" weight="default">
                        View pipeline
                      </Button>
                    </Row>
                    <Column fillWidth borderTop>
                      {deployments.map((deployment) => (
                        <Row
                          key={deployment.name}
                          fillWidth
                          paddingX="24"
                          paddingY="16"
                          gap="16"
                          vertical="center"
                          borderBottom
                        >
                          <Avatar size="xs" src={deployment.author} />
                          <Column fillWidth gap="4">
                            <Text variant="label-default-s">{deployment.name}</Text>
                            <Row gap="8" vertical="center">
                              <Text variant="body-default-xs" onBackground="neutral-weak">
                                {deployment.environment}
                              </Text>
                              <Text variant="body-default-xs" onBackground="neutral-weak">
                                · {deployment.time}
                              </Text>
                            </Row>
                          </Column>
                          <Row gap="8" vertical="center">
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              {deployment.status}
                            </Text>
                            <StatusIndicator
                              color={
                                deployment.status === "Live"
                                  ? "green"
                                  : deployment.status === "Building"
                                    ? "yellow"
                                    : "gray"
                              }
                            />
                          </Row>
                        </Row>
                      ))}
                    </Column>
                  </Column>

                  <Column fillWidth border radius="l" overflow="hidden">
                    <Row
                      fillWidth
                      vertical="center"
                      horizontal="between"
                      paddingLeft="24"
                      paddingRight="12"
                      paddingY="12"
                      gap="12"
                      wrap
                    >
                      <Heading variant="heading-strong-s">System health</Heading>
                      <AvatarGroup
                        size="xs"
                        avatars={[
                          { src: "/images/creators/lorant.jpg" },
                          { src: "/images/creators/zsofia.jpg" },
                          { src: "/images/creators/vincent.jpg" },
                        ]}
                      />
                    </Row>
                    <Column fillWidth borderTop>
                      {services.map((service) => (
                        <Row
                          key={service.name}
                          fillWidth
                          paddingX="24"
                          paddingY="16"
                          horizontal="between"
                          vertical="center"
                          borderBottom
                        >
                          <Row gap="12" vertical="center">
                            <Icon name="chip" size="xs" onBackground="neutral-weak" />
                            <Text variant="body-default-s">{service.name}</Text>
                          </Row>
                          <Row gap="8" vertical="center">
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              {service.status}
                            </Text>
                            <StatusIndicator color={service.color} />
                          </Row>
                        </Row>
                      ))}
                    </Column>
                    <Row fillWidth padding="20" gap="12" borderTop>
                      <Button fillWidth size="s" prefixIcon="plus">
                        New deployment
                      </Button>
                      <Button fillWidth size="s" variant="secondary" prefixIcon="lifering">
                        Status page
                      </Button>
                    </Row>
                  </Column>
                </Grid>
              </Column>
            </Row>
          </Row>
        </Row>
      </Row>
    </Column>
  );
};
