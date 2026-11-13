"use client"

import { Box, Card, Grid, Heading, Link, Stat, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { ProjectsTable } from "@/components/projects-table"
import { formatDate, projects, user } from "@/lib/data"

export default function DashboardPage() {
  const totalIssues = projects.reduce((n, p) => n + p.issues, 0)
  const active = projects.filter((p) => p.status === "Active").length
  const paused = projects.filter((p) => p.status === "Paused").length
  const archived = projects.filter((p) => p.status === "Archived").length
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0]
  const byUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
  const latest = byUpdated[0]

  const cards = [
    { label: "Open issues", value: String(totalIssues), help: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active), help: `${paused} paused, ${archived} archived` },
    { label: "Busiest project", value: busiest.key, help: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), help: latest.name },
  ]

  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Welcome back, {user.name.split(" ")[0]}
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="5">
        Here is where the workspace at Acme Labs stands today.
      </Text>

      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }}
        gap="3"
        mb="6"
      >
        {cards.map((c) => (
          <Card.Root key={c.label} size="sm" variant="outline">
            <Card.Body>
              <Stat.Root>
                <Stat.Label>{c.label}</Stat.Label>
                <Stat.ValueText fontFamily="heading">{c.value}</Stat.ValueText>
                <Stat.HelpText>{c.help}</Stat.HelpText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Box as="section" aria-labelledby="recent-heading">
        <Box display="flex" justifyContent="space-between" alignItems="baseline" mb="2">
          <Heading as="h2" id="recent-heading" size="md">
            Recently updated
          </Heading>
          <Link asChild color="brand.fg" textStyle="sm">
            <NextLink href="/projects">View all projects</NextLink>
          </Link>
        </Box>
        <ProjectsTable items={byUpdated.slice(0, 3)} label="Recently updated projects" />
      </Box>
    </Box>
  )
}
