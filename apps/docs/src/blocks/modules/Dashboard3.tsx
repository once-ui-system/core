"use client";

import {
  Background,
  Button,
  Card,
  Column,
  Heading,
  Icon,
  Line,
  Row,
  Scroller,
  StatusIndicator,
  StylePanel,
  Text,
} from "@once-ui-system/core";
import { LineChart, RadialGauge } from "@once-ui-system/core/data";

const stats = [
  { title: "Revenue", value: "$24,345", change: "12.5%", positive: true },
  { title: "Visitors", value: "2,345", change: "8.3%", positive: true },
  { title: "Conversion", value: "3.2%", change: "1.8%", positive: false },
  { title: "Session", value: "4m 32s", change: "10.3%", positive: true },
];

const projects = [
  { name: "Mobile App", status: "At Risk", icon: "code" as const },
  { name: "Marketing", status: "On Track", icon: "sparkle" as const },
  { name: "Migration", status: "On Track", icon: "code" as const },
  { name: "Redesign", status: "Delayed", icon: "sparkle" as const },
];

const statusColor = (status: string): "green" | "yellow" | "red" | "gray" => {
  if (status === "On Track") return "green";
  if (status === "At Risk") return "red";
  return "gray";
};

function DashboardPreviewPanel() {
  return (
    <Column fillWidth gap="16" padding="m">
      <Row vertical="center" fillWidth horizontal="between" gap="8" wrap>
        <Heading variant="display-strong-xs">Dashboard</Heading>
        <Button prefixIcon="plus" size="s" data-border="rounded">
          New
        </Button>
      </Row>

      <Scroller fadeColor="transparent">
        <Row fitWidth flex={1}>
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              minWidth={12}
              padding="16"
              gap="8"
              radius="l"
              overflow="hidden"
              fillWidth
              direction="column"
              background="transparent"
              marginRight={index < stats.length - 1 ? "8" : "0"}
            >
              <Background
                position="absolute"
                top="0"
                left="0"
                gradient={{
                  display: true,
                  x: 100,
                  y: 0,
                  width: 50,
                  height: 75,
                  colorStart: stat.positive
                    ? "success-background-strong"
                    : "danger-background-strong",
                }}
              />
              <Row vertical="center" gap="8">
                <Text variant="label-default-s" onBackground="neutral-medium">
                  {stat.title}
                </Text>
                <Row
                  gap="4"
                  vertical="center"
                  onBackground={stat.positive ? "success-weak" : "danger-weak"}
                >
                  <Icon size="xs" name={stat.positive ? "trendUp" : "trendDown"} />
                  <Text variant="body-default-xs">{stat.change}</Text>
                </Row>
              </Row>
              <Heading variant="display-strong-xs">{stat.value}</Heading>
            </Card>
          ))}
        </Row>
      </Scroller>

      <Row fillWidth gap="8" m={{ direction: "column-reverse" }}>
        <Row flex={3}>
          <LineChart
            style={{ height: "auto" }}
            height={undefined}
            minHeight={16}
            border="neutral-medium"
            radius="l"
            axis="x"
            title="Revenue growth"
            description="January, 2025"
            date={{
              start: new Date("2024-12-31"),
              end: new Date("2025-01-31"),
              format: "MMM dd",
              selector: true,
              dual: true,
              presets: { display: true, granularity: "week" },
            }}
            grid="y"
            series={[
              { key: "Current period", color: "emerald" },
              { key: "Previous period", color: "gray" },
            ]}
            data={[
              { date: "2025-01-01", "Current period": 4654, "Previous period": 1365 },
              { date: "2025-01-05", "Current period": 5534, "Previous period": 6453 },
              { date: "2025-01-10", "Current period": 2412, "Previous period": 1041 },
              { date: "2025-01-15", "Current period": 4234, "Previous period": 2023 },
              { date: "2025-01-18", "Current period": 1234, "Previous period": 3423 },
            ]}
          />
        </Row>
        <Column flex={1} radius="l" border="neutral-medium" overflow="hidden" minWidth={16}>
          <Background
            position="absolute"
            data-solid="color"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 50,
              y: -50,
              width: 75,
              height: 100,
              colorStart: "brand-solid-medium",
            }}
            mask={{ x: 50, y: 0, radius: 30 }}
          />
          <Column fill center gap="8" padding="24">
            <Text variant="label-default-xs" onBackground="brand-medium" align="center">
              16d left
            </Text>
            <RadialGauge
              width={180}
              height={180}
              value={42}
              hue="success"
              unit="%"
              line={{ count: 48, width: 2, length: 24 }}
            />
            <Text variant="label-default-s" onBackground="neutral-weak" align="center">
              Monthly target
            </Text>
            <Text variant="heading-strong-m" align="center">
              $27,000
            </Text>
          </Column>
        </Column>
      </Row>

      <Column fillWidth border="neutral-medium" radius="l" overflow="hidden">
        <Row
          vertical="center"
          horizontal="between"
          fillWidth
          paddingLeft="16"
          paddingRight="12"
          paddingY="12"
        >
          <Heading variant="heading-strong-s">Project status</Heading>
        </Row>
        <Column fillWidth borderTop="neutral-medium">
          {projects.map((project) => (
            <Row
              key={project.name}
              fillWidth
              horizontal="between"
              height="48"
              vertical="center"
              paddingX="16"
            >
              <Row vertical="center" gap="12">
                <Icon name={project.icon} size="xs" onBackground="neutral-weak" />
                <Text variant="body-default-s">{project.name}</Text>
              </Row>
              <Row vertical="center" gap="8">
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {project.status}
                </Text>
                <StatusIndicator color={statusColor(project.status)} />
              </Row>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}

export const Dashboard3 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" borderY paddingX="l" {...flex}>
      <Column maxWidth={120}>
        <Background
          position="absolute"
          top="0"
          left="0"
          dots={{ display: true, size: "4", color: "brand-background-strong" }}
          mask={{ x: 60, y: 30, radius: 50 }}
        />
        <Row fill vertical="end" l={{ direction: "column" }}>
          <Row flex={1} l={{ hide: true }} />
          <Column fillWidth flex={5} l={{ style: { flex: 0 } }}>
            <Column maxWidth={64} gap="16" paddingX="24" paddingY="48">
              <Text variant="heading-default-xl" onBackground="brand-weak">
                Design tokens, without the chaos
              </Text>
              <Heading as="h2" variant="display-default-s" marginBottom="8">
                Live theming beside a masked dashboard preview
              </Heading>
              <Button data-border="rounded" suffixIcon="chevronRight">
                Learn more
              </Button>
            </Column>
            <Row
              radius="l"
              border
              background="surface"
              aspectRatio="16 / 12"
              overflow="hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, black 80%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 100%)",
                maskComposite: "intersect",
              }}
              xs={{ style: { aspectRatio: "3 / 4" } }}
              s={{ style: { aspectRatio: "3 / 4" } }}
              m={{ style: { aspectRatio: "3 / 4" } }}
            >
              <DashboardPreviewPanel />
            </Row>
          </Column>
          <Line hide l={{ hide: false }} background="neutral-alpha-weak" />
          <Row flex={2} fill background="page" l={{ style: { maxHeight: "32rem" } }}>
            <Row fill padding="4" borderX>
              <Row fill padding="4" radius="m" border background="page">
                <StylePanel fill padding="8" overflowY="auto" />
              </Row>
            </Row>
          </Row>
        </Row>
      </Column>
      <Row
        fillWidth
        horizontal="center"
        padding="8"
        textVariant="code-default-m"
        onBackground="neutral-weak"
        borderBottom
      >
        <Row maxWidth="xl" vertical="center" gap="8">
          <Background
            lines={{ display: true, size: "2", color: "neutral-alpha-weak" }}
            height={1}
            minWidth={2}
            maxWidth={8}
            border
            radius="xs"
            fillHeight
          />
          <Row opacity={50}>
            <Text wrap="nowrap">styles.neutral="slate"</Text>
          </Row>
          <Background
            lines={{ display: true, size: "2", color: "neutral-alpha-weak" }}
            height={1}
            minWidth={2}
            maxWidth={24}
            fillHeight
          />
          <Row opacity={50}>
            <Text wrap="nowrap">&lt;StylePanel /&gt;</Text>
          </Row>
        </Row>
      </Row>
    </Column>
  );
};
