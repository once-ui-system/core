"use client";

import type { KbarItem, MenuGroup } from "@once-ui-system/core";
import {
  Button,
  Column,
  Icon,
  Kbar,
  Line,
  Logo,
  MegaMenu,
  NavIcon,
  Option,
  Row,
  SmartLink,
  Text,
  ToggleButton,
  User,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface HeaderProps extends React.ComponentProps<typeof Row> {
  authenticated?: boolean;
  avatar?: string;
}

export const Header1: React.FC<HeaderProps> = ({ authenticated, avatar, ...flex }) => {
  const pathname = usePathname() ?? "";
  const isMac = typeof window !== "undefined" && /Mac/i.test(navigator.platform);

  const kbar: KbarItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: "home",
      shortcut: [],
      section: "Navigation",
      keywords: "dashboard home",
      href: "#",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: "barChart",
      shortcut: [],
      section: "Navigation",
      keywords: "analytics metrics",
      href: "#",
    },
    {
      id: "security",
      name: "Security",
      icon: "security",
      shortcut: [],
      section: "Navigation",
      keywords: "security privacy",
      href: "#",
    },
    {
      id: "settings",
      name: "Settings",
      icon: "settings",
      shortcut: [],
      section: "Navigation",
      keywords: "settings preferences",
      href: "#",
    },
  ];

  const nav: MenuGroup[] = [
    {
      id: "products",
      label: "Products",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Featured",
          links: [
            {
              label: "Analytics",
              href: "#",
              icon: "barChart",
              description: "Get insights into your data",
            },
            {
              label: "Security",
              href: "#",
              icon: "security",
              description: "Protect your assets",
            },
          ],
        },
        {
          title: "Tools",
          links: [
            {
              label: "Dashboard",
              href: "#",
              icon: "home",
              description: "Monitor your metrics",
            },
            {
              label: "Settings",
              href: "#",
              icon: "settings",
              description: "Configure your preferences",
            },
          ],
        },
      ],
    },
    {
      id: "solutions",
      label: "Solutions",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "By industry",
          links: [
            {
              label: "Enterprise",
              href: "#",
              icon: "organization",
              description: "Solutions for large organizations",
            },
            {
              label: "Startups",
              href: "#",
              icon: "bolt",
              description: "Perfect for growing companies",
            },
          ],
        },
        {
          title: "By team",
          links: [
            {
              label: "Developers",
              href: "#",
              icon: "code",
              description: "Tools and APIs",
            },
            {
              label: "Design teams",
              href: "#",
              icon: "eyeDropper",
              description: "Creative solutions",
            },
          ],
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "Documentation",
          links: [
            {
              label: "Guides",
              href: "#",
              icon: "book",
              description: "Learn how to use our platform",
            },
            {
              label: "API reference",
              href: "#",
              icon: "file",
              description: "Technical documentation",
            },
          ],
        },
        {
          title: "Support",
          links: [
            {
              label: "Help center",
              href: "#",
              icon: "help",
              description: "Get your questions answered",
            },
            {
              label: "Community",
              href: "#",
              icon: "chat",
              description: "Connect with other users",
            },
          ],
        },
      ],
    },
    {
      id: "company",
      label: "Company",
      suffixIcon: "chevronDown",
      sections: [
        {
          title: "About",
          links: [
            {
              label: "Our story",
              href: "#",
              icon: "time",
              description: "Learn about our journey",
            },
            {
              label: "Careers",
              href: "#",
              icon: "person",
              description: "Join our team",
            },
          ],
        },
        {
          title: "Connect",
          links: [
            {
              label: "Blog",
              href: "#",
              icon: "document",
              description: "Latest updates and news",
            },
            {
              label: "Contact",
              href: "#",
              icon: "mail",
              description: "Get in touch with us",
            },
          ],
        },
      ],
    },
  ];

  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <Row
      as="header"
      borderBottom
      fillWidth
      paddingX="m"
      minHeight="56"
      vertical="center"
      background="page"
      position="sticky"
      top="0"
      zIndex={2}
      {...flex}
    >
      <Row gap="4" vertical="center" maxWidth="10rem">
        <NavIcon
          active={isActive}
          onClick={handleClick}
          aria-label="Toggle navigation menu"
          aria-expanded={isActive}
          hide
          s={{ hide: false }}
        />
        <Logo
          wordmark={{
            light: "/trademarks/wordmark-light.svg",
            dark: "/trademarks/wordmark-dark.svg",
          }}
          size="s"
          href="/"
        />
      </Row>
      {authenticated ? (
        <Row fillWidth vertical="center" horizontal="between" gap="16">
          <Row fillWidth horizontal="center">
            <Kbar
              m={{ hide: true }}
              data-border="rounded"
              radius="full"
              background="neutral-alpha-weak"
              items={kbar}
            >
              <Button size="s" variant="tertiary" weight="default">
                <Row
                  vertical="center"
                  gap="16"
                  onBackground="neutral-medium"
                  style={{ marginLeft: "-0.5rem" }}
                  paddingRight="8"
                >
                  <Row
                    background="neutral-alpha-medium"
                    paddingX="8"
                    paddingY="4"
                    radius="full"
                    textVariant="body-default-xs"
                    onBackground="neutral-medium"
                  >
                    {isMac ? "Cmd" : "Ctrl"} + k
                  </Row>
                  Search in app
                </Row>
              </Button>
            </Kbar>
          </Row>
          <Row vertical="center" gap="16" horizontal="end" maxWidth="10rem">
            <SmartLink prefixIcon="book" href="#">
              <Text textVariant="label-default-s">Docs</Text>
            </SmartLink>
            <User
              placement="bottom-end"
              avatarProps={{
                empty: !avatar,
                src: avatar,
              }}
              dropdown={
                <Column padding="4" gap="2" minWidth="10rem">
                  <Option
                    prefix={<Icon onBackground="neutral-weak" size="s" name="person" />}
                    label="Profile"
                    value="profile"
                  />
                  <Option
                    prefix={<Icon onBackground="neutral-weak" size="s" name="settings" />}
                    label="Settings"
                    value="settings"
                  />
                  <Line marginY="2" />
                  <Option
                    prefix={<Icon onBackground="neutral-weak" size="s" name="logout" />}
                    label="Log out"
                    value="logout"
                  />
                </Column>
              }
            />
          </Row>
        </Row>
      ) : (
        <Row fillWidth vertical="center" horizontal="end">
          <Row
            s={{ hide: true }}
            textVariant="label-default-s"
            fillWidth
            gap="16"
            paddingX="l"
            vertical="center"
          >
            <MegaMenu menuGroups={nav} />
          </Row>
          <Row fitWidth vertical="center" gap="8">
            <Button size="s" variant="secondary" label="Log in" href="#" />
            <Button size="s" label="Sign up" href="#" />
          </Row>
        </Row>
      )}
      {isActive && (
        <Column
          top="56"
          left="0"
          position="absolute"
          padding="8"
          fillWidth
          overflowY="auto"
          maxHeight="below-header"
        >
          {authenticated ? (
            <Column padding="8" background="surface" border="surface" radius="l-4" gap="4">
              <ToggleButton
                fillWidth
                size="l"
                horizontal="start"
                selected={true}
                label="Dashboard"
              />
              <ToggleButton
                fillWidth
                size="l"
                horizontal="start"
                selected={pathname === "/apps"}
                label="Apps"
              />
              <ToggleButton
                fillWidth
                size="l"
                horizontal="start"
                selected={pathname === "/resources"}
                label="Resources"
              />
            </Column>
          ) : (
            <MegaMenu
              collapseBelow="always"
              padding="8"
              background="surface"
              border="surface"
              radius="l-4"
              menuGroups={nav}
            />
          )}
        </Column>
      )}
    </Row>
  );
};
