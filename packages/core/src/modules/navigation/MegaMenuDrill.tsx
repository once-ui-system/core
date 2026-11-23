"use client";

import classNames from "clsx";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Column } from "../../components/Column.js";
import { ElementType } from "../../components/ElementType.js";
import { Flex } from "../../components/Flex.js";
import { Icon } from "../../components/Icon.js";
import { OptionRoleContext } from "../../components/OptionRoleContext.js";
import { Text } from "../../components/Text.js";
import type { MenuGroup, MenuLink } from "./MegaMenu.js";
import styles from "./MegaMenuDrill.module.scss";

export interface MegaMenuDrillProps extends React.ComponentProps<typeof Flex> {
  menuGroups: MenuGroup[];
  onClose?: () => void;
}

const ROW = "reset-button-styles fill-width focus-ring radius-l";

/**
 * The drill-in form of `MegaMenu` (`collapseAs="drill"`): the groups are one
 * list, and tapping a group replaces the list with that group's links under a
 * back row, so the phone never shows a menu inside a menu.
 */
export const MegaMenuDrill = ({ menuGroups, onClose, ...flex }: MegaMenuDrillProps) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [direction, setDirection] = useState<"none" | "in" | "back">("none");
  const backRef = useRef<HTMLElement>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const cameFrom = useRef<string | null>(null);

  const open = menuGroups.find((group) => group.id === openId);

  // Keyboard and screen reader users land where the eye goes: on the back row
  // going in, on the group they opened coming back.
  useEffect(() => {
    if (direction === "none") return;
    if (openId) backRef.current?.focus({ preventScroll: true });
    else if (cameFrom.current) rows.current.get(cameFrom.current)?.focus({ preventScroll: true });
  }, [openId, direction]);

  const enter = (id: string) => {
    cameFrom.current = id;
    setDirection("in");
    setOpenId(id);
  };
  const back = () => {
    setDirection("back");
    setOpenId(null);
  };

  // A phone row, sized for a thumb: the label at reading size, its
  // description under it, the icon in line with the label.
  const link = (item: MenuLink, key: string) => (
    <ElementType
      key={key}
      href={item.href}
      onLinkClick={() => onClose?.()}
      className={classNames(ROW, styles.row)}
      aria-current={item.selected ? "page" : undefined}
    >
      <Flex fillWidth paddingY="12" paddingX="16" gap="12" vertical="start">
        {item.icon && (
          <Flex paddingTop="2">
            <Icon name={item.icon} size="s" onBackground="neutral-weak" />
          </Flex>
        )}
        <Column gap="2">
          <Text textVariant="label-default-l" onBackground="neutral-strong">
            {item.label}
          </Text>
          {item.description && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {item.description}
            </Text>
          )}
        </Column>
      </Flex>
    </ElementType>
  );

  return (
    <OptionRoleContext.Provider value="none">
      <Column
        key={open ? `group-${open.id}` : "root"}
        fillWidth
        gap="4"
        className={styles.view}
        data-direction={direction}
        {...flex}
      >
        {open ? (
          <>
            <ElementType
              ref={backRef}
              type="button"
              onClick={back}
              className={classNames(ROW, styles.row)}
              aria-label={typeof open.label === "string" ? `Back from ${open.label}` : "Back"}
            >
              <Flex fillWidth paddingY="12" paddingX="16" gap="8" vertical="center">
                <Icon name="chevronLeft" size="s" onBackground="neutral-weak" />
                <Text textVariant="heading-strong-s" onBackground="neutral-strong">
                  {open.label}
                </Text>
              </Flex>
            </ElementType>
            {open.sections?.map((section, index) => (
              <Column
                // biome-ignore lint/suspicious/noArrayIndexKey: sections have no id and never reorder
                key={`section-${index}`}
                fillWidth
                gap="2"
                paddingTop={section.title ? "12" : undefined}
              >
                {section.title && (
                  <Flex paddingX="16" paddingBottom="4">
                    <Text as="h3" textVariant="label-default-s" onBackground="neutral-weak">
                      {section.title}
                    </Text>
                  </Flex>
                )}
                {section.links.map((item, linkIndex) => link(item, `link-${index}-${linkIndex}`))}
              </Column>
            ))}
            {!open.sections && open.content}
            {open.href && (
              <Column fillWidth paddingTop="12">
                {link({ label: open.label, href: open.href, icon: open.suffixIcon }, "group-link")}
              </Column>
            )}
          </>
        ) : (
          menuGroups.map((group) => {
            const label = (
              <Text textVariant="heading-strong-s" onBackground="neutral-strong">
                {group.label}
              </Text>
            );
            if (!group.sections && !group.content) {
              return (
                <ElementType
                  key={`group-${group.id}`}
                  href={group.href}
                  onLinkClick={() => onClose?.()}
                  className={classNames(ROW, styles.row)}
                >
                  <Flex
                    fillWidth
                    paddingY="12"
                    paddingX="16"
                    horizontal="between"
                    vertical="center"
                  >
                    {label}
                    {group.suffixIcon && (
                      <Icon name={group.suffixIcon} size="s" onBackground="neutral-weak" />
                    )}
                  </Flex>
                </ElementType>
              );
            }
            return (
              <ElementType
                key={`group-${group.id}`}
                ref={(node: HTMLElement | null) => {
                  if (node) rows.current.set(group.id, node);
                  else rows.current.delete(group.id);
                }}
                type="button"
                onClick={() => enter(group.id)}
                className={classNames(ROW, styles.row)}
                aria-haspopup="true"
              >
                <Flex fillWidth paddingY="12" paddingX="16" horizontal="between" vertical="center">
                  {label}
                  <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                </Flex>
              </ElementType>
            );
          })
        )}
      </Column>
    </OptionRoleContext.Provider>
  );
};

MegaMenuDrill.displayName = "MegaMenuDrill";
