"use client";

import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { formatDate, projects, summaryCards, user } from "../lib/data";

export function Dashboard() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <Column gap="24">
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Good morning, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12" aria-label="Summary">
        {summaryCards.map((card) => (
          <Column key={card.label} background="surface" border radius="m" padding="16" gap="8">
            <Row vertical="center" horizontal="between">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
              <Icon name={card.icon} size="s" onBackground="neutral-weak" />
            </Row>
            <Text as="p" textVariant="display-strong-xs">
              {card.value}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column>
          {recent.map((project, index) => (
            <Row
              key={project.key}
              horizontal="between"
              vertical="center"
              paddingY="8"
              gap="12"
              borderTop={index === 0 ? undefined : true}
            >
              <Row gap="12" vertical="center">
                <Text textVariant="label-strong-s" onBackground="brand-strong">
                  {project.key}
                </Text>
                <Text textVariant="body-default-s">{project.name}</Text>
              </Row>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {formatDate(project.updated)}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
