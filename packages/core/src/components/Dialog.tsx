"use client";

import classNames from "clsx";
import type React from "react";
import { type ReactNode, useCallback, useEffect, useId, useRef } from "react";
import ReactDOM from "react-dom";
import { useOverlay } from "../internal/useOverlay.js";
import { tokenLength } from "../utils/layoutClasses.js";
import { Column } from "./Column.js";
import styles from "./Dialog.module.scss";
import { Flex } from "./Flex.js";
import { FocusTrap } from "./FocusTrap.js";
import { Heading } from "./Heading.js";
import { IconButton } from "./IconButton.js";
import { Row } from "./Row.js";
import { ScrollLock } from "./ScrollLock.js";
import { Text } from "./Text.js";

interface DialogProps extends Omit<React.ComponentProps<typeof Flex>, "title"> {
  open: boolean;
  onClose: () => void;
  title: ReactNode | string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * The dialog's geometry. `"center"` (the default) is a card in the middle of
   * the viewport. `"sheet"` is a full-height sheet that rises from the bottom,
   * at most 52rem wide, with a display-style title: what 2.x called `Modal`.
   */
  variant?: "center" | "sheet";
  /**
   * Drawn inside the overlay, behind the panel: an image, a gradient, a
   * `Background`. Position it yourself (it is a child of the overlay).
   */
  backdrop?: ReactNode;
  base?: boolean;
  /** Open on top of another dialog: the dialogs beneath turn inert until this
   *  one closes. Needs no provider (3.0 removed `DialogProvider`). */
  stack?: boolean;
  flush?: boolean;
  /** Show the close button. On by default, as on `Drawer`; turn it off when
   *  only an action in the dialog should dismiss it. */
  showClose?: boolean;
  onHeightChange?: (height: number) => void;
  /** The dialog's minimum height, on the token scale (`320` is 20rem). */
  minHeight?: number;
  closeOnClickaway?: boolean;
}

/**
 * A modal dialog: a confirmation, a form, a detail view.
 *
 * Built on the overlay core it shares with Drawer: rendered into a portal,
 * the rest of the page made inert, page scroll locked, Tab kept inside by
 * FocusTrap, Escape answered by the innermost overlay only, and focus returned
 * to where it came from on close. `variant="sheet"` is the full-height sheet
 * from the bottom (2.x `Modal`), with a `backdrop` slot behind it.
 */
const Dialog = ({
  ref,
  closeOnClickaway = true,
  open,
  onClose,
  title,
  description,
  children,
  variant = "center",
  backdrop,
  stack,
  base,
  footer,
  flush = false,
  showClose = true,
  onHeightChange,
  minHeight,
  ...rest
}: DialogProps) => {
  const sheet = variant === "sheet";
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const dialogTitleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;

  const {
    mounted,
    visible: isVisible,
    entered: isAnimating,
  } = useOverlay({ open, onClose, overlayRef, closeOnEscape: !base });

  const setOverlayRef = useCallback(
    (node: HTMLDivElement | null) => {
      overlayRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    if (dialogRef.current && isVisible) {
      const height = dialogRef.current.offsetHeight;
      onHeightChange?.(height);
    }
  }, [mounted, isVisible, onHeightChange]);

  // A sheet opens scrolled to its top, also when it was reopened with new content.
  useEffect(() => {
    if (sheet && open && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [sheet, open, children]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const isInsideDropdownPortal =
        (event.target as Element)?.closest(".dropdown-portal") !== null;

      if (isInsideDropdownPortal) {
        return;
      }

      if (!dialogRef.current?.contains(event.target as Node)) {
        if (!closeOnClickaway) return;

        if (stack || !base) {
          event.preventDefault();
          onClose();
        }
      }
    };

    if (isVisible) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, {
          capture: true,
        });
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, {
          capture: true,
        });
      };
    }
  }, [isVisible, onClose, stack, base, closeOnClickaway]);

  if (!mounted || !isVisible) return null;

  const descriptionNode = description && (
    <Text id={descriptionId} textVariant="body-default-s" onBackground="neutral-weak">
      {description}
    </Text>
  );

  const footerNode = footer && (
    <Flex borderTop="neutral-medium" as="footer" horizontal="end" padding="12" gap="8">
      {footer}
    </Flex>
  );

  if (sheet) {
    return ReactDOM.createPortal(
      <>
        <ScrollLock enabled={open} allowScrollInElement={contentRef} />
        <Row
          ref={setOverlayRef}
          fill
          horizontal="center"
          paddingX="l"
          paddingTop="xl"
          position="fixed"
          background="overlay"
          zIndex={10}
          className={styles.sheetOverlay}
          style={{
            backdropFilter: "blur(0.5rem)",
            opacity: isAnimating ? 1 : 0,
            transition: "opacity 300ms ease",
            inset: 0,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={description ? descriptionId : undefined}
        >
          {backdrop}
          <Column
            ref={dialogRef}
            maxWidth="52rem"
            fillHeight
            background="page"
            topRadius="xl"
            paddingX="8"
            borderX
            borderTop
            style={{
              transform: isAnimating ? "translateY(0)" : "translateY(4rem)",
              transition: "transform 600ms ease",
              minHeight: minHeight ? tokenLength(minHeight) : undefined,
            }}
            {...rest}
          >
            <FocusTrap active={open} restoreFocus={false} className={styles.trap}>
              <Column
                ref={contentRef}
                fill
                overflowY="auto"
                padding="l"
                className={styles.sheetContent}
                tabIndex={-1}
              >
                {showClose && (
                  <Row
                    position="absolute"
                    right="0"
                    top="0"
                    paddingTop="l"
                    paddingRight="l"
                    zIndex={2}
                  >
                    <IconButton
                      icon="close"
                      onClick={onClose}
                      tooltip="Close"
                      tooltipPosition="left"
                      variant="secondary"
                    />
                  </Row>
                )}
                <Heading id={dialogTitleId} as="h2" textVariant="display-default-xs">
                  {title}
                </Heading>
                {descriptionNode}
                {children}
              </Column>
              {footerNode}
            </FocusTrap>
          </Column>
        </Row>
      </>,
      document.body,
    );
  }

  return ReactDOM.createPortal(
    <>
      <ScrollLock enabled={open} allowScrollInElement={dialogRef} />
      <Flex
        ref={setOverlayRef}
        transition="macro-medium"
        background="overlay"
        position="fixed"
        zIndex={base ? 8 : 9}
        top="0"
        left="0"
        right="0"
        bottom="0"
        className={classNames(styles.overlay, {
          [styles.open]: isAnimating,
        })}
        center
        padding="l"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        {backdrop}
        <Flex
          fill
          center
          transition="macro-medium"
          style={{
            transform: base ? "scale(0.94) translateY(-1.25rem)" : "",
          }}
        >
          <Column
            position={flush ? "relative" : "unset"}
            className={classNames(styles.dialog, {
              [styles.open]: isAnimating,
            })}
            style={{
              minHeight: minHeight ? tokenLength(minHeight) : undefined,
            }}
            ref={dialogRef}
            fillWidth
            transition="macro-medium"
            shadow="xl"
            radius="xl"
            topRadius={flush ? "none" : undefined}
            border="neutral-medium"
            background="neutral-weak"
            {...rest}
          >
            <FocusTrap active={open} restoreFocus={false} className={styles.trap}>
              {!flush && (
                <Column as="header" paddingX="24" paddingTop="24" paddingBottom="s" gap="4">
                  <Flex fillWidth horizontal="between" gap="8">
                    {typeof title === "string" ? (
                      <Heading id={dialogTitleId} textVariant="heading-strong-l">
                        {title}
                      </Heading>
                    ) : (
                      <div id={dialogTitleId}>{title}</div>
                    )}
                    {showClose && (
                      <IconButton
                        icon="close"
                        size="m"
                        variant="tertiary"
                        tooltip="Close"
                        onClick={onClose}
                      />
                    )}
                  </Flex>
                  {descriptionNode}
                </Column>
              )}
              <Column
                as="section"
                paddingX={flush ? undefined : "24"}
                paddingBottom={flush ? undefined : "24"}
                flex={1}
                overflowY="auto"
              >
                {flush && showClose && (
                  <Flex
                    position="absolute"
                    top="16"
                    right="16"
                    zIndex={1}
                    radius="s"
                    background="overlay"
                  >
                    <IconButton
                      icon="close"
                      size="m"
                      variant="tertiary"
                      tooltip="Close"
                      onClick={onClose}
                    />
                  </Flex>
                )}
                {children}
              </Column>
              {footerNode}
            </FocusTrap>
          </Column>
        </Flex>
      </Flex>
    </>,
    document.body,
  );
};

Dialog.displayName = "Dialog";

export type { DialogProps };
export { Dialog };
