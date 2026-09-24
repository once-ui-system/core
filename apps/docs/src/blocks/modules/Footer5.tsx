import {
  Avatar,
  Background,
  Button,
  Column,
  IconButton,
  Input,
  Logo,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

const social = [
  { icon: "discord" as const, href: "https://discord.com/invite/5EyAQ4eNdS" },
  { icon: "github" as const, href: "https://github.com/once-ui-system" },
  { icon: "threads" as const, href: "#" },
  { icon: "email" as const, href: "mailto:hello@once-ui.com" },
];

const navigation = [
  {
    title: "Product",
    items: [
      { label: "Once UI Core", href: "#" },
      { label: "Once UI Blocks", href: "#" },
      { label: "Magic Portfolio", href: "#" },
      { label: "Templates", href: "#" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Use", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "License Agreement", href: "#" },
    ],
  },
];

export const Footer5 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Row fillWidth borderY="neutral-alpha-medium" horizontal="center">
        <Background
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4",
          }}
          borderRight="neutral-alpha-medium"
          width={12}
          minWidth={12}
          m={{ hide: true }}
        />
        <Column
          maxWidth="xl"
          fillWidth
          paddingX="xl"
          paddingY="48"
          gap="24"
          borderX="neutral-alpha-medium"
          background="page"
        >
          <Background
            position="absolute"
            fill
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4",
            }}
          />
          <Column gap="8" maxWidth={32}>
            <Text variant="heading-strong-s">Stay in the loop</Text>
            <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
              Product updates, new blocks, and design system releases — delivered monthly.
            </Text>
          </Column>
          <Row fillWidth gap="8" s={{ direction: "column" }} maxWidth={32}>
            <Input id="footer5-email" label="Email" placeholder="you@company.com" />
            <Button data-border="rounded" arrowIcon>
              Subscribe
            </Button>
          </Row>
        </Column>
        <Background
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4",
          }}
          borderLeft="neutral-alpha-medium"
          width={12}
          minWidth={12}
          m={{ hide: true }}
        />
      </Row>

      <Row fillWidth horizontal="center" borderBottom="neutral-alpha-medium">
        <Row flex={1} m={{ hide: true }} borderRight="neutral-alpha-medium" />
        <Column
          maxWidth="xl"
          fillWidth
          borderX="neutral-alpha-medium"
          paddingX="xl"
          paddingTop="40"
          paddingBottom="32"
          gap="32"
        >
          <Row fillWidth horizontal="between" vertical="center" wrap gap="24">
            <Row gap="12" vertical="center">
              <Logo href="#" dark icon="/trademarks/icon-dark.svg" size="m" />
              <Logo href="#" light icon="/trademarks/icon-light.svg" size="m" />
            </Row>
            <Row gap="8">
              {social.map((item) => (
                <IconButton
                  key={item.icon}
                  data-border="rounded"
                  icon={item.icon}
                  variant="secondary"
                  size="l"
                  href={item.href}
                />
              ))}
            </Row>
          </Row>

          <Row fillWidth wrap gap="32" horizontal="between">
            {navigation.map((section) => (
              <Column key={section.title} gap="12" minWidth={12}>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {section.title}
                </Text>
                {section.items.map((item) => (
                  <SmartLink key={item.label} href={item.href} unstyled>
                    <Text variant="body-default-s">{item.label}</Text>
                  </SmartLink>
                ))}
              </Column>
            ))}
          </Row>
        </Column>
        <Row flex={1} m={{ hide: true }} borderLeft="neutral-alpha-medium" />
      </Row>

      <Row fillWidth borderBottom="neutral-alpha-medium" horizontal="center">
        <Row flex={1} m={{ hide: true }}>
          <Background
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4",
            }}
            borderRight="neutral-alpha-medium"
            width={12}
            minWidth={12}
          />
        </Row>
        <Row
          gap="8"
          paddingY="24"
          center
          maxWidth="xl"
          textVariant="label-default-s"
          onBackground="neutral-medium"
          borderX="neutral-alpha-medium"
        >
          Built with curiosity by{" "}
          <SmartLink href="#" unstyled>
            <Avatar size="xs" src="/images/creators/lorant.jpg" />
            Lorant One
          </SmartLink>
        </Row>
        <Row flex={1} m={{ hide: true }}>
          <Background
            lines={{
              display: true,
              color: "neutral-alpha-weak",
              angle: -45,
              size: "4",
            }}
            borderLeft="neutral-alpha-medium"
            width={12}
            minWidth={12}
          />
        </Row>
      </Row>
    </Column>
  );
};
