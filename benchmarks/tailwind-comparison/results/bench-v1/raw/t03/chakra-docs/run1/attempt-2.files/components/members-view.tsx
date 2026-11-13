"use client";

import { Avatar, Badge, Box, Button, Flex, Heading, HStack, Table, Text } from "@chakra-ui/react";
import { LuUserPlus } from "react-icons/lu";
import { useAppShell } from "@/components/app-shell-provider";
import { formatDate, members, statusColor } from "@/lib/data";

export function MembersView() {
  const { openInvite } = useAppShell();

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap="3" mb="5" wrap="wrap">
        <Box>
          <Heading as="h1" size="2xl">
            Members
          </Heading>
          <Text color="fg.muted" mt="1">
            {members.length} people have access to Acme Labs.
          </Text>
        </Box>
        <Button onClick={openInvite}>
          <LuUserPlus />
          Invite member
        </Button>
      </Flex>

      <Table.ScrollArea borderWidth="1px" rounded="md" bg="bg">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>Workspace members with role, status and join date</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Member</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Joined</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map((member) => (
              <Table.Row key={member.id}>
                <Table.Cell>
                  <HStack gap="3" minW="48">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback name={member.name} />
                    </Avatar.Root>
                    <Box minW="0">
                      <Text fontWeight="medium">{member.name}</Text>
                      <Text color="fg.muted" textStyle="xs">
                        {member.email}
                      </Text>
                    </Box>
                  </HStack>
                </Table.Cell>
                <Table.Cell>{member.role}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[member.status]}>{member.status}</Badge>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatDate(member.joined)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
