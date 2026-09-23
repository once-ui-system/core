import {
  Avatar,
  Button,
  Column,
  DropdownWrapper,
  Icon,
  IconButton,
  Kbar,
  Line,
  Logo,
  NavIcon,
  Option,
  Row,
  Text,
  ToggleButton,
  UserMenu,
} from "@once-ui-system/core";

const kbarItems = [
  {
    id: "overview",
    name: "Overview",
    icon: "grid" as const,
    shortcut: [],
    section: "Navigation",
    keywords: "overview home",
    href: "#",
  },
  {
    id: "projects",
    name: "Projects",
    icon: "folder" as const,
    shortcut: [],
    section: "Navigation",
    keywords: "projects",
    href: "#",
  },
  {
    id: "reports",
    name: "Reports",
    icon: "trendUp" as const,
    shortcut: [],
    section: "Navigation",
    keywords: "reports analytics",
    href: "#",
  },
];

const workspaces = [
  { label: "Acme Inc", value: "acme" },
  { label: "Northwind Labs", value: "northwind" },
  { label: "Personal", value: "personal" },
];

export const Header5: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Row
      as="header"
      fillWidth
      borderBottom
      background="page"
      paddingX="16"
      minHeight="56"
      vertical="center"
      horizontal="between"
      gap="16"
      {...flex}
    >
      <Row gap="12" vertical="center">
        <NavIcon hide s={{ hide: false }} />
        <Row hide s={{ hide: false }} gap="4" vertical="center">
          <Logo dark icon="/trademarks/icon-dark.svg" size="s" href="#" />
          <Logo light icon="/trademarks/icon-light.svg" size="s" href="#" />
        </Row>
        <Row s={{ hide: true }} gap="8" vertical="center">
          <Logo dark icon="/trademarks/icon-dark.svg" size="s" href="#" />
          <Logo light icon="/trademarks/icon-light.svg" size="s" href="#" />
          <Line vert height="20" background="neutral-alpha-weak" />
          <DropdownWrapper
            placement="bottom-start"
            trigger={
              <Button size="s" variant="tertiary" weight="default" suffixIcon="chevronDown">
                Acme Inc
              </Button>
            }
            dropdown={
              <Column padding="4" gap="2" minWidth={12}>
                {workspaces.map((workspace) => (
                  <Option
                    key={workspace.value}
                    label={workspace.label}
                    value={workspace.value}
                    prefix={<Icon size="xs" name="grid" onBackground="neutral-weak" />}
                  />
                ))}
                <Line marginY="2" />
                <Option
                  label="Create workspace"
                  value="create"
                  prefix={<Icon size="xs" name="plus" onBackground="neutral-weak" />}
                />
              </Column>
            }
          />
        </Row>
      </Row>

      <Row s={{ hide: true }} gap="4" vertical="center" fillWidth horizontal="center">
        <ToggleButton selected label="Overview" />
        <ToggleButton label="Projects" />
        <ToggleButton label="Reports" />
        <ToggleButton label="Settings" />
      </Row>

      <Row gap="8" vertical="center" horizontal="end">
        <Kbar m={{ hide: true }} items={kbarItems} radius="full" background="neutral-alpha-weak">
          <Button data-border="rounded" size="s" variant="secondary" weight="default">
            <Row vertical="center" gap="12" style={{ marginLeft: "-0.25rem" }} paddingRight="4">
              <Row
                background="neutral-alpha-medium"
                paddingX="8"
                paddingY="2"
                radius="full"
                data-scaling="90"
                textVariant="body-default-xs"
                onBackground="neutral-medium"
              >
                Ctrl K
              </Row>
              Search
            </Row>
          </Button>
        </Kbar>
        <Row>
          <IconButton
            data-border="rounded"
            variant="ghost"
            tooltip="Notifications"
            tooltipPosition="bottom"
            icon="bell"
          />
          <Row position="absolute" style={{ top: "0.15rem", right: "0.15rem" }}>
            <Row
              style={{ borderColor: "var(--page-background)" }}
              height="8"
              width="8"
              solid="brand-strong"
              radius="full"
            />
          </Row>
        </Row>
        <UserMenu
          placement="bottom-end"
          avatarProps={{ src: "/images/creators/lorant.jpg" }}
          dropdown={
            <Column padding="4" gap="2" minWidth={10}>
              <Row padding="8" gap="8" vertical="center">
                <Avatar src="/images/creators/lorant.jpg" size="s" />
                <Column gap="0">
                  <Text variant="label-strong-s">Lorant One</Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    lorant@acme.com
                  </Text>
                </Column>
              </Row>
              <Line marginY="2" />
              <Option
                prefix={<Icon size="xs" onBackground="neutral-weak" name="person" />}
                label="Profile"
                value="profile"
              />
              <Option
                prefix={<Icon size="xs" onBackground="neutral-weak" name="settings" />}
                label="Settings"
                value="settings"
              />
              <Line marginY="2" />
              <Option
                prefix={<Icon size="xs" onBackground="neutral-weak" name="logout" />}
                label="Log out"
                value="logout"
              />
            </Column>
          }
        />
      </Row>
    </Row>
  );
};
