"use client";

import { Avatar, Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, members, statusColor, type Member } from "../lib/data";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function MembersScreen() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Members
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          {members.length} people have access to this workspace. Use the command palette to invite more.
        </Text>
      </div>

      <Card withBorder padding={0} visibleFrom="sm">
        <Table.ScrollContainer minWidth={640}>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Caption>Workspace members with role, status and join date</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Member</Table.Th>
                <Table.Th scope="col">Role</Table.Th>
                <Table.Th scope="col">Status</Table.Th>
                <Table.Th scope="col">Joined</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((member: Member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="indigo" radius="xl" size="sm" aria-hidden>
                        {initials(member.name)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {member.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {member.email}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>{member.role}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(member.joined)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      <SimpleGrid cols={1} hiddenFrom="sm" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {members.map((member: Member) => (
          <li key={member.id}>
            <Card withBorder padding="md">
              <Group wrap="nowrap" align="flex-start">
                <Avatar color="indigo" radius="xl" aria-hidden>
                  {initials(member.name)}
                </Avatar>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text fw={600} truncate>
                    {member.name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {member.email}
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge variant="outline" color="gray">
                      {member.role}
                    </Badge>
                    <Badge variant="light" color={statusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt="xs">
                    {member.joined ? `Joined ${formatDate(member.joined)}` : "Invitation pending"}
                  </Text>
                </div>
              </Group>
            </Card>
          </li>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
