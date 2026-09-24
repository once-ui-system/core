"use client";

import {
  AutoScroll,
  Background,
  Column,
  Grid,
  Heading,
  Hover,
  Icon,
  Mask,
  MatrixFx,
  Row,
  ShineFx,
  Tag,
  Text,
} from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import type { ReactNode } from "react";

const categories = [
  {
    icon: "map" as const,
    title: "Contexts",
    description: "Themes, toasts, icons, and layout state at the app level.",
  },
  {
    icon: "lightbulb" as const,
    title: "Basics",
    description: "Wrappers and utilities that make complex patterns approachable.",
  },
  {
    icon: "toggle" as const,
    title: "Form controls",
    description: "Inputs, selects, and toggles for data entry flows.",
  },
  {
    icon: "code" as const,
    title: "Static elements",
    description: "Badges, tags, skeletons, and feedback components.",
  },
  {
    icon: "trendUp" as const,
    title: "Data viz",
    description: "Responsive charts, gauges, and live metric displays.",
  },
  {
    icon: "bolt" as const,
    title: "Modules",
    description: "Megamenu, command palette, and high-level building blocks.",
  },
];

const demoTiles: {
  label: string;
  content: ReactNode;
  flex: 2 | 3;
}[] = [
  {
    label: "<MatrixFx /> + <ShineFx />",
    content: (
      <Row fill center gap="32">
        <Background
          position="absolute"
          fill
          dots={{ display: true, size: "2", color: "brand-background-strong" }}
          mask={{ x: 50, y: 50, radius: 25 }}
        />
        <Row radius="full" border="brand-medium" width={6} height={6} overflow="hidden" center>
          <Mask fill position="absolute" x={50} y={50} radius={6}>
            <MatrixFx flicker size={1.5} spacing={3} colors={["brand-on-background-medium"]} />
          </Mask>
        </Row>
        <ShineFx variant="code-default-l">Listening...</ShineFx>
      </Row>
    ),
    flex: 2,
  },
  {
    label: "<LineChart />",
    content: (
      <Column fill padding="24" gap="8">
        <Background
          position="absolute"
          fill
          gradient={{
            display: true,
            x: 100,
            y: 0,
            colorStart: "neutral-background-strong",
          }}
        />
        <Text variant="display-strong-s">+24%</Text>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Weekly active builders
        </Text>
        <LineChart
          fillWidth
          height={8}
          border="transparent"
          grid="none"
          axis="none"
          legend={{ display: false }}
          series={[{ key: "Users", color: "brand" }]}
          data={[
            { date: "Mon", Users: 12 },
            { date: "Tue", Users: 18 },
            { date: "Wed", Users: 16 },
            { date: "Thu", Users: 22 },
            { date: "Fri", Users: 28 },
            { date: "Sat", Users: 24 },
            { date: "Sun", Users: 32 },
          ]}
        />
      </Column>
    ),
    flex: 3,
  },
  {
    label: "<AutoScroll /> + <Tag />",
    content: (
      <AutoScroll background="page" borderY="neutral-alpha-medium" paddingY="12">
        <Row paddingX="24" vertical="center" gap="16">
          <Text>Launch week</Text>
          <Tag scheme="brand">Live</Tag>
        </Row>
        <Row paddingX="24" vertical="center">
          <Text onBackground="neutral-weak">New blocks ship every week</Text>
        </Row>
        <Row paddingX="24" vertical="center" gap="16">
          <Text>Launch week</Text>
          <Tag scheme="brand">Live</Tag>
        </Row>
      </AutoScroll>
    ),
    flex: 2,
  },
];

export const Features18 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="48" paddingX="l" {...flex}>
      <Column fillWidth maxWidth="l" gap="16">
        <Heading as="h2" variant="display-default-s" wrap="balance">
          <Text onBackground="brand-weak">Copy and paste.</Text> Ship with 100+ open-source
          components and Pro blocks from one design system.
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          Inspired by the Once UI homepage — a capability grid paired with live effect previews.
        </Text>
      </Column>

      <Grid fillWidth maxWidth="l" columns="3" m={{ columns: "2" }} xs={{ columns: "1" }} gap="12">
        {categories.map((category) => (
          <Column
            key={category.title}
            fillWidth
            borderLeft="neutral-alpha-medium"
            padding="l"
            gap="12"
          >
            <Icon size="l" name={category.icon} onBackground="brand-weak" />
            <Text variant="heading-default-xl">
              {category.title}. <Text onBackground="neutral-weak">{category.description}</Text>
            </Text>
          </Column>
        ))}
      </Grid>

      <Column fillWidth maxWidth="l" padding="2" radius="xl-4" overflow="hidden">
        <Background
          position="absolute"
          fill
          mask={{ cursor: true }}
          gradient={{
            display: true,
            x: 25,
            y: 25,
            colorStart: "brand-solid-medium",
            colorEnd: "accent-solid-medium",
          }}
        />
        <Column fillWidth gap="8" padding="16" background="page" overflow="hidden" radius="xl-4">
          <Row fillWidth gap="8" s={{ direction: "column" }}>
            {demoTiles.map((tile) => (
              <Column
                key={tile.label}
                border="neutral-alpha-medium"
                overflow="hidden"
                background="page"
                flex={tile.flex}
                radius="xl"
                minHeight={24}
                paddingLeft="l"
                paddingTop="l"
              >
                <Hover
                  fill
                  trigger={
                    <Row
                      fill
                      center
                      topLeftRadius="xl"
                      bottomRightRadius="xl"
                      borderTop
                      borderLeft
                      overflow="hidden"
                    >
                      {tile.content}
                    </Row>
                  }
                  overlay={
                    <Row
                      onBackground="brand-weak"
                      position="absolute"
                      bottom="24"
                      fillWidth
                      horizontal="center"
                      textVariant="code-default-xs"
                    >
                      {tile.label}
                    </Row>
                  }
                />
              </Column>
            ))}
          </Row>
        </Column>
      </Column>
    </Column>
  );
};
