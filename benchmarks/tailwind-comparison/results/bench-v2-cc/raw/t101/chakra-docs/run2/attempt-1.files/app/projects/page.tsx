"use client"

import { Box, Heading, Text } from "@chakra-ui/react"
import { ProjectsTable } from "@/components/projects-table"
import { projects } from "@/lib/data"

export default function ProjectsPage() {
  const total = projects.reduce((n, p) => n + p.issues, 0)
  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Projects
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="4">
        {projects.length} projects, {total} open issues in total.
      </Text>
      <ProjectsTable items={projects} label="All projects" />
    </Box>
  )
}
