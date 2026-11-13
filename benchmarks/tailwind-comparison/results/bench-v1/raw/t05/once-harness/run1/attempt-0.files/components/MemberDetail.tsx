import { Avatar, Column, Grid, Heading, Icon, Row, SmartLink, Text } from "@once-ui-system/core";
import {
  ROLE_DESCRIPTIONS,
  formatDate,
  getActivity,
  getInitials,
  type Member,
} from "@/lib/data";
import { RoleBadge, StatusBadge } from "./Badges";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Column gap="4" as="div">
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      {children}
    </Column>
  );
}

export function MemberDetail({ member }: { member: Member }) {
  const activity = getActivity(member.id);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16" s={{ paddingY: "24" }}>
      <Column maxWidth="m" gap="24">
        <Row>
          <SmartLink href="/" prefixIcon="chevronLeft">
            Back to team
          </SmartLink>
        </Row>

        <Row gap="20" vertical="center" s={{ direction: "column", vertical: "start" }}>
          <Avatar size="xl" value={getInitials(member.name)} />
          <Column gap="8">
            <Heading as="h1" textVariant="display-strong-xs">
              {member.name}
            </Heading>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              {member.email}
            </Text>
            <Row gap="8" wrap>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Row>
          </Column>
        </Row>

        <Column as="section" aria-labelledby="profile-heading" background="surface" border radius="l" padding="24" gap="20">
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-m">
            Profile
          </Heading>
          <Grid columns="2" s={{ columns: "1" }} gap="20">
            <Field label="Role">
              <Row>
                <RoleBadge role={member.role} />
              </Row>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {ROLE_DESCRIPTIONS[member.role]}
              </Text>
            </Field>
            <Field label="Status">
              <Row>
                <StatusBadge status={member.status} />
              </Row>
            </Field>
            <Field label="Email">
              <Text textVariant="body-default-s">{member.email}</Text>
            </Field>
            <Field label="Joined">
              <Text textVariant="body-default-s">{formatDate(member.joined)}</Text>
            </Field>
          </Grid>
        </Column>

        <Column as="section" aria-labelledby="activity-heading" background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" id="activity-heading" textVariant="heading-strong-m">
            Recent activity
          </Heading>
          {activity.length === 0 ? (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No activity yet.
            </Text>
          ) : (
            <Column as="ul" gap="16" margin="0" padding="0">
              {activity.map((item) => (
                <Row as="li" key={item.id} gap="12" vertical="start">
                  <Row
                    fit
                    padding="8"
                    radius="m"
                    background="neutral-alpha-weak"
                    aria-hidden="true"
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column gap="2" flex={1}>
                    <Text textVariant="body-default-s">{item.text}</Text>
                    <Text textVariant="body-default-xs" onBackground="neutral-weak">
                      {item.when}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Column>
          )}
        </Column>
      </Column>
    </Column>
  );
}
