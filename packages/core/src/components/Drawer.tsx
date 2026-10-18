"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, type ReactNode, type RefObject, useCallback, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useOverlay } from "../internal/useOverlay.js";
import { Column } from "./Column.js";
import styles from "./Drawer.module.scss";
import { Flex } from "./Flex.js";
import { FocusTrap } from "./FocusTrap.js";
import { Heading } from "./Heading.js";
import { IconButton } from "./IconButton.js";
import { Row } from "./Row.js";
import { ScrollLock } from "./ScrollLock.js";
import { Text } from "./Text.js";
import { VisuallyHidden } from "./VisuallyHidden.js";

// Written out on the props rather than as aliases, so the generated spec, the
// docs' props table and an agent all see the values.
type DrawerSide = NonNullable<DrawerProps["side"]>;
type DrawerSize = NonNullable<DrawerProps["size"]>;

/** How long the panel takes to slide out, matching the `macro-medium` transition. */
const EXIT_MS = 300;

interface DrawerProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  /** Whether the drawer is open. The drawer never closes itself: `onClose` asks. */
  open: boolean;
  /** Called on Escape, a click on the overlay, and the close button. */
  onClose: () => void;
  /** The edge the drawer slides in from. */
  side?: "left" | "right" | "top" | "bottom";
  /**
   * The drawer's extent from its edge: the width of a `left` or `right` drawer,
   * the maximum height of a `top` or `bottom` one (which is otherwise as tall
   * as its content). `full` covers the viewport, less the inset.
   */
  size?: "s" | "m" | "l" | "full";
  /**
   * The heading, and the dialog's accessible name. Without one, pass
   * `aria-label` so a screen reader can announce what opened.
   */
  title?: ReactNode;
  /** A line under the title, announced as the dialog's description. */
  description?: ReactNode;
  /** Actions pinned to the bottom of the drawer, below the scrolling content. */
  footer?: ReactNode;
  /** Show the close button in the corner. */
  showClose?: boolean;
  /** Close when the overlay outside the drawer is clicked. */
  closeOnClickaway?: boolean;
  /**
   * No header and no padding: the children reach the edges, and the close
   * button floats in the corner. The title is still the dialog's name, kept for
   * screen readers only. For a navigation list or media.
   */
  flush?: boolean;
  /** The element to focus on open, instead of the first focusable one. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** The element to focus on close, instead of the one that had focus before it opened. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
}

/**
 * A panel that slides in from an edge of the viewport over an overlay: a
 * mobile navigation, a filter panel, a detail view beside a list.
 *
 * It is a modal dialog on the same overlay core as Dialog: rendered into a
 * portal, the rest of the page made inert, page scroll locked, Tab kept inside
 * by FocusTrap, Escape answered by the innermost overlay only, and focus
 * returned to where it came from on close.
 */
const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      side = "right",
      size = "m",
      title,
      description,
      footer,
      showClose = true,
      closeOnClickaway = true,
      flush = false,
      initialFocusRef,
      returnFocusRef,
      children,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const id = useId();
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const { mounted, visible, entered } = useOverlay({
      open,
      onClose,
      overlayRef,
      returnFocusRef,
      exitMs: EXIT_MS,
    });

    const setPanelRef = useCallback(
      (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    if (!mounted || !visible) return null;

    const titleNode =
      title === undefined ? null : typeof title === "string" ? (
        <Heading id={titleId} textVariant="heading-strong-l">
          {title}
        </Heading>
      ) : (
        <Flex id={titleId}>{title}</Flex>
      );

    const closeButton = showClose && (
      <IconButton icon="close" size="m" variant="tertiary" tooltip="Close" onClick={onClose} />
    );

    const showHeader = !flush && (title !== undefined || description !== undefined || showClose);

    return createPortal(
      <>
        <ScrollLock enabled={open} allowScrollInElement={panelRef} />
        <Flex
          ref={overlayRef}
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={9}
          transition="macro-medium"
          className={classNames(styles.overlay, entered && styles.open)}
        >
          <Flex
            position="absolute"
            top="0"
            left="0"
            fill
            background="overlay"
            aria-hidden="true"
            data-drawer-overlay=""
            // Keep focus in the drawer when the overlay is clicked but stays open.
            onMouseDown={(event) => event.preventDefault()}
            onClick={closeOnClickaway ? onClose : undefined}
          />
          <Column
            aria-labelledby={title !== undefined ? titleId : undefined}
            aria-describedby={description !== undefined ? descriptionId : undefined}
            position="fixed"
            background="neutral-weak"
            border="neutral-medium"
            radius="xl"
            shadow="xl"
            transition="macro-medium"
            overflow="hidden"
            {...rest}
            ref={setPanelRef}
            role="dialog"
            aria-modal="true"
            data-side={side}
            className={classNames(
              styles.panel,
              styles[side],
              styles[size],
              entered && styles.open,
              className,
            )}
            onKeyDown={onKeyDown}
          >
            <FocusTrap
              active={open}
              initialFocusRef={initialFocusRef}
              restoreFocus={false}
              className={styles.trap}
            >
              {showHeader && (
                <Row
                  as="header"
                  fillWidth
                  paddingX="24"
                  paddingTop="20"
                  paddingBottom="12"
                  gap="8"
                  horizontal="between"
                  vertical="start"
                >
                  <Column gap="4" minWidth={0}>
                    {titleNode}
                    {description !== undefined && (
                      <Text
                        id={descriptionId}
                        textVariant="body-default-s"
                        onBackground="neutral-weak"
                      >
                        {description}
                      </Text>
                    )}
                  </Column>
                  {closeButton}
                </Row>
              )}
              {flush && title !== undefined && (
                <VisuallyHidden id={titleId}>{title}</VisuallyHidden>
              )}
              {flush && description !== undefined && (
                <VisuallyHidden id={descriptionId}>{description}</VisuallyHidden>
              )}
              {flush && closeButton && (
                <Flex
                  position="absolute"
                  top="12"
                  right="12"
                  zIndex={1}
                  radius="m"
                  background="overlay"
                >
                  {closeButton}
                </Flex>
              )}
              <Column
                fillWidth
                flex={1}
                overflowY="auto"
                paddingX={flush ? undefined : "24"}
                paddingTop={flush || showHeader ? undefined : "24"}
                paddingBottom={flush ? undefined : "24"}
              >
                {children}
              </Column>
              {footer && (
                <Row
                  as="footer"
                  fillWidth
                  borderTop="neutral-medium"
                  horizontal="end"
                  padding="12"
                  gap="8"
                >
                  {footer}
                </Row>
              )}
            </FocusTrap>
          </Column>
        </Flex>
      </>,
      document.body,
    );
  },
);

Drawer.displayName = "Drawer";

export type { DrawerProps, DrawerSide, DrawerSize };
export { Drawer };
