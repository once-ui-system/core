import { Badge, Box, Card, Heading, Stack, Text } from "@chakra-ui/react"
import {
  MAX_INVITES,
  teamSizes,
  themeOptions,
  type OnboardingData,
} from "@/lib/data"
import { isEmail } from "@/lib/validation"

interface SummaryCardProps {
  data: OnboardingData
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Text as="dt" textStyle="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Box as="dd" m="0" mt="0.5" textStyle="sm" wordBreak="break-word">
        {children}
      </Box>
    </Box>
  )
}

function Empty() {
  return <Text as="span" color="fg.subtle">Not set yet</Text>
}

export function SummaryCard({ data }: SummaryCardProps) {
  const teamSizeLabel = teamSizes.find((t) => t.value === data.teamSize)?.label
  const themeLabel = themeOptions.find((t) => t.value === data.theme)?.label
  const invites = data.invites
    .slice(0, MAX_INVITES)
    .map((e) => e.trim())
    .filter((e) => e !== "" && isEmail(e))

  return (
    <Card.Root variant="outline" as="section" aria-labelledby="summary-heading">
      <Card.Header>
        <Heading as="h2" id="summary-heading" size="md">
          Your setup so far
        </Heading>
        <Card.Description>
          This updates as you fill in each step.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack as="dl" m="0" gap="4" aria-live="polite">
          <Row label="Name">{data.name.trim() || <Empty />}</Row>
          <Row label="Work email">{data.email.trim() || <Empty />}</Row>
          <Row label="Workspace">{data.workspace.trim() || <Empty />}</Row>
          <Row label="Team size">{teamSizeLabel ?? <Empty />}</Row>
          <Row label="Invitations">
            {invites.length === 0 ? (
              <Text as="span" color="fg.subtle">
                No one invited yet
              </Text>
            ) : (
              <Stack gap="1" as="ul" listStyleType="none" m="0" p="0">
                {invites.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </Stack>
            )}
          </Row>
          <Row label="Theme">
            <Badge variant="subtle">{themeLabel}</Badge>
          </Row>
          <Row label="Weekly digest">
            <Badge
              variant="subtle"
              colorPalette={data.weeklyDigest ? "green" : "gray"}
            >
              {data.weeklyDigest ? "On" : "Off"}
            </Badge>
          </Row>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
