"use client"

import NextLink from "next/link"
import {
  Badge,
  Card,
  Heading,
  Link,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, projects, user } from "@/lib/data"

const statusColor = {
  Active: "brand",
  Paused: "orange",
  Archived: "gray",
} as const

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active")
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0]
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
  const firstName = user.name.split(" ")[0]

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: "1 paused, 1 archived" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open` },
    { label: "Last update", value: formatDate(latest[0].updated), note: latest[0].name },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3" mb="5">
        {cards.map((card) => (
          <Card.Root key={card.label} variant="outline">
            <Card.Body gap="0.5">
              <Text textStyle="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em">
                {card.label}
              </Text>
              <Text
                fontFamily="heading"
                fontSize="2xl"
                fontWeight="semibold"
                fontVariantNumeric="tabular-nums"
              >
                {card.value}
              </Text>
              <Text textStyle="xs" color="fg.muted">
                {card.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Heading as="h2" size="md" fontWeight="semibold">
            Recently updated
          </Heading>
          <Link asChild textStyle="sm">
            <NextLink href="/projects">View all projects</NextLink>
          </Link>
        </Card.Header>
        <Card.Body p="0">
          <Table.ScrollArea>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Project</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
                  <Table.ColumnHeader>Updated</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {latest.slice(0, 4).map((p) => (
                  <Table.Row key={p.key}>
                    <Table.Cell>
                      <Text as="span" fontFamily="mono" textStyle="xs" color="fg.muted" mr="2">
                        {p.key}
                      </Text>
                      {p.name}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge size="sm" variant="subtle" colorPalette={statusColor[p.status]}>
                        {p.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                      {p.issues}
                    </Table.Cell>
                    <Table.Cell>{formatDate(p.updated)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Card.Body>
      </Card.Root>
    </>
  )
}
