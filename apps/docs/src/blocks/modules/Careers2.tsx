"use client";

import { Button, Column, Grid, Heading, Icon, Row, Scroller, Text } from "@once-ui-system/core";
import { useState } from "react";

const roles = [
  {
    title: "Senior Product Designer",
    type: "Full-time",
    location: "San Francisco, CA",
    department: "Design",
    salary: "$120,000 - $180,000",
    href: "#",
  },
  {
    title: "Frontend Developer",
    type: "Full-time",
    location: "Remote",
    department: "Engineering",
    salary: "$120,000 - $180,000",
    href: "#",
  },
  {
    title: "Marketing Manager",
    type: "Full-time",
    location: "New York, NY",
    department: "Marketing",
    salary: "$120,000 - $180,000",
    href: "#",
  },
];

const departments = ["All", "Design", "Engineering", "Marketing", "Sales"];

export const Careers2 = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredRoles = roles.filter(
    (role) => selectedDepartment === "All" || role.department === selectedDepartment,
  );

  return (
    <Column fillWidth fitHeight horizontal="center">
      <Column maxWidth={40} padding="l" gap="12" horizontal="center">
        <Heading as="h2" align="center" variant="display-strong-m">
          Join our team
        </Heading>
        <Text align="center" onBackground="neutral-medium" variant="body-default-xl" wrap="balance">
          We're looking for passionate people to help us build the future of design
        </Text>
      </Column>

      <Column maxWidth="l" padding="l" gap="32" fillWidth horizontal="center">
        <Scroller fitWidth style={{ maxWidth: "100%" }}>
          <Row fitWidth gap="8">
            {departments.map((dept, index) => (
              <Button
                key={index}
                size="s"
                variant={selectedDepartment === dept ? "primary" : "secondary"}
                weight="default"
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept}
              </Button>
            ))}
          </Row>
        </Scroller>

        <Grid fillWidth columns="3" gap="8" s={{ columns: 1 }}>
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role, index) => (
              <Column
                key={index}
                fillWidth
                background="overlay"
                radius="l"
                padding="12"
                gap="8"
                vertical="center"
                border
              >
                <Column fillWidth gap="24" padding="20">
                  <Column fillWidth gap="4">
                    <Heading variant="heading-strong-l">{role.title}</Heading>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {role.salary}
                    </Text>
                  </Column>
                  <Column fillWidth gap="16">
                    <Row gap="8" vertical="center">
                      <Icon name="europe" size="xs" onBackground="neutral-weak" />
                      <Text variant="body-default-s" onBackground="neutral-medium">
                        {role.location}
                      </Text>
                    </Row>
                    <Row gap="8" vertical="center">
                      <Icon name="time" size="xs" onBackground="neutral-weak" />
                      <Text variant="body-default-s" onBackground="neutral-medium">
                        {role.type}
                      </Text>
                    </Row>
                    <Row gap="8" vertical="center">
                      <Icon name="tag" size="xs" onBackground="neutral-weak" />
                      <Text variant="body-default-s" onBackground="neutral-medium">
                        {role.department}
                      </Text>
                    </Row>
                  </Column>
                </Column>
                <Button fillWidth href={role.href} variant="secondary" weight="default" arrowIcon>
                  View role
                </Button>
              </Column>
            ))
          ) : (
            <>
              <Row />
              <Column
                fillWidth
                radius="l"
                padding="l"
                gap="16"
                vertical="center"
                horizontal="center"
              >
                <Column gap="16" horizontal="center">
                  <Icon
                    radius="full"
                    border
                    padding="16"
                    name="search"
                    size="m"
                    marginBottom="16"
                  />
                  <Heading variant="heading-strong-l">No positions found</Heading>
                  <Text
                    wrap="balance"
                    variant="body-default-s"
                    onBackground="neutral-weak"
                    align="center"
                  >
                    We don't currently have any openings in the {selectedDepartment} department.
                  </Text>
                </Column>
              </Column>
              <Row />
            </>
          )}
        </Grid>
      </Column>
    </Column>
  );
};
