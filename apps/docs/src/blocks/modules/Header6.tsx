"use client";

import {
  Badge,
  Button,
  IconButton,
  Line,
  Logo,
  NavIcon,
  Pulse,
  Row,
  SmartLink,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Products", href: "#" },
  { label: "Blocks", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Pricing", href: "#" },
];

const social = [
  { icon: "github" as const, href: "#" },
  { icon: "discord" as const, href: "#" },
];

export const Header6: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const pathname = usePathname() ?? "";

  return (
    <Row as="header" fillWidth direction="column" borderBottom background="page" {...flex}>
      <Row
        fillWidth
        paddingX="16"
        paddingY="8"
        gap="12"
        vertical="center"
        horizontal="center"
        borderBottom
        background="brand-alpha-weak"
      >
        <Pulse size="s" scheme="brand" />
        <Text variant="label-default-s" onBackground="brand-medium">
          Pro blocks now install via CLI
        </Text>
        <SmartLink href="#">
          <Badge title="Learn more" arrow={false} effect={false} />
        </SmartLink>
      </Row>

      <Row fillWidth paddingX="16" minHeight="56" vertical="center" horizontal="between" gap="16">
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
            <Text variant="label-strong-s" wrap="nowrap">
              Once UI
            </Text>
          </Row>
        </Row>

        <Row s={{ hide: true }} gap="4" vertical="center" fillWidth horizontal="center">
          {nav.map((item) => (
            <ToggleButton
              key={item.label}
              href={item.href}
              label={item.label}
              selected={pathname === item.href}
            />
          ))}
        </Row>

        <Row gap="8" vertical="center" horizontal="end">
          <Row gap="4" m={{ hide: true }}>
            {social.map((item) => (
              <IconButton
                key={item.icon}
                data-border="rounded"
                href={item.href}
                icon={item.icon}
                size="s"
                variant="ghost"
              />
            ))}
          </Row>
          <Button data-border="rounded" size="s" href="#">
            Get Pro
          </Button>
        </Row>
      </Row>
    </Row>
  );
};
