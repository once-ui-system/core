"use client";

import {
  AvatarGroup,
  Background,
  Badge,
  BlobFx,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Line,
  Pulse,
  Row,
  Scroller,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

const perks = [
  {
    title: "Remote-first",
    description: "Work from anywhere with quarterly team retreats",
    icon: "world" as const,
  },
  {
    title: "Learning budget",
    description: "$2,000/year for courses, books, and conferences",
    icon: "book" as const,
  },
  {
    title: "Equity",
    description: "Meaningful ownership in what you help build",
    icon: "banknotes" as const,
  },
  {
    title: "Flexible hours",
    description: "Core overlap hours, async-friendly culture",
    icon: "calendar" as const,
  },
];

const roles = [
  {
    title: "Senior Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    isNew: true,
    href: "#",
  },
  {
    title: "Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    isNew: false,
    href: "#",
  },
  {
    title: "Developer Advocate",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    isNew: true,
    href: "#",
  },
  {
    title: "Technical Writer",
    department: "Product",
    location: "New York, NY",
    type: "Contract",
    isNew: false,
    href: "#",
  },
  {
    title: "Customer Success Lead",
    department: "Sales",
    location: "Remote",
    type: "Full-time",
    isNew: false,
    href: "#",
  },
];

const departments = ["All", "Design", "Engineering", "Marketing", "Product", "Sales"];

export const Careers3 = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (role) => selectedDepartment === "All" || role.department === selectedDepartment,
      ),
    [selectedDepartment],
  );

  return (
    <Column fillWidth horizontal="center" borderY marginTop="8">
      <Column fillWidth maxWidth="l" borderX>
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

        <Row
          fillWidth
          padding="l"
          gap="16"
          vertical="center"
          horizontal="between"
          borderBottom
          wrap
        >
          <Row gap="8" vertical="center">
            <Badge arrow={false} effect={false} gap="8" paddingLeft="12">
              <Pulse size="s" scheme="brand" />
              <Text onBackground="brand-weak">We're hiring</Text>
            </Badge>
          </Row>
          <Row gap="8" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Open roles
            </Text>
            <Heading variant="heading-strong-s">
              <CountFx value={roles.length} />
            </Heading>
          </Row>
        </Row>

        <Row fillWidth s={{ direction: "column" }}>
          <Column fill minWidth={24} padding="l" gap="24" background="page" overflow="hidden">
            <BlobFx position="absolute" top="0" left="0" translateY="50%" />
            <Column gap="12">
              <Heading as="h2" variant="display-strong-s" wrap="balance">
                Build the future of design systems
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-medium" wrap="balance">
                Join a small, ambitious team shipping tools used by thousands of design engineers
                worldwide.
              </Text>
            </Column>

            <Grid fillWidth columns="2" gap="4">
              {perks.map((perk) => (
                <Column
                  key={perk.title}
                  fillWidth
                  padding="16"
                  gap="8"
                  radius="l"
                  border
                  background="page"
                >
                  <Icon name={perk.icon} size="s" onBackground="brand-weak" />
                  <Heading as="h3" variant="body-default-m">
                    {perk.title}
                  </Heading>
                  <Text variant="label-default-s" wrap="balance" onBackground="neutral-weak">
                    {perk.description}
                  </Text>
                </Column>
              ))}
            </Grid>

            <Row gap="12" vertical="center">
              <AvatarGroup
                size="s"
                limit={4}
                avatars={[
                  { src: "/images/creators/lorant.jpg" },
                  { src: "/images/creators/design-engineers-club.jpg" },
                  { src: "/images/creators/dan-koe.jpg" },
                  { src: "/images/creators/aryan.jpg" },
                  { src: "/images/creators/chander.jpg" },
                ]}
              />
              <Text variant="label-default-s" onBackground="neutral-weak">
                40+ teammates across 12 countries
              </Text>
            </Row>
          </Column>

          <Line vert background="neutral-alpha-weak" s={{ hide: true }} />

          <Column fill minWidth={24} padding="l" gap="16">
            <Column gap="8">
              <Heading as="h3" variant="heading-strong-m">
                Open positions
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Filter by department to find your next role
              </Text>
            </Column>

            <Scroller fitWidth style={{ maxWidth: "100%" }}>
              <Row fitWidth gap="8">
                {departments.map((department) => (
                  <Button
                    key={department}
                    size="s"
                    variant={selectedDepartment === department ? "primary" : "secondary"}
                    weight="default"
                    onClick={() => setSelectedDepartment(department)}
                  >
                    {department}
                  </Button>
                ))}
              </Row>
            </Scroller>

            <Column fillWidth gap="8">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <Row
                    key={role.title}
                    fillWidth
                    padding="20"
                    gap="12"
                    radius="l"
                    border
                    background="page"
                    vertical="center"
                    horizontal="between"
                    s={{ direction: "column", horizontal: "start" }}
                  >
                    <Column gap="16" fillWidth>
                      <Row gap="8" vertical="center" wrap>
                        <Heading as="h4" variant="heading-default-xs">
                          {role.title}
                        </Heading>
                        {role.isNew && (
                          <Row gap="4" vertical="center">
                            <Text variant="label-default-s" onBackground="brand-medium">
                              New
                            </Text>
                          </Row>
                        )}
                      </Row>
                      <Row gap="8" wrap>
                        <Tag scheme="neutral" size="s" label={role.department} />
                        <Tag scheme="neutral" size="s" label={role.type} />
                      </Row>
                    </Column>
                    <Row
                      gap="8"
                      vertical="center"
                      fillWidth
                      horizontal="between"
                      m={{ direction: "column", horizontal: "start" }}
                    >
                      {role.location === "Remote" ? (
                        <Text variant="label-default-s" onBackground="brand-weak">
                          Remote
                        </Text>
                      ) : (
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {role.location}
                        </Text>
                      )}
                      <Button
                        href={role.href}
                        size="s"
                        variant="secondary"
                        suffixIcon="arrowUpRight"
                      >
                        Apply
                      </Button>
                    </Row>
                  </Row>
                ))
              ) : (
                <Column
                  fillWidth
                  padding="24"
                  gap="8"
                  radius="l"
                  border="neutral-alpha-medium"
                  horizontal="center"
                >
                  <Icon name="search" size="m" onBackground="neutral-weak" />
                  <Heading variant="heading-strong-s">No roles in this department</Heading>
                  <Text variant="body-default-s" onBackground="neutral-medium" align="center">
                    Try another filter or check back soon for new openings.
                  </Text>
                </Column>
              )}
            </Column>
          </Column>
        </Row>
      </Column>
    </Column>
  );
};
