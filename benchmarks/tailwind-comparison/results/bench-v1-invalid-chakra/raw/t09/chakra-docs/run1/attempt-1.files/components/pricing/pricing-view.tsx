"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  HStack,
  List,
  Stack,
  Switch,
  Table,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { LuCheck, LuMinus } from "react-icons/lu"
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion"
import {
  comparison,
  faq,
  formatPrice,
  plans,
  yearlyPerMonth,
  yearlyTotal,
  type ComparisonRow,
} from "@/lib/data"

function Cell({ value, plan }: { value: string | boolean; plan: string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Box as="span" color="brand.fg" display="inline-flex">
        <LuCheck aria-hidden="true" />
        <Box as="span" srOnly>
          Included in {plan}
        </Box>
      </Box>
    ) : (
      <Box as="span" color="fg.subtle" display="inline-flex">
        <LuMinus aria-hidden="true" />
        <Box as="span" srOnly>
          Not included in {plan}
        </Box>
      </Box>
    )
  }
  return <>{value}</>
}

function rowValues(row: ComparisonRow) {
  return [
    { plan: "Free", value: row.free },
    { plan: "Team", value: row.team },
    { plan: "Business", value: row.business },
  ]
}

export function PricingView() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      <Box
        as="section"
        aria-labelledby="pricing-title"
        borderBottomWidth="1px"
        borderColor="border"
        bgGradient="to-b"
        gradientFrom="brand.subtle"
        gradientTo="bg"
      >
        <Container maxW="4xl" py={{ base: "14", md: "20" }}>
          <Stack gap="6" align="center" textAlign="center">
            <Heading
              as="h1"
              id="pricing-title"
              fontSize={{ base: "4xl", md: "5xl" }}
              letterSpacing="tight"
            >
              Simple pricing for small teams
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }} maxW="xl">
              Start free, move to Team when you ship together, and add SSO and
              audit logs on Business.
            </Text>

            <Switch.Root
              checked={yearly}
              onCheckedChange={(e) => setYearly(e.checked)}
              size="lg"
            >
              <Switch.HiddenInput aria-label="Bill yearly" />
              <Text
                as="span"
                fontWeight={yearly ? "normal" : "semibold"}
                color={yearly ? "fg.muted" : "fg"}
              >
                Monthly
              </Text>
              <Switch.Control mx="3">
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label>
                <Text
                  as="span"
                  fontWeight={yearly ? "semibold" : "normal"}
                  color={yearly ? "fg" : "fg.muted"}
                >
                  Yearly
                </Text>
                <Badge ms="2" bg="brand.subtle" color="brand.fg">
                  2 months free
                </Badge>
              </Switch.Label>
            </Switch.Root>
          </Stack>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: "10", md: "16" }}>
        <Grid
          as="ul"
          listStyleType="none"
          m="0"
          p="0"
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap="6"
          alignItems="stretch"
        >
          {plans.map((plan) => {
            const price = yearly
              ? yearlyPerMonth(plan.priceMonth)
              : plan.priceMonth
            return (
              <Box as="li" key={plan.name} display="flex">
                <Card.Root
                  w="full"
                  variant="outline"
                  borderWidth={plan.highlight ? "2px" : "1px"}
                  borderColor={plan.highlight ? "brand.solid" : "border"}
                  bg="bg.panel"
                  position="relative"
                >
                  <Card.Header>
                    <HStack justify="space-between">
                      <Card.Title
                        as="h2"
                        fontFamily="heading"
                        fontSize="2xl"
                      >
                        {plan.name}
                      </Card.Title>
                      {plan.highlight && (
                        <Badge
                          bg="brand.solid"
                          color="brand.contrast"
                          variant="solid"
                        >
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
                          aria-label={`${formatPrice(price)} per month`}
                        >
                          {formatPrice(price)}
                        </Text>
                        <Text color="fg.muted" fontSize="sm">
                          {plan.priceMonth === 0
                            ? "forever"
                            : `/ month, ${plan.seats}`}
                        </Text>
                      </HStack>
                      <Text color="fg.muted" fontSize="sm" mt="2" minH="5">
                        {plan.priceMonth === 0
                          ? plan.seats
                          : yearly
                            ? `Billed ${formatPrice(yearlyTotal(plan.priceMonth))} per seat yearly`
                            : "Billed monthly"}
                      </Text>
                    </Box>
                    <List.Root
                      variant="plain"
                      gap="3"
                      aria-label={`${plan.name} features`}
                    >
                      {plan.features.map((feature) => (
                        <List.Item key={feature} alignItems="flex-start">
                          <List.Indicator asChild color="brand.solid" mt="1">
                            <LuCheck />
                          </List.Indicator>
                          {feature}
                        </List.Item>
                      ))}
                    </List.Root>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      w="full"
                      variant={plan.highlight ? "solid" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Card.Footer>
                </Card.Root>
              </Box>
            )
          })}
        </Grid>

        <Box as="section" aria-labelledby="compare-title" mt={{ base: "16", md: "24" }}>
          <Heading
            as="h2"
            id="compare-title"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="tight"
            mb="6"
          >
            Compare plans
          </Heading>
          <Table.ScrollArea
            borderWidth="1px"
            borderColor="border"
            borderRadius="l2"
          >
            <Table.Root size="md" minW="xl">
              <Table.Caption srOnly>
                Feature comparison of the Free, Team and Business plans
              </Table.Caption>
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader scope="col">Feature</Table.ColumnHeader>
                  <Table.ColumnHeader scope="col">Free</Table.ColumnHeader>
                  <Table.ColumnHeader
                    scope="col"
                    color="brand.fg"
                  >
                    Team
                  </Table.ColumnHeader>
                  <Table.ColumnHeader scope="col">Business</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {comparison.map((row) => (
                  <Table.Row key={row.feature}>
                    <Table.Cell as="th" scope="row" fontWeight="medium" textAlign="start">
                      {row.feature}
                    </Table.Cell>
                    {rowValues(row).map(({ plan, value }) => (
                      <Table.Cell
                        key={plan}
                        bg={plan === "Team" ? "brand.subtle" : undefined}
                      >
                        <Cell value={value} plan={plan} />
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>

        <Box
          id="faq"
          as="section"
          aria-labelledby="faq-title"
          mt={{ base: "16", md: "24" }}
          maxW="3xl"
          mx="auto"
          scrollMarginTop="24"
        >
          <Heading
            as="h2"
            id="faq-title"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="tight"
            mb="6"
          >
            Frequently asked questions
          </Heading>
          <AccordionRoot collapsible defaultValue={[faq[0].q]}>
            {faq.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionItemTrigger fontWeight="medium">
                  {item.q}
                </AccordionItemTrigger>
                <AccordionItemContent color="fg.muted">
                  {item.a}
                </AccordionItemContent>
              </AccordionItem>
            ))}
          </AccordionRoot>
        </Box>
      </Container>
    </>
  )
}
