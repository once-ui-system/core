"use client";

import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react-dom";
import classNames from "clsx";
import React, {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { DropdownPanel } from "../internal/DropdownPanel.js";
import {
  isEnabledItem,
  MENU_ITEM_SELECTOR,
  MenuLevelContext,
  MenuRootContext,
  useMenuLevel,
  useTypeahead,
} from "../internal/menuTree.js";
import type { CSSUnit } from "../types.js";
import { cssLength, withTokenLengths } from "../utils/layoutClasses.js";
import { Column } from "./Column.js";
import dropdownStyles from "./Dropdown.module.scss";
import { Icon } from "./Icon.js";
import optionStyles from "./Option.module.scss";
import { OptionRoleContext } from "./OptionRoleContext.js";
import { Row } from "./Row.js";
import { ScrollLock } from "./ScrollLock.js";
import styles from "./Submenu.module.scss";
import { Text } from "./Text.js";

export interface SubmenuProps {
  /** The item's label in the menu it sits in. Also names the submenu. */
  label: ReactNode;
  /** Before the label: an icon, an avatar. */
  prefix?: ReactNode;
  /** A second line under the label. */
  description?: ReactNode;
  /** After the label. Defaults to a chevron pointing the way the submenu opens. */
  suffix?: ReactNode;
  disabled?: boolean;
  /** The submenu's items: Options, more Submenus, Lines between groups. */
  children?: ReactNode;
  /** The submenu panel's minimum width: a number is on the token scale, a string a CSS length. */
  minWidth?: number | CSSUnit;
  /** As `minWidth`; unset, the panel is capped at the space available. */
  maxWidth?: number | CSSUnit;
  /**
   * How long, in ms, the pointer rests on the item before the submenu opens.
   * Defaults to 100: long enough that sweeping past does not open it.
   */
  openDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

const isRtl = (el: Element | null) => el?.closest("[dir]")?.getAttribute("dir") === "rtl";

/**
 * An item that opens a nested menu: put it among the Options of a Dropdown
 * or a context menu (`openOn="contextmenu"`), with its own Options inside.
 *
 * It opens when the pointer rests on it, on a click or tap, and with Right
 * arrow, Enter or Space; Left arrow or Escape closes it and returns focus to
 * the item. The pointer can travel diagonally into the open submenu across
 * other items without closing it. Picking an Option anywhere in the tree
 * reaches the Dropdown's `onSelect`, and closes the whole menu as any pick does.
 *
 * With a Submenu inside, the Dropdown's panel is a `menu` of `menuitem`s,
 * and the item says it has a popup that is expanded or not.
 */
const Submenu = ({
  label,
  prefix,
  description,
  suffix,
  disabled = false,
  children,
  minWidth = 192,
  maxWidth,
  openDelay,
  className,
  style,
}: SubmenuProps) => {
  const root = useContext(MenuRootContext);
  const parent = useContext(MenuLevelContext);
  const role = useContext(OptionRoleContext);
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-menu`;

  const [localOpen, setLocalOpen] = useState(false);
  const open = !disabled && (parent ? parent.openId === id : localOpen);
  const setOpen = useCallback(
    (next: boolean) => {
      if (parent) parent.setOpenId(next ? id : null);
      else setLocalOpen(next);
    },
    [parent, id],
  );

  // The menu around reads as a `menu` once it holds a Submenu.
  const registerSubmenu = root?.registerSubmenu;
  useEffect(() => registerSubmenu?.(), [registerSubmenu]);

  const { level, onPointerMove } = useMenuLevel({ openDelay: openDelay ?? parent?.openDelay });
  const closeChild = level.setOpenId;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Which item to focus once the panel can take focus: set by the keys that open it. */
  const focusOnOpen = useRef<"first" | "last" | null>(null);
  /** Whether focus is in this panel, so closing it can hand focus back. */
  const focusInside = useRef(false);
  const typeahead = useTypeahead();

  const [rtl, setRtl] = useState(false);
  useLayoutEffect(() => {
    setRtl(isRtl(triggerRef.current));
  }, []);

  const { x, y, strategy, refs, isPositioned } = useFloating({
    placement: rtl ? "left-start" : "right-start",
    strategy: "fixed",
    open,
    middleware: [
      // Over the parent panel's border and padding, so the first item lines
      // up with the one that opened it.
      offset({ mainAxis: 4, crossAxis: -5 }),
      flip({ fallbackAxisSideDirection: "start" }),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(availableHeight, 120)}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const setPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      refs.setFloating(node);
    },
    [refs],
  );
  const setTrigger = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      refs.setReference(node);
    },
    [refs],
  );

  const items = useCallback(
    () =>
      panelRef.current
        ? (Array.from(panelRef.current.querySelectorAll(MENU_ITEM_SELECTOR)).filter(
            (el, i, all) =>
              // An Option is both `[role]` and `[data-value]`; count it once,
              // as its outermost element.
              !all.some((other, j) => j !== i && other !== el && other.contains(el)),
          ) as HTMLElement[])
        : [],
    [],
  );

  const focusItem = useCallback((item: HTMLElement | undefined) => {
    if (!item) return;
    item.focus({ preventScroll: true });
    item.scrollIntoView?.({ block: "nearest" });
  }, []);

  // Keys that opened the panel put focus in it, once it is visible.
  useEffect(() => {
    if (!open || !isPositioned || !focusOnOpen.current) return;
    const which = focusOnOpen.current;
    focusOnOpen.current = null;
    const enabled = items().filter(isEnabledItem);
    focusItem(which === "last" ? enabled[enabled.length - 1] : enabled[0]);
  }, [open, isPositioned, items, focusItem]);

  // Closing: a nested submenu closes too, and focus that was in the panel
  // comes back to this item instead of falling to the page.
  useEffect(() => {
    if (open) return;
    closeChild(null);
    if (focusInside.current) {
      focusInside.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open, closeChild]);

  const openWithFocus = (which: "first" | "last") => {
    focusOnOpen.current = which;
    if (open && isPositioned) {
      const enabled = items().filter(isEnabledItem);
      focusOnOpen.current = null;
      focusItem(which === "last" ? enabled[enabled.length - 1] : enabled[0]);
      return;
    }
    setOpen(true);
  };

  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  const back = rtl ? "ArrowRight" : "ArrowLeft";

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === forward || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // The list around would otherwise pick or move on this key as well.
      e.stopPropagation();
      openWithFocus("first");
    }
  };

  const handlePanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // A key in a deeper submenu's panel has been handled there.
    if (!e.currentTarget.contains(e.target as Node)) return;
    const all = items().filter(isEnabledItem);
    const current = all.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End": {
        e.preventDefault();
        e.stopPropagation();
        if (all.length === 0) return;
        const last = all.length - 1;
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : e.key === "ArrowDown"
                ? current < last
                  ? current + 1
                  : 0
                : current > 0
                  ? current - 1
                  : last;
        focusItem(all[next]);
        return;
      }
      case "Escape":
      case back: {
        e.preventDefault();
        // Closes this level only, not the menu it came from.
        e.stopPropagation();
        focusInside.current = true;
        setOpen(false);
        return;
      }
      case forward:
        // Right arrow on a plain item does nothing, here or in the parent.
        e.preventDefault();
        e.stopPropagation();
        return;
      case "Tab":
        // Tab leaves the submenu: from its item, the menu around decides
        // where focus goes next.
        focusInside.current = false;
        triggerRef.current?.focus({ preventScroll: true });
        setOpen(false);
        return;
      default: {
        const match = typeahead(e, all);
        if (match) {
          e.preventDefault();
          e.stopPropagation();
          focusItem(match);
        } else if (e.key.length === 1 && e.key !== " ") {
          // An unmatched letter is not the parent list's either.
          e.stopPropagation();
        }
      }
    }
  };

  const chevron = suffix ?? (
    <Icon name={rtl ? "chevronLeft" : "chevronRight"} size="xs" onBackground="neutral-weak" />
  );

  return (
    <>
      <button
        ref={setTrigger}
        id={triggerId}
        type="button"
        className={classNames("reset-button-styles fill-width", styles.trigger)}
        role={role === "none" ? undefined : "menuitem"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-disabled={disabled || undefined}
        data-submenu-trigger={id}
        data-open={open || undefined}
        onClick={(e) => {
          // Not a pick: the Dropdown and context menu close on clicks that
          // reach them.
          e.stopPropagation();
          if (disabled) return;
          // A click from the keyboard (Enter on a link-like setup) or a
          // tap: open and move in. A mouse click only opens.
          if (e.detail === 0) openWithFocus("first");
          else setOpen(true);
        }}
        onKeyDown={handleTriggerKeyDown}
        onPointerLeave={(e) => {
          if (!open || e.pointerType === "touch" || !panelRef.current || !parent) return;
          parent.setGrace({ x: e.clientX, y: e.clientY }, panelRef.current.getBoundingClientRect());
        }}
      >
        <Row
          fillWidth
          vertical="center"
          paddingX="12"
          paddingY="8"
          gap="12"
          tabIndex={-1}
          borderWidth={1}
          borderStyle="solid"
          cursor={disabled ? "not-allowed" : "interactive"}
          transition="micro-medium"
          onBackground="neutral-strong"
          className={classNames(optionStyles.option, styles.row, {
            [optionStyles.disabled]: disabled,
          })}
          style={style}
        >
          {prefix && <Row>{prefix}</Row>}
          <Column fillWidth align="left">
            <Text onBackground="neutral-strong" textVariant="label-default-s" truncate>
              {label}
            </Text>
            {description && (
              <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
                {description}
              </Text>
            )}
          </Column>
          {chevron && <Row>{chevron}</Row>}
        </Row>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <MenuLevelContext.Provider value={level}>
            <OptionRoleContext.Provider value={role === "none" ? "none" : "menuitem"}>
              <ScrollLock enabled={!!root?.scrollLocked} allowScrollInElement={panelRef} />
              <div
                ref={setPanel}
                id={panelId}
                role="menu"
                aria-labelledby={triggerId}
                data-submenu-panel=""
                data-is-dropdown="true"
                data-menu-tree={root?.treeId}
                className={classNames(dropdownStyles.fadeIn, className)}
                style={withTokenLengths({
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                  zIndex: 10,
                  display: "flex",
                  minWidth: cssLength(minWidth),
                  maxWidth: maxWidth ? cssLength(maxWidth) : undefined,
                  // Hidden, not unmounted, until measured: see Dropdown.
                  visibility: isPositioned ? "visible" : "hidden",
                  transformOrigin: rtl ? "right top" : "left top",
                })}
                onPointerMove={onPointerMove}
                onPointerEnter={() => parent?.settle()}
                onKeyDown={handlePanelKeyDown}
                onFocusCapture={() => {
                  focusInside.current = true;
                }}
                onBlurCapture={(e) => {
                  const next = e.relatedTarget as Node | null;
                  if (!next || !e.currentTarget.contains(next)) focusInside.current = false;
                }}
              >
                <DropdownPanel fillWidth radius="l" padding="0" role="none">
                  <Column padding="4" gap="2">
                    {children}
                  </Column>
                </DropdownPanel>
              </div>
            </OptionRoleContext.Provider>
          </MenuLevelContext.Provider>,
          document.body,
        )}
    </>
  );
};

Submenu.displayName = "Submenu";

export { Submenu };
