"use client";

import React from "react";
import { Accordion } from "../../components/Accordion";
import { Column } from "../../components/Column";
import { ElementType } from "../../components/ElementType";
import { Flex } from "../../components/Flex";
import { Icon } from "../../components/Icon";
import { Option } from "../../components/Option";
import { OptionRoleContext } from "../../components/OptionRoleContext";
import { Text } from "../../components/Text";
import type { IconName } from "../../icons";

export interface MenuLink {
  label: React.ReactNode;
  href: string;
  icon?: IconName;
  description?: React.ReactNode;
  selected?: boolean;
}

export interface MenuSection {
  title?: React.ReactNode;
  links: MenuLink[];
}

export interface MenuGroup {
  id: string;
  label: React.ReactNode;
  suffixIcon?: IconName;
  href?: string;
  selected?: boolean;
  sections?: MenuSection[];
}

export interface MobileMegaMenuProps extends React.ComponentProps<typeof Flex> {
  menuGroups: MenuGroup[];
  onClose?: () => void;
}

const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({ menuGroups, onClose, ...flex }) => {
  const handleLinkClick = (href: string) => {
    onClose?.();
  };

  // Its sections are lists of links, not listboxes: the Options inside
  // render as plain links.
  return (
    <OptionRoleContext.Provider value="none">
      <Column fillWidth gap="4" {...flex}>
        {menuGroups.map((group) => {
          if (group.href && !group.sections) {
            return (
              <ElementType
                key={`group-${group.id}`}
                href={group.href}
                onLinkClick={() => group.href && handleLinkClick(group.href)}
              >
                <Flex
                  fillWidth
                  paddingY="12"
                  paddingX="16"
                  horizontal="between"
                  vertical="center"
                  radius="l"
                  cursor="pointer"
                  transition="macro-medium"
                >
                  <Text variant="heading-strong-s" onBackground="neutral-strong">
                    {group.label}
                  </Text>
                  {group.suffixIcon && (
                    <Icon name={group.suffixIcon} size="s" onBackground="neutral-weak" />
                  )}
                </Flex>
              </ElementType>
            );
          }

          return (
            <Accordion
              key={`group-${group.id}`}
              title={group.label}
              icon={group.suffixIcon || "chevronDown"}
              size="m"
              radius="l"
            >
              {group.sections && (
                <Column gap="4" fillWidth>
                  {group.sections.map((section, secIdx) => {
                    const sectionKey = section.title
                      ? `${group.id}-${section.title}`
                      : `sec-${secIdx}`;

                    return section.title ? (
                      <Accordion key={sectionKey} title={section.title} size="s" radius="m">
                        <Column fitHeight fillWidth gap="4">
                          {section.links.map((link, linkIdx) => (
                            <Option
                              key={`link-${linkIdx}`}
                              href={link.href}
                              tabIndex={0}
                              onClick={() => handleLinkClick(link.href)}
                              aria-label={typeof link.label === "string" ? link.label : undefined}
                              label={link.label}
                              description={link.description}
                              value={link.href}
                              prefix={
                                link.icon ? (
                                  <Icon name={link.icon} size="s" onBackground="neutral-weak" />
                                ) : undefined
                              }
                            />
                          ))}
                        </Column>
                      </Accordion>
                    ) : (
                      <Column key={sectionKey} fitHeight fillWidth gap="4" paddingX="8">
                        {section.links.map((link, linkIdx) => (
                          <Option
                            key={`link-${linkIdx}`}
                            href={link.href}
                            tabIndex={0}
                            onClick={() => handleLinkClick(link.href)}
                            aria-label={typeof link.label === "string" ? link.label : undefined}
                            label={link.label}
                            description={link.description}
                            value={link.href}
                            prefix={
                              link.icon ? (
                                <Icon name={link.icon} size="s" onBackground="neutral-weak" />
                              ) : undefined
                            }
                          />
                        ))}
                      </Column>
                    );
                  })}
                </Column>
              )}
            </Accordion>
          );
        })}
      </Column>
    </OptionRoleContext.Provider>
  );
};

MobileMegaMenu.displayName = "MobileMegaMenu";

export { MobileMegaMenu };
