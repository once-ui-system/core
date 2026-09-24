"use client";

import {
  Avatar,
  AvatarGroup,
  Background,
  Badge,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Pulse,
  Row,
  Tag,
  Text,
  Textarea,
  Timeline,
  type TimelineItem,
} from "@once-ui-system/core";

const roleDetails = {
  title: "Senior Frontend Engineer",
  type: "Full-time",
  location: "Remote",
  department: "Engineering",
  salary: "$140,000 - $190,000",
  posted: "Posted 3 days ago",
  description:
    "Help us ship the next generation of Once UI. You will own complex UI surfaces, improve performance across our component library, and partner closely with design on polished product experiences.",
  responsibilities: [
    "Build and maintain high-quality React components in our design system",
    "Improve bundle size, runtime performance, and developer experience",
    "Collaborate with designers to refine interaction details and accessibility",
    "Review code, mentor teammates, and contribute to technical direction",
  ],
  requirements: [
    "4+ years building production React applications",
    "Deep experience with TypeScript and modern CSS patterns",
    "Strong eye for UI polish and interaction design",
    "Comfortable working async across time zones",
  ],
};

const hiringSteps = [
  { label: "Intro call", description: "30 min with recruiting", state: "active" },
  { label: "Technical screen", description: "Live coding + architecture", state: "active" },
  { label: "Team interview", description: "Meet the product squad", state: "default" },
  { label: "Final conversation", description: "Values and offer discussion", state: "default" },
];

const team = [
  "/images/creators/lorant.jpg",
  "/images/creators/zsofia.jpg",
  "/images/creators/vincent.jpg",
  "/images/creators/light.jpg",
];

export const Role3 = () => {
  return (
    <Column fillWidth horizontal="center" padding="l" gap="48">
      <Row maxWidth="l" fillWidth gap="48" m={{ direction: "column-reverse" }}>
        <Column fillWidth gap="32">
          <Column gap="16">
            <Button
              size="s"
              variant="secondary"
              rounded
              weight="default"
              prefixIcon="chevronLeft"
              href="#"
            >
              Back to openings
            </Button>
            <Row gap="16" vertical="center">
              <Tag scheme="brand">New role</Tag>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                {roleDetails.posted}
              </Text>
            </Row>
            <Heading variant="display-strong-s">{roleDetails.title}</Heading>
            <Row gap="24" wrap>
              <Row gap="8" vertical="center">
                <Icon name="world" size="xs" onBackground="neutral-weak" />
                <Text variant="body-default-s">{roleDetails.location}</Text>
              </Row>
              <Row gap="8" vertical="center">
                <Icon name="calendar" size="xs" onBackground="neutral-weak" />
                <Text variant="body-default-s">{roleDetails.type}</Text>
              </Row>
              <Row gap="8" vertical="center">
                <Icon name="banknotes" size="xs" onBackground="neutral-weak" />
                <Text variant="body-default-s">{roleDetails.salary}</Text>
              </Row>
            </Row>
          </Column>

          <Text variant="body-default-l" onBackground="neutral-medium">
            {roleDetails.description}
          </Text>

          <Column gap="16">
            <Heading variant="heading-strong-l">What you'll do</Heading>
            <Column gap="8">
              {roleDetails.responsibilities.map((item) => (
                <Row key={item} gap="12" vertical="center">
                  <Icon name="check" size="s" onBackground="brand-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {item}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>

          <Column gap="16">
            <Heading variant="heading-strong-l">What we're looking for</Heading>
            <Column gap="8">
              {roleDetails.requirements.map((item) => (
                <Row key={item} gap="12" vertical="center">
                  <Icon name="check" size="s" onBackground="brand-weak" />
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {item}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>

          <Column
            marginTop="24"
            fillWidth
            radius="xl"
            border="brand-alpha-weak"
            padding="l"
            gap="24"
            overflow="hidden"
          >
            <Background
              position="absolute"
              top="0"
              left="0"
              gradient={{
                display: true,
                x: 100,
                y: 0,
                colorStart: "brand-alpha-weak",
              }}
            />
            <Column gap="8">
              <Heading variant="heading-strong-l">Apply for this role</Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Share a few details and we will respond within one week.
              </Text>
            </Column>
            <Grid columns={2} fillWidth gap="12" s={{ columns: 1 }}>
              <Input id="role3-name" placeholder="Full name" />
              <Input id="role3-email" placeholder="Email" type="email" />
            </Grid>
            <Input id="role3-github" placeholder="GitHub or portfolio URL" />
            <Textarea id="role3-message" placeholder="Tell us about a project you're proud of" />
            <Button arrowIcon>Submit application</Button>
          </Column>
        </Column>

        <Column
          fillWidth
          maxWidth={28}
          fitHeight
          position="sticky"
          top="80"
          gap="16"
          m={{ position: "relative", top: "0" }}
        >
          <Column fillWidth radius="xl" border padding="l" gap="20" background="surface">
            <Column gap="8">
              <Heading variant="heading-strong-m">Meet the team</Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                You will work closely with this squad on core product surfaces.
              </Text>
            </Column>
            <AvatarGroup avatars={team.map((src) => ({ src }))} size="m" />
            <Column gap="12">
              <Row horizontal="between" vertical="center" paddingTop="24">
                <Text variant="label-strong-m">Hiring manager</Text>
                <Badge arrow={false} effect={false} gap="12" paddingLeft="12" paddingY="8">
                  <Pulse size="s" />
                  Active
                </Badge>
              </Row>
              <Row gap="12" vertical="center">
                <Avatar src="/images/creators/lorant.jpg" size="m" />
                <Column gap="2">
                  <Text variant="label-strong-s">Lorant One</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Design Engineer
                  </Text>
                </Column>
              </Row>
            </Column>
          </Column>

          <Column fillWidth radius="xl" border padding="l" gap="16" background="surface">
            <Heading variant="heading-strong-m">Interview process</Heading>
            <Timeline
              size="xs"
              items={hiringSteps.map((item) => ({
                ...item,
                state: item.state as TimelineItem["state"],
              }))}
            />
          </Column>
        </Column>
      </Row>
    </Column>
  );
};
