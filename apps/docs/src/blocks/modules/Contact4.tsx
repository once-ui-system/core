"use client";

import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  Tag,
  Text,
  Textarea,
} from "@once-ui-system/core";
import { useState } from "react";

const team = [
  {
    name: "Lorant One",
    role: "Design systems",
    avatar: "/images/creators/lorant.jpg",
    timezone: "CET · Berlin",
  },
  {
    name: "Justin Chen",
    role: "Product engineering",
    avatar: "/images/creators/justin.jpg",
    timezone: "PST · San Francisco",
  },
  {
    name: "Suhaib Khan",
    role: "Developer experience",
    avatar: "/images/creators/suhaib.jpg",
    timezone: "IST · Bangalore",
  },
];

export const Contact4 = (flex: React.ComponentProps<typeof Row>) => {
  const [sent, setSent] = useState(false);

  return (
    <Row fillWidth gap="xl" m={{ direction: "column" }} {...flex}>
      <Column fill minWidth={28} gap="24">
        <Column gap="8">
          <Tag scheme="brand" size="s">
            Sales
          </Tag>
          <Heading variant="display-strong-s" wrap="balance">
            Talk to the team building Once UI
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Whether you're scoping a frontend system or evaluating Pro for your org, we'll connect
            you with the right person.
          </Text>
        </Column>

        <Grid columns={1} gap="8" fillWidth>
          {team.map((member) => (
            <Row
              key={member.name}
              fillWidth
              padding="16"
              radius="l"
              border
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
            >
              <Row gap="16" vertical="center">
                <Avatar src={member.avatar} size="m" />
                <Column gap="2">
                  <Text variant="label-strong-s">{member.name}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {member.role}
                  </Text>
                  <Text variant="code-default-xs" onBackground="neutral-weak">
                    {member.timezone}
                  </Text>
                </Column>
              </Row>
              <Button size="s" variant="secondary" prefixIcon="calendar">
                Book a call
              </Button>
            </Row>
          ))}
        </Grid>
      </Column>

      <Column fill minWidth={22} gap="16" padding="24" radius="xl" background="surface" border>
        <Column gap="4">
          <Heading variant="heading-strong-s">Send an inquiry</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            We'll respond within one business day.
          </Text>
        </Column>

        {sent ? (
          <Column
            fillWidth
            gap="8"
            padding="24"
            radius="l"
            background="brand-alpha-weak"
            border="brand-alpha-weak"
          >
            <Row gap="8" vertical="center" textVariant="label-strong-m" onBackground="brand-medium">
              <Icon name="check" size="s" />
              Inquiry received
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Thanks for reaching out. A team member will follow up shortly.
            </Text>
          </Column>
        ) : (
          <Column gap="12" fillWidth>
            <Row gap="12" fillWidth s={{ direction: "column" }}>
              <Input id="sales-name" label="Name" type="text" />
              <Input id="sales-company" label="Company" type="text" />
            </Row>
            <Input id="sales-email" label="Work email" type="email" />
            <Textarea
              id="sales-message"
              label="What are you building?"
              style={{ minHeight: "5rem" }}
            />
            <Row>
              <Button onClick={() => setSent(true)} arrowIcon>
                Send inquiry
              </Button>
            </Row>
          </Column>
        )}
      </Column>
    </Row>
  );
};
