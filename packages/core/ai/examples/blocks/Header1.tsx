"use client";

import {
  Button,
  Column,
  Icon,
  Kbar,
  Line,
  Logo,
  MegaMenu,
  MobileMegaMenu,
  NavIcon,
  Option,
  Row,
  SmartLink,
  Text,
  ToggleButton,
  UserMenu,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface HeaderProps extends React.ComponentProps<typeof Row> {
  authenticated?: boolean;
  avatar?: string;
}

export const Header1: React.FC<HeaderProps> = ({ authenticated, avatar, ...flex }) => {
  const pathname = usePathname() ?? "";
  const isMac = typeof window !== "undefined" && /Mac/i.test(navigator.platform);

  const kbar = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: "refresh",
      shortcut: [],
      section: "Navigation",
      keywords: "dashboard home",
      href: "#",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: "refresh",
      shortcut: [],
      section: "Navigation",
      keywords: "analytics metrics",
      href: "#",
    },
    {
      id: "security",
      name: "Security",
      icon: "refresh",
      shortcut: [],
      section: "Navigation",
      keywords: "security privacy",
      href: "#",
    },
    {
      id: "settings",
      name: "Settings",
      icon: "refresh",
      shortcut: [],
      section: "Navigation",
      keywords: "settings preferences",
      href: "#",
    },
  ];

  const nav = [
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
              icon: "refresh",
              description: "Get insights into your data",
            },
            {
              label: "Security",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Monitor your metrics",
            },
            {
              label: "Settings",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Solutions for large organizations",
            },
            {
              label: "Startups",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Tools and APIs",
            },
            {
              label: "Design teams",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Learn how to use our platform",
            },
            {
              label: "API reference",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Get your questions answered",
            },
            {
              label: "Community",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Learn about our journey",
            },
            {
              label: "Careers",
              href: "#",
              icon: "refresh",
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
              icon: "refresh",
              description: "Latest updates and news",
            },
            {
              label: "Contact",
              href: "#",
              icon: "refresh",
              description: "Get in touch with us",
            },
          ],
        },
      ],
    },
  ]

  const [isActive, setIsActive] = useState(false);
  
  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <Row
      as="header"
      borderBottom="neutral-medium"
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
      <Row gap="4" vertical="center" maxWidth={10}>
        <NavIcon
          isActive={isActive} 
          onClick={handleClick} 
          aria-label="Toggle navigation menu"
          aria-expanded={isActive}
          hide
          s={{hide: false}} />
        <Logo dark wordmark="/trademarks/wordmark-dark.svg" size="s" href="/" />
        <Logo light wordmark="/trademarks/wordmark-light.svg" size="s" href="/" />
      </Row>
      {authenticated ? (
        <Row fillWidth vertical="center" horizontal="between" gap="16">
          <Row fillWidth horizontal="center">
            <Kbar m={{hide: true}} data-border="rounded" radius="full" background="neutral-alpha-weak"
              items={kbar}
            >
              <Button size="s" variant="tertiary" weight="default">
                <Row vertical="center" gap="16" onBackground="neutral-medium" style={{ marginLeft: "-0.5rem" }} paddingRight="8">
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
          <Row vertical="center" gap="16" horizontal="end" maxWidth={10}>
            <SmartLink prefixIcon="book" href="#">
              <Text variant="label-default-s">
                Docs
              </Text>
            </SmartLink>
            <UserMenu
              placement="bottom-end"
              avatarProps={{
                empty: !avatar,
                src: avatar,
              }}
              dropdown={
                <Column padding="4" gap="2" minWidth={10}>
                  <Option hasPrefix={<Icon onBackground="neutral-weak" size="s" name="person" />} label="Profile" value="profile" />
                  <Option hasPrefix={<Icon onBackground="neutral-weak" size="s" name="settings" />} label="Settings" value="settings" />
                  <Line marginY="2" />
                  <Option hasPrefix={<Icon onBackground="neutral-weak" size="s" name="logout" />} label="Log out" value="logout" />
                </Column>
              }
            />
          </Row>
        </Row>
      ) : (
        <Row fillWidth vertical="center" horizontal="end">
          <Row
            s={{hide: true}}
            textVariant="label-default-s"
            fillWidth
            gap="16"
            paddingX="l"
            vertical="center"
          >
            <MegaMenu
              menuGroups={nav}
            />
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
          style={{ maxHeight: "calc(100vh - var(--static-space-56))" }}
        >
          {authenticated ? (
            <Column
              padding="8"
              background="surface"
              border="surface"
              radius="l-4"
              gap="4"
            >
              <ToggleButton fillWidth size="l" horizontal="start" selected={true} label="Dashboard" />
              <ToggleButton fillWidth size="l" horizontal="start" selected={pathname === "/apps"} label="Apps" />
              <ToggleButton fillWidth size="l" horizontal="start" selected={pathname === "/resources"} label="Resources" />
            </Column>
          ) : (
            <MobileMegaMenu
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