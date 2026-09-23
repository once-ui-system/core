"use client";

import {
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Pulse,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const colorMap = {
  brand: { border: "brand-alpha-medium", background: "brand-alpha-weak", text: "brand-medium" },
  accent: { border: "accent-alpha-medium", background: "accent-alpha-weak", text: "accent-medium" },
  neutral: {
    border: "neutral-alpha-medium",
    background: "neutral-alpha-weak",
    text: "neutral-weak",
  },
} as const;

type TimeBlock = {
  time: string;
  title: string;
  duration: string;
  color: keyof typeof colorMap;
  active?: boolean;
};

const schedule: Record<string, TimeBlock[]> = {
  Mon: [
    { time: "09:00", title: "Standup", duration: "30m", color: "brand" as const },
    { time: "10:00", title: "Design review", duration: "1h", color: "accent" as const },
    { time: "14:00", title: "Deep work", duration: "2h", color: "brand" as const, active: true },
  ],
  Tue: [
    { time: "11:00", title: "Client sync", duration: "45m", color: "accent" as const },
    { time: "15:00", title: "Documentation", duration: "1h", color: "neutral" as const },
  ],
  Wed: [
    { time: "09:30", title: "Sprint planning", duration: "1h", color: "brand" as const },
    { time: "13:00", title: "Code review", duration: "45m", color: "accent" as const },
    { time: "16:00", title: "Team retro", duration: "30m", color: "neutral" as const },
  ],
  Thu: [{ time: "10:00", title: "Pro blocks batch", duration: "3h", color: "brand" as const }],
  Fri: [
    { time: "09:00", title: "Weekly wrap-up", duration: "30m", color: "neutral" as const },
    { time: "11:00", title: "Community office hours", duration: "1h", color: "accent" as const },
  ],
  Sat: [],
  Sun: [{ time: "10:00", title: "Side project", duration: "2h", color: "brand" as const }],
};

type DayKey = keyof typeof schedule;

export const Productivity3 = () => {
  const [activeDay, setActiveDay] = useState<DayKey>("Mon");
  const blocks = schedule[activeDay];
  const totalBlocks = Object.values(schedule).flat().length;

  return (
    <Column fillWidth paddingX="8" paddingY="12" gap="24" maxWidth="xl" horizontal="center">
      <Row as="header" fillWidth paddingX="16" horizontal="between" vertical="center" wrap gap="16">
        <Column gap="4">
          <Text variant="body-strong-m">Weekly planner</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {totalBlocks} time blocks this week
          </Text>
        </Column>
        <Row gap="8" vertical="center">
          <IconButton
            data-border="rounded"
            variant="ghost"
            tooltip="Previous week"
            icon="chevronLeft"
          />
          <Tag size="s" scheme="neutral">
            Jul 21 – 27
          </Tag>
          <IconButton
            data-border="rounded"
            variant="ghost"
            tooltip="Next week"
            icon="chevronRight"
          />
          <Button size="s" variant="secondary" prefixIcon="plus">
            Add block
          </Button>
        </Row>
      </Row>

      <Row fillWidth gap="4" overflowX="auto" paddingX="8">
        {weekDays.map((day) => {
          const dayBlocks = schedule[day as DayKey];
          const isActive = activeDay === day;
          return (
            <Column
              key={day}
              fillWidth
              minWidth={8}
              gap="8"
              padding="12"
              radius="l"
              border={isActive ? "brand-alpha-medium" : "neutral-alpha-weak"}
              background={isActive ? "brand-alpha-weak" : "surface"}
              cursor="interactive"
              onClick={() => setActiveDay(day as DayKey)}
            >
              <Text
                variant="label-default-s"
                onBackground={isActive ? "brand-medium" : "neutral-weak"}
                align="center"
              >
                {day}
              </Text>
              <Text variant="code-default-xs" onBackground="neutral-weak" align="center">
                {dayBlocks.length || "—"}
              </Text>
            </Column>
          );
        })}
      </Row>

      <Column fillWidth radius="l" border background="surface" overflow="hidden">
        <Row
          fillWidth
          paddingX="24"
          paddingY="16"
          horizontal="between"
          vertical="center"
          borderBottom
        >
          <Heading variant="heading-strong-s">{activeDay}&apos;s schedule</Heading>
          <Row gap="8" vertical="center" onBackground="neutral-weak">
            <Icon name="time" size="xs" />
            <Text variant="label-default-s">{blocks.length} blocks</Text>
          </Row>
        </Row>

        <Column fillWidth padding="16" gap="8">
          {blocks.length === 0 ? (
            <Column fillWidth center paddingY="32" gap="8">
              <Icon name="calendar" size="m" onBackground="neutral-weak" />
              <Text variant="body-default-s" onBackground="neutral-weak">
                No blocks scheduled — enjoy the free time
              </Text>
            </Column>
          ) : (
            blocks.map((block) => {
              const colors = colorMap[block.color];
              return (
                <Row
                  key={`${block.time}-${block.title}`}
                  fillWidth
                  padding="16"
                  gap="16"
                  vertical="center"
                  radius="l"
                  border={colors.border}
                  background={block.active ? colors.background : undefined}
                >
                  <Column minWidth={6} gap="4">
                    <Text variant="code-default-s" onBackground={colors.text}>
                      {block.time}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {block.duration}
                    </Text>
                  </Column>
                  <Column fillWidth gap="4">
                    <Text variant="label-default-s">{block.title}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      Focus block
                    </Text>
                  </Column>
                  {block.active && <Pulse size="s" />}
                </Row>
              );
            })
          )}
        </Column>
      </Column>
    </Column>
  );
};
