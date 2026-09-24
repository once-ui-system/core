import {
  Background,
  Column,
  Grid,
  IconButton,
  Logo,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

const trademarks = [
  { light: "/trademarks/brevo-light.svg", dark: "/trademarks/brevo-dark.svg" },
  { light: "/trademarks/microsoft-light.svg", dark: "/trademarks/microsoft-dark.svg" },
  { light: "/trademarks/nasa-light.svg", dark: "/trademarks/nasa-dark.svg" },
  { light: "/trademarks/logmein-light.svg", dark: "/trademarks/logmein-dark.svg" },
];

const social = [
  { icon: "discord" as const, href: "https://discord.com/invite/5EyAQ4eNdS" },
  { icon: "github" as const, href: "https://github.com/once-ui-system" },
  { icon: "threads" as const, href: "#" },
  { icon: "email" as const, href: "mailto:hello@once-ui.com" },
];

const links = [
  { label: "Products", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
  { label: "About", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
];

export const Footer6 = (flex: React.ComponentProps<typeof Column>) => {
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
          horizontal="center"
        >
          <Column gap="8" maxWidth={40} horizontal="center">
            <Text align="center" variant="heading-default-xl">
              Powering creative minds.
            </Text>
            <Text
              align="center"
              variant="body-default-s"
              onBackground="neutral-weak"
              wrap="balance"
            >
              Used by professionals working at leading companies worldwide.
            </Text>
          </Column>
          <Grid columns="4" m={{ columns: 2 }} fillWidth maxWidth={48}>
            {trademarks.map((mark) => (
              <Row key={mark.light} center padding="24">
                <Logo wordmark={mark.dark} dark />
                <Logo wordmark={mark.light} light />
              </Row>
            ))}
          </Grid>
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
        <Row
          maxWidth="xl"
          fillWidth
          borderX="neutral-alpha-medium"
          paddingX="xl"
          paddingY="24"
          horizontal="between"
          vertical="center"
          wrap
          gap="24"
        >
          <Row gap="12" vertical="center">
            <Logo href="#" dark icon="/trademarks/icon-dark.svg" size="m" />
            <Logo href="#" light icon="/trademarks/icon-light.svg" size="m" />
          </Row>
          <Row gap="16" wrap>
            {links.map((link) => (
              <SmartLink key={link.label} href={link.href} unstyled>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {link.label}
                </Text>
              </SmartLink>
            ))}
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
          paddingY="20"
          center
          maxWidth="xl"
          textVariant="label-default-s"
          onBackground="neutral-medium"
          borderX="neutral-alpha-medium"
        >
          © 2026 Once UI. All rights reserved.
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
