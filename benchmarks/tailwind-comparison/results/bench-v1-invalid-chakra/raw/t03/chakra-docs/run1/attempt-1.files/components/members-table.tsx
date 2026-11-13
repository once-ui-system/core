import { Box, Flex, Table, Text } from "@chakra-ui/react"
import { Avatar } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, members } from "@/lib/data"

export function MembersTable() {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="lg" bg="bg">
      <Table.Root size="md" interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Member</Table.ColumnHeader>
            <Table.ColumnHeader>Role</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Joined</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {members.map((m) => (
            <Table.Row key={m.id}>
              <Table.Cell>
                <Flex align="center" gap="3">
                  <Avatar name={m.name} size="sm" />
                  <Box>
                    <Text fontWeight="medium" whiteSpace="nowrap">
                      {m.name}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                      {m.email}
                    </Text>
                  </Box>
                </Flex>
              </Table.Cell>
              <Table.Cell>{m.role}</Table.Cell>
              <Table.Cell>
                <StatusBadge status={m.status} />
              </Table.Cell>
              <Table.Cell whiteSpace="nowrap">{formatDate(m.joined)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
