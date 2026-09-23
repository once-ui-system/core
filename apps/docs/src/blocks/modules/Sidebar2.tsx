import {
  Avatar,
  Column,
  DropdownWrapper,
  Icon,
  Line,
  Option,
  Row,
  Text,
  ToggleButton,
  User,
} from "@once-ui-system/core";

export const Sidebar2: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column as="nav" maxWidth={16} fitHeight paddingTop="2" gap="2" s={{ hide: true }} {...flex}>
      <Row paddingBottom="16" paddingTop="8" fillWidth>
        <DropdownWrapper
          fillWidth
          trigger={
            <Row fillWidth padding="8" horizontal="between" vertical="center" cursor="interactive">
              <User
                avatarProps={{
                  empty: false,
                  src: "/images/creators/lorant.jpg",
                }}
              >
                <Column paddingX="12">
                  <Text variant="label-strong-s">Lorant One</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Dopler
                  </Text>
                </Column>
              </User>
              <Icon name="chevronUpDown" onBackground="neutral-weak" />
            </Row>
          }
          dropdown={[
            <>
              <Row padding="4" fillWidth key="once-ui">
                <Option
                  value="once-ui"
                  prefix={<Avatar value="O" />}
                  label={
                    <Row textVariant="body-strong-m" paddingBottom="2">
                      Once UI
                    </Row>
                  }
                  description={
                    <Row onBackground="neutral-weak" vertical="center" gap="4">
                      <Row width="8" height="8" vertical="center">
                        <Row width="4" height="4" radius="full" solid="brand-strong"></Row>
                      </Row>
                      <Text variant="body-default-xs">3 notifications</Text>
                    </Row>
                  }
                />
              </Row>
              <Line />
              <Row padding="4" fillWidth key="dopler">
                <Option
                  value="dopler"
                  prefix={<Avatar value="D" />}
                  label={
                    <Row textVariant="body-strong-m" paddingBottom="2">
                      Dopler
                    </Row>
                  }
                  description={
                    <Row onBackground="neutral-weak" vertical="center" gap="4">
                      <Row width="8" height="8" vertical="center">
                        <Row width="4" height="4" radius="full" solid="brand-strong"></Row>
                      </Row>
                      <Text variant="body-default-xs">1 notification</Text>
                    </Row>
                  }
                />
              </Row>
            </>,
          ]}
        />
      </Row>
      <ToggleButton prefixIcon="cube" label="Projects" horizontal="start" fillWidth selected />
      <ToggleButton prefixIcon="check" label="My tasks" horizontal="start" fillWidth />
      <ToggleButton prefixIcon="bookmark" label="Saved" horizontal="start" fillWidth />
      <ToggleButton prefixIcon="eye" label="Watching" horizontal="start" fillWidth />
      <Text
        variant="label-default-s"
        onBackground="neutral-weak"
        paddingTop="m"
        paddingBottom="12"
        paddingLeft="xs"
      >
        My workspace
      </Text>
      <ToggleButton prefixIcon="squareStack" label="Views" horizontal="start" fillWidth />
      <ToggleButton prefixIcon="calendar" label="Calendar" horizontal="start" fillWidth />
      <ToggleButton prefixIcon="people" label="Members" horizontal="start" fillWidth />
      <ToggleButton prefixIcon="settings" label="Settings" horizontal="start" fillWidth />
    </Column>
  );
};
