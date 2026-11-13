"use client"

import NextLink from "next/link"
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  List,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  Accordion,
  Span,
} from "@chakra-ui/react"
import { useId, useState } from "react"
import { LuCheck, LuMinus } from "react-icons/lu"
import {
  comparison,
  faq,
  formatPrice,
  formatYearlyTotal,
  plans,
  type ComparisonValue,
} from "@/lib/data"

function Cell({ value }: { value: ComparisonValue }) {
  if (value === true) {
    return (
      <>
        <Box as="span" color="brand.fg" aria-hidden="true" display="inline-flex">
          <LuCheck />
        </Box>
        <Span srOnly>Included</Span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Box as="span" color="fg.subtle" aria-hidden="true" display="inline-flex">
          <LuMinus />
        </Box>
        <Span srOnly>Not included</Span>
      </>
    )
  }
  return <>{value}</>
}

export function PricingView() {
  const [yearly, setYearly] = useState(false)
  const switchId = useId()

  return (
    <>
      <Box as="section" aria-labelledby="pricing-title">
        <Container maxW="6xl" py={{ base: "12", md: "20" }}>
          <Stack gap="5" align="center" textAlign="center" mb="10">
            <Heading
              as="h1"
              id="pricing-title"
              fontFamily="heading"
              fontSize={{ base: "4xl", md: "5xl" }}
              letterSpacing="tight"
            >
              Simple pricing for small teams
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }} maxW="xl">
              Start free. Pay per seat when your team grows. Switch to yearly
              billing and get two months free.
            </Text>

            <HStack gap="3">
              <Text
                as="span"
                id={`${switchId}-monthly`}
                fontWeight={yearly ? "normal" : "semibold"}
                color={yearly ? "fg.muted" : "fg"}
              >
                Monthly
              </Text>
              <Switch.Root
                checked={yearly}
                onCheckedChange={(e) => setYearly(e.checked)}
                aria-label="Bill yearly"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
              <Text
                as="span"
                id={`${switchId}-yearly`}
                fontWeight={yearly ? "semibold" : "normal"}
                color={yearly ? "fg" : "fg.muted"}
              >
                Yearly
              </Text>
              <Badge colorPalette="brand" variant="subtle">
                2 months free
              </Badge>
            </HStack>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6" alignItems="stretch">
            {plans.map((plan) => {
              const highlighted = plan.highlight === true
              const free = plan.priceMonth === 0
              return (
                <Card.Root
                  key={plan.name}
                  variant="outline"
                  borderWidth={highlighted ? "2px" : "1px"}
                  borderColor={highlighted ? "brand.solid" : "border"}
                  bg={highlighted ? "brand.subtle" : "bg.panel"}
                  position="relative"
                >
                  <Card.Header>
                    <HStack justify="space-between" align="center">
                      <Card.Title
                        as="h2"
                        fontFamily="heading"
                        fontSize="2xl"
                      >
                        {plan.name}
                      </Card.Title>
                      {highlighted && (
                        <Badge colorPalette="brand" variant="solid">
                          Most popular
                        </Badge>
                      )}
                    </HStack>
                    <Card.Description>{plan.blurb}</Card.Description>
                  </Card.Header>
                  <Card.Body gap="5">
                    <Box>
                      <HStack align="baseline" gap="2">
                        <Text
                          fontFamily="heading"
                          fontSize="5xl"
                          fontWeight="bold"
                          lineHeight="1"
                        >
                          {formatPrice(plan.priceMonth, yearly)}
                        </Text>
                        <Text color="fg.muted" textStyle="sm">
                          {free ? "forever" : `/ month, ${plan.seats}`}
                        </Text>
                      </HStack>
                      <Text color="fg.muted" textStyle="sm" mt="2" minH="5">
                        {free
                          ? plan.seats
                          : yearly
                            ? `${formatYearlyTotal(plan.priceMonth)} per seat, billed yearly`
                            : "Billed monthly"}
                      </Text>
                    </Box>
                    <List.Root gap="3" variant="plain">
                      {plan.features.map((feature) => (
                        <List.Item key={feature} alignItems="flex-start">
                          <List.Indicator color="brand.fg" mt="1">
                            <LuCheck />
                          </List.Indicator>
                          {feature}
                        </List.Item>
                      ))}
                    </List.Root>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      asChild
                      w="full"
                      variant={highlighted ? "solid" : "outline"}
                      colorPalette={highlighted ? "brand" : "gray"}
                    >
                      <NextLink href="/pricing">{plan.cta}</NextLink>
                    </Button>
                  </Card.Footer>
                </Card.Root>
              )
            })}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" aria-labelledby="compare-title" bg="bg.subtle" borderTopWidth="1px" borderBottomWidth="1px" borderColor="border">
        <Container maxW="5xl" py={{ base: "12", md: "20" }}>
          <Heading
            as="h2"
            id="compare-title"
            fontFamily="heading"
            fontSize={{ base: "2xl", md: "4xl" }}
            textAlign="center"
            letterSpacing="tight"
            mb="8"
          >
            Compare plans
          </Heading>
          <Table.ScrollArea
            borderWidth="1px"
            borderColor="border"
            rounded="l3"
            bg="bg.panel"
          >
            <Table.Root size="md" minW="560px">
              <Table.Caption srOnly>
                Feature comparison of the Free, Team and Business plans
              </Table.Caption>
              <Table.Header>
                <Table.Row bg="bg.panel">
                  <Table.ColumnHeader scope="col">Feature</Table.ColumnHeader>
                  {plans.map((plan) => (
                    <Table.ColumnHeader
                      key={plan.name}
                      scope="col"
                      textAlign="center"
                      color={plan.highlight ? "brand.fg" : undefined}
                    >
                      {plan.name}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {comparison.map((row) => (
                  <Table.Row key={row.feature} bg="bg.panel">
                    <Table.Cell as="th" scope="row" fontWeight="medium" textAlign="start">
                      {row.feature}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Cell value={row.free} />
                    </Table.Cell>
                    <Table.Cell textAlign="center" bg="brand.subtle">
                      <Cell value={row.team} />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Cell value={row.business} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Container>
      </Box>

      <Box as="section" aria-labelledby="faq-title">
        <Container maxW="3xl" py={{ base: "12", md: "20" }}>
          <Heading
            as="h2"
            id="faq-title"
            fontFamily="heading"
            fontSize={{ base: "2xl", md: "4xl" }}
            textAlign="center"
            letterSpacing="tight"
            mb="8"
          >
            Frequently asked questions
          </Heading>
          <Accordion.Root collapsible defaultValue={[faq[0].q]}>
            {faq.map((item) => (
              <Accordion.Item key={item.q} value={item.q}>
                <Accordion.ItemTrigger>
                  <Span flex="1" fontWeight="medium">
                    {item.q}
                  </Span>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody color="fg.muted">
                    {item.a}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Container>
      </Box>
    </>
  )
}
