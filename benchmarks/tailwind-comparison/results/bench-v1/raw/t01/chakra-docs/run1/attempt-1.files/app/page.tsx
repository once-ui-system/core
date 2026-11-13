import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stat,
  Text,
} from "@chakra-ui/react"
import { AppShell } from "@/components/app-shell"
import { PageHeading } from "@/components/page-heading"
import {
  formatDate,
  product,
  projects,
  statusPalette,
  summaryCards,
  user,
} from "@/lib/data"

export default function DashboardPage() {
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3)

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${product.tagline}. Here is how your workspace looks today.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="8">
        {summaryCards.map((card) => (
          <Card.Root key={card.label} variant="outline">
            <Card.Body>
              <Stat.Root>
                <Stat.Label>{card.label}</Stat.Label>
                <Stat.ValueText alignItems="baseline">
                  {card.value}
                  {card.unit ? (
                    <Stat.ValueUnit>{card.unit}</Stat.ValueUnit>
                  ) : null}
                </Stat.ValueText>
                <HStack gap="2" flexWrap="wrap">
                  <Badge colorPalette={card.trend === "up" ? "green" : "blue"}>
                    {card.trend === "up" ? (
                      <Stat.UpIndicator />
                    ) : (
                      <Stat.DownIndicator />
                    )}
                    {card.change}
                  </Badge>
                  <Stat.HelpText>{card.help}</Stat.HelpText>
                </HStack>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h2" size="md">
            Recently updated projects
          </Heading>
        </Card.Header>
        <Card.Body pt="0">
          <Box as="ul" listStyleType="none" m="0" p="0">
            {recent.map((project, index) => (
              <Flex
                as="li"
                key={project.key}
                align="center"
                justify="space-between"
                gap="3"
                py="3"
                borderTopWidth={index === 0 ? "0" : "1px"}
              >
                <Box minW="0">
                  <Text fontWeight="medium" truncate>
                    {project.name}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {project.key} · {project.issues} open issues · Updated{" "}
                    {formatDate(project.updated)}
                  </Text>
                </Box>
                <Badge colorPalette={statusPalette[project.status]}>
                  {project.status}
                </Badge>
              </Flex>
            ))}
          </Box>
        </Card.Body>
      </Card.Root>
    </AppShell>
  )
}
