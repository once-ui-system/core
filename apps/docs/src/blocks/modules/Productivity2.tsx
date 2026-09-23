"use client";

import {
  Button,
  Checkbox,
  Column,
  Heading,
  Icon,
  IconButton,
  Pulse,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const agenda = [
  {
    time: "09:00",
    title: "Design review",
    project: "Once UI Blocks",
    duration: "45m",
    done: true,
  },
  {
    time: "10:30",
    title: "Ship Dashboard2 block",
    project: "Studio",
    duration: "2h",
    done: false,
    active: true,
  },
  {
    time: "13:00",
    title: "Community sync",
    project: "Discord",
    duration: "30m",
    done: false,
  },
  {
    time: "15:00",
    title: "Documentation pass",
    project: "Magic Docs",
    duration: "1h",
    done: false,
  },
  {
    time: "17:00",
    title: "Weekly retro",
    project: "Platform Squad",
    duration: "45m",
    done: false,
  },
];

const views = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
];

export const Productivity2 = () => {
  const [view, setView] = useState("today");
  const [checked, setChecked] = useState<Record<number, boolean>>(
    Object.fromEntries(agenda.map((item, index) => [index, item.done])),
  );

  const activeTask = agenda.find((item) => item.active) ?? agenda[1];
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <Column fillWidth paddingX="8" paddingY="12" gap="24" maxWidth="xl" horizontal="center">
      <Row as="header" fillWidth paddingX="16" horizontal="between" vertical="center" wrap gap="16">
        <Column gap="4">
          <Text variant="body-strong-m">Focus mode</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {completedCount} of {agenda.length} sessions complete
          </Text>
        </Column>
        <Row gap="12" vertical="center">
          <SegmentedControl buttons={views} value={view} onChange={setView} />
          <IconButton data-border="rounded" variant="ghost" tooltip="Notifications" icon="bell" />
        </Row>
      </Row>

      <Row fillWidth gap="8" m={{ direction: "column" }}>
        <Column
          fillWidth
          flex={2}
          padding="32"
          gap="24"
          radius="l"
          border
          background="overlay"
          center
        >
          <Column
            center
            gap="4"
            width={14}
            height={14}
            minWidth={14}
            minHeight={14}
            radius="full"
            border="brand-alpha-medium"
            background="brand-alpha-weak"
          >
            <Heading variant="display-strong-m">25:00</Heading>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Deep work session
            </Text>
          </Column>

          <Column fillWidth gap="8" horizontal="center" align="center">
            <Tag scheme="brand" size="s">
              In progress
            </Tag>
            <Heading variant="heading-strong-s" align="center">
              {activeTask.title}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {activeTask.project} · {activeTask.duration}
            </Text>
          </Column>

          <Row fillWidth gap="8" horizontal="center">
            <Button size="s" prefixIcon="play">
              Start focus
            </Button>
            <Button size="s" variant="secondary" prefixIcon="forward">
              Skip
            </Button>
            <Button size="s" variant="tertiary" prefixIcon="plus">
              Add break
            </Button>
          </Row>
        </Column>

        <Column fillWidth flex={3} radius="l" border background="surface" overflow="hidden">
          <Row
            fillWidth
            paddingX="24"
            paddingY="16"
            horizontal="between"
            vertical="center"
            borderBottom
          >
            <Heading variant="heading-strong-s">Today&apos;s agenda</Heading>
            <Button size="s" variant="secondary" prefixIcon="plus">
              Add block
            </Button>
          </Row>

          <Column fillWidth>
            {agenda.map((item, index) => (
              <Row
                key={`${item.time}-${item.title}`}
                fillWidth
                paddingX="24"
                paddingY="16"
                gap="16"
                vertical="center"
                borderBottom
                background={item.active ? "brand-alpha-weak" : undefined}
              >
                <Row minWidth={6}>
                  <Text
                    variant="code-default-s"
                    onBackground={item.active ? "brand-medium" : "neutral-weak"}
                  >
                    {item.time}
                  </Text>
                </Row>
                <Checkbox
                  checked={checked[index]}
                  onToggle={() => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))}
                />
                <Column fillWidth gap="4">
                  <Text
                    variant="label-default-s"
                    onBackground={checked[index] ? "neutral-weak" : "neutral-strong"}
                    style={checked[index] ? { textDecoration: "line-through" } : undefined}
                  >
                    {item.title}
                  </Text>
                  <Row gap="8" vertical="center">
                    <Icon name="folder" size="xs" onBackground="neutral-weak" />
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {item.project}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      · {item.duration}
                    </Text>
                  </Row>
                </Column>
                {item.active && <Pulse size="s" />}
              </Row>
            ))}
          </Column>
        </Column>
      </Row>
    </Column>
  );
};
