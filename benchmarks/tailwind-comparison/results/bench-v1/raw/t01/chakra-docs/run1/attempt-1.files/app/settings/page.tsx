import { Box, Card, DataList, Heading, Text } from "@chakra-ui/react"
import { PageHeading } from "@/components/page-heading"
import { SettingsForm } from "@/components/settings-form"
import { user } from "@/lib/data"

export const metadata = { title: "Settings · Lumen" }

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />

      <Box display="grid" gap="6" maxW="3xl">
        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md">
              Account
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              Details for the signed-in user.
            </Text>
          </Card.Header>
          <Card.Body>
            <DataList.Root orientation="horizontal" gap="3">
              <DataList.Item>
                <DataList.ItemLabel>Name</DataList.ItemLabel>
                <DataList.ItemValue>{user.name}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Email</DataList.ItemLabel>
                <DataList.ItemValue>{user.email}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Role</DataList.ItemLabel>
                <DataList.ItemValue>{user.role}</DataList.ItemValue>
              </DataList.Item>
            </DataList.Root>
          </Card.Body>
        </Card.Root>

        <SettingsForm />
      </Box>
    </>
  )
}
