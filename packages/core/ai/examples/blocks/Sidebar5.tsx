import { Column, Row, Text, Media, Avatar, IconButton, Heading, Card, DropdownWrapper } from "@once-ui-system/core";
import { chatMembers } from "./content/chat1content";

export const Sidebar5: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillHeight maxWidth={18} background="surface" gap="20" {...flex}>
      <Row paddingX="24" paddingTop="12">
        <Heading as="h2" variant="label-strong-m">
          Members
        </Heading>
      </Row>
      <Column
        fill
        gap="32"
        data-scaling="90"
        paddingX="12"
        paddingBottom="16"
        overflowY="auto"
      >
        {chatMembers.map((group, gIndex) => (
          <Column key={gIndex} fillWidth gap="2">
            <Row vertical="center" gap="8" paddingLeft="16" textVariant="label-default-s" onBackground="neutral-weak" paddingBottom="4">
              <Text>{group.title}</Text>
              <Row width="4" height="4" radius="full" background="neutral-strong"/>
              <Text>{group.members.length}</Text>
            </Row>
            {group.members.map((member, index) => (
              <DropdownWrapper
                fillWidth
                key={index}
                placement="left-start"
                trigger={
                  <Card paddingY="8" paddingX="16" border="transparent" background="transparent" radius="m" key={index} fillWidth gap="16" vertical="center">
                    <Avatar src={member.avatar} statusIndicator={{ color: member.statusColor as "green" | "gray" }} />
                    <Column fillWidth gap="2">
                      <Text variant="label-strong-s" truncate>{member.name}</Text>
                      {member.status && (
                        <Text variant="body-default-xs" onBackground="neutral-weak" truncate>{member.status}</Text>
                      )}
                    </Column>
                  </Card>
                }
                dropdown={
                  <Column maxWidth={20} fitHeight tabIndex={-1}>
                    <Row fillWidth>
                      <Media src="/images/backgrounds/1.jpg" sizes="320px" aspectRatio="2/1" />
                      <Row position="absolute" right="12" top="12" data-border="rounded" gap="8">
                        <IconButton icon="personRemove" tooltip="Remove" tooltipPosition="bottom"/>
                        <IconButton icon="settings" tooltip="Settings" tooltipPosition="bottom"/>
                      </Row>
                      <Avatar position="absolute" left="12" bottom="0" src={member.avatar} size={6} statusIndicator={{ color: member.statusColor as "green" | "gray" }} style={{transform: "translateY(50%)"}} borderWidth={4} border="surface" />
                    </Row>
                    <Column fillWidth padding="20" marginTop="40" gap="12">
                      <Column fillWidth gap="2">
                        <Text variant="heading-strong-s">{member.name}</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">{member.status}</Text>
                      </Column>
                      {member.bio && (
                        <Row fillWidth>
                          <Text variant="body-default-xs" onBackground="neutral-weak">{member.bio}</Text>
                        </Row>
                      )}
                    </Column>
                  </Column>
                }
              />
            ))}
          </Column>
        ))}
      </Column>
    </Column>
  )
}