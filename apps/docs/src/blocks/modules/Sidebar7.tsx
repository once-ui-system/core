"use client";

import {
  Accordion,
  Background,
  Button,
  Card,
  Column,
  Icon,
  MatrixFx,
  Row,
  Tag,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";

const navigation = [
  {
    href: "#",
    title: "Getting Started",
    navIcon: "bolt",
    children: [
      { href: "#", title: "Introduction" },
      { href: "#", title: "Installation" },
      { href: "#", title: "Quick Start" },
      { href: "#", title: "Configuration" },
    ],
  },
  {
    href: "#",
    title: "Components",
    navIcon: "blocks",
    children: [
      { href: "#", title: "Button" },
      { href: "#", title: "Input" },
      { href: "#", title: "Card" },
      { href: "#", title: "Modal" },
      { href: "#", title: "Dropdown" },
    ],
  },
  {
    href: "#",
    title: "Advanced",
    navIcon: "code",
    children: [
      { href: "#", title: "Theming" },
      { href: "#", title: "Animations", navTag: "Pro" },
      { href: "#", title: "Custom Hooks", navTag: "Pro" },
    ],
  },
];

export function Sidebar7() {
  const pathname = usePathname();

  return (
    <Column fillHeight width={16} minWidth={16} paddingY="4">
      <Column
        position="sticky"
        fillHeight
        gap="2"
        as="nav"
        overflowY="auto"
        padding="12"
        style={{ maxHeight: "calc(100vh - 4rem)", top: "3.875rem" }}
      >
        {navigation.map((item, idx) => {
          if (item.children) {
            return (
              <Row key={idx} fillWidth>
                <Column fillWidth marginTop="2">
                  <Accordion
                    gap="2"
                    icon="chevronRight"
                    iconRotation={90}
                    size="s"
                    radius="s"
                    paddingLeft="4"
                    paddingTop="4"
                    title={
                      <Row
                        fillWidth
                        vertical="center"
                        textVariant="label-strong-s"
                        onBackground="brand-strong"
                      >
                        {item.title}
                      </Row>
                    }
                  >
                    {item.children.map((child, idx) => (
                      <ToggleButton
                        key={idx}
                        fillWidth
                        horizontal="between"
                        selected={pathname === `/${child.href}`}
                        href={child.href}
                      >
                        <Row fillWidth horizontal="between" vertical="center">
                          <Row
                            overflow="hidden"
                            gap="8"
                            onBackground={
                              pathname === child.href ? "neutral-strong" : "neutral-weak"
                            }
                            textVariant={
                              pathname === child.href ? "label-strong-s" : "label-default-s"
                            }
                            style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {child.title}
                          </Row>
                          {child.navTag && (
                            <Tag
                              data-theme="dark"
                              data-brand="brand"
                              style={{
                                marginRight: "-0.25rem",
                                transform: "scale(0.8)",
                                transformOrigin: "right center",
                              }}
                              scheme="brand"
                              size="s"
                            >
                              {child.navTag}
                            </Tag>
                          )}
                        </Row>
                      </ToggleButton>
                    ))}
                  </Accordion>
                </Column>
              </Row>
            );
          }
          return (
            <ToggleButton
              key={idx}
              fillWidth
              horizontal="between"
              selected={pathname === `/${item.href}`}
              href={item.href}
            >
              <Row fillWidth horizontal="between" vertical="center">
                <Text onBackground={pathname === item.href ? "neutral-strong" : "neutral-weak"}>
                  {item.title}
                </Text>
              </Row>
            </ToggleButton>
          );
        })}

        <Column gap="2" marginTop="32" paddingLeft="4">
          <Row
            textVariant="label-strong-s"
            onBackground="brand-strong"
            paddingLeft="8"
            paddingY="12"
          >
            Resources
          </Row>
          <ToggleButton fillWidth horizontal="between" selected={pathname === "/roadmap"} href="#">
            <Row
              gap="8"
              onBackground={pathname === "/roadmap" ? "neutral-strong" : "neutral-weak"}
              textVariant={pathname === "/roadmap" ? "label-strong-s" : "label-default-s"}
            >
              <Icon size="xs" name="pages" />
              Roadmap
            </Row>
          </ToggleButton>
          <ToggleButton
            fillWidth
            horizontal="between"
            selected={pathname === "/changelog"}
            href="#"
          >
            <Row
              gap="8"
              onBackground={pathname === "/changelog" ? "neutral-strong" : "neutral-weak"}
              textVariant={pathname === "/changelog" ? "label-strong-s" : "label-default-s"}
            >
              <Icon size="xs" name="pages" />
              Changelog
            </Row>
          </ToggleButton>
        </Column>

        <Row fill vertical="end" style={{ minHeight: "fit-content" }}>
          <Card
            href="#"
            fillWidth
            border="neutral-alpha-medium"
            background="transparent"
            radius="l"
            overflow="hidden"
          >
            <MatrixFx
              position="absolute"
              flicker
              revealFrom="top"
              size={2}
              spacing={2}
              colors={["brand-solid-strong", "static-transparent"]}
            />
            <Background
              position="absolute"
              fill
              gradient={{
                display: true,
                colorStart: "neutral-background-weak",
                y: 0,
                width: 300,
                height: 300,
              }}
              pointerEvents="none"
            />
            <Column fillWidth padding="20" gap="12">
              <Text variant="heading-strong-s">Get Once UI Pro</Text>
              <Text variant="label-default-s" onBackground="neutral-weak" marginBottom="8">
                Build a digital presence with deployment-ready apps
              </Text>
              <Button rounded size="s" id="get-pro-banner" arrowIcon>
                Get Pro
              </Button>
            </Column>
          </Card>
        </Row>
      </Column>
    </Column>
  );
}
