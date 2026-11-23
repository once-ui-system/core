"use client";

import type { IconName } from "@once-ui-system/core";
import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { Sparkline } from "@once-ui-system/core/data";

const section = {
  eyebrow: "By the numbers",
  title: "Teams ship faster on a shared system",
  description: "Measured across workspaces over the last twelve months.",
};

const stats: {
  value: string;
  label: string;
  detail: string;
  trend: number[];
  icon: IconName;
}[] = [
  {
    value: "3.4×",
    label: "Faster first release",
    detail: "From kickoff to the first deploy",
    trend: [4, 5, 5, 7, 8, 8, 10, 12, 13, 15, 16, 18],
    icon: "rocket",
  },
  {
    value: "92%",
    label: "Less custom CSS",
    detail: "Layout, type and colour through props",
    trend: [40, 34, 30, 26, 22, 19, 15, 12, 10, 9, 8, 8],
    icon: "code",
  },
  {
    value: "12k",
    label: "Screens generated",
    detail: "Built by agents from the same harness",
    trend: [1, 2, 2, 3, 5, 6, 6, 8, 9, 10, 11, 12],
    icon: "sparkle",
  },
  {
    value: "48h",
    label: "To a full rebrand",
    detail: "One config change, every surface",
    trend: [9, 8, 8, 7, 6, 5, 5, 4, 4, 3, 2, 2],
    icon: "swatch",
  },
];

/**
 * A metrics band: a short claim, then four numbers in one divided surface,
 * each with what it measures and a sparkline of how it got there.
 */
export const Stats1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" paddingX="l" paddingY="80" gap="40" {...flex}>
      <Column maxWidth="l" gap="12">
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {section.eyebrow}
        </Text>
        <Heading as="h2" textVariant="display-strong-s" wrap="balance">
          {section.title}
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          {section.description}
        </Text>
      </Column>
      <Grid
        maxWidth="l"
        columns={4}
        m={{ columns: 2 }}
        s={{ columns: 1 }}
        gap="1"
        background="neutral-alpha-weak"
        border
        radius="xl"
        overflow="hidden"
      >
        {stats.map((stat) => (
          <Column key={stat.label} background="surface" padding="24" gap="20" vertical="between">
            <Row gap="8" vertical="center" onBackground="neutral-weak">
              <Icon name={stat.icon} size="s" />
              <Text textVariant="label-default-s">{stat.label}</Text>
            </Row>
            <Column gap="4">
              <Heading as="p" textVariant="display-strong-m">
                {stat.value}
              </Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {stat.detail}
              </Text>
            </Column>
            <Sparkline
              data={stat.trend}
              variant="area"
              color="brand"
              height={40}
              aria-label={`${stat.label} over the last twelve months`}
            />
          </Column>
        ))}
      </Grid>
    </Column>
  );
};
