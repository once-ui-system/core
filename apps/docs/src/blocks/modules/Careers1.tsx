"use client";

import { Button, Card, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

const roles = [
  {
    title: "Senior Product Designer",
    type: "Full-time",
    location: "San Francisco, CA",
    department: "Design",
    href: "#",
  },
  {
    title: "Frontend Developer",
    type: "Full-time",
    location: "Remote",
    department: "Engineering",
    href: "#",
  },
  {
    title: "Marketing Manager",
    type: "Full-time",
    location: "New York, NY",
    department: "Marketing",
    href: "#",
  },
];

const departments = ["All", "Design", "Engineering", "Marketing", "Sales"];

export const Careers1 = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const filteredRoles = roles.filter(
    (role) => selectedDepartment === "All" || role.department === selectedDepartment,
  );

  return (
    <Row fillWidth fitHeight horizontal="center">
      <Column fillWidth horizontal="center" maxWidth="m">
        <Row
          fillWidth
          horizontal="center"
          borderTop="neutral-medium"
          borderX="neutral-medium"
          paddingX="l"
          paddingY="24"
          textVariant="body-default-s"
          align="center"
          onBackground="brand-weak"
        >
          Open positions
        </Row>
        <Row fillWidth horizontal="center" borderTop="neutral-medium" borderX="neutral-medium">
          <Column maxWidth="xs" gap="16" paddingY="48" paddingX="24">
            <Heading variant="display-strong-s" align="center">
              Join our team
            </Heading>
            <Text
              variant="body-default-xl"
              align="center"
              wrap="balance"
              onBackground="neutral-weak"
            >
              We're looking for passionate people to help us build the future of design
            </Text>
          </Column>
        </Row>

        <Row
          fillWidth
          borderTop="neutral-medium"
          borderX="neutral-medium"
          paddingX="l"
          paddingY="24"
          gap="8"
          overflowX="auto"
        >
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

        <Column fillWidth gap="-1">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role, index) => (
              <Card
                direction="column"
                key={index}
                href={role.href}
                fillWidth
                background="page"
                border="neutral-medium"
                padding="l"
                gap="24"
                vertical="center"
              >
                <Column gap="8" fillWidth>
                  <Heading variant="heading-strong-l">{role.title}</Heading>
                  <Row gap="24">
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
                  </Row>
                </Column>
              </Card>
            ))
          ) : (
            <Row
              fillWidth
              border="neutral-medium"
              padding="xl"
              gap="12"
              vertical="center"
              horizontal="center"
            >
              <Column gap="8" horizontal="center">
                <Icon name="search" size="m" onBackground="neutral-weak" marginBottom="16" />
                <Heading variant="heading-strong-l">No positions found</Heading>
                <Text variant="body-default-s" onBackground="neutral-medium" align="center">
                  We currently don't have openings in the {selectedDepartment} department
                </Text>
              </Column>
            </Row>
          )}
        </Column>
      </Column>
    </Row>
  );
};
