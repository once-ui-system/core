"use client";

import classNames from "clsx";
import React, {
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { getFocusableElements, nextInTrap } from "../internal/focusable";
import { Column } from "./Column";
import styles from "./Dialog.module.scss";
import { Flex } from "./Flex";
import { Heading } from "./Heading";
import { IconButton } from "./IconButton";
import { ScrollLock } from "./ScrollLock";
import { Text } from "./Text";

interface DialogProps extends Omit<React.ComponentProps<typeof Flex>, "title"> {
  open: boolean;
  onClose: () => void;
  title: ReactNode | string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  base?: boolean;
  stack?: boolean;
  flush?: boolean;
  /** Show the close button. On by default, as on `Drawer`; turn it off when
   *  only an action in the dialog should dismiss it. */
  showClose?: boolean;
  /**
   * @deprecated Use `showClose={false}`, the name `Drawer` uses. Still works
   * through 2.x; when both are set, `showClose` wins.
   */
  hideClose?: boolean;
  onHeightChange?: (height: number) => void;
  minHeight?: number;
  closeOnClickaway?: boolean;
}

const DialogContext = React.createContext<{
  stackedDialogOpen: boolean;
  setStackedDialogOpen: (open: boolean) => void;
}>({
  stackedDialogOpen: false,
  setStackedDialogOpen: () => {},
});

export const DialogProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [stackedDialogOpen, setStackedDialogOpen] = useState(false);

  return (
    <DialogContext.Provider
      value={{
        stackedDialogOpen,
        setStackedDialogOpen,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      closeOnClickaway = true,
      open,
      onClose,
      title,
      description,
      children,
      stack,
      base,
      footer,
      flush = false,
      hideClose = false,
      showClose = !hideClose,
      onHeightChange,
      minHeight,
      ...rest
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
    const dialogId = useId();
    const dialogTitleId = `${dialogId}-title`;
    const dialogDescriptionId = `${dialogId}-description`;
    const [isVisible, setIsVisible] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);
    const { stackedDialogOpen, setStackedDialogOpen } = useContext(DialogContext);

    useEffect(() => {
      if (stack) {
        setStackedDialogOpen(open);
      }
    }, [stack, open, setStackedDialogOpen]);

    useEffect(() => {
      if (dialogRef.current && isVisible) {
        const height = dialogRef.current.offsetHeight;
        onHeightChange?.(height);
      }
    }, [isVisible, onHeightChange]);

    useEffect(() => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }

      if (open) {
        previouslyFocusedElementRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setIsVisible(true);
        animationTimerRef.current = setTimeout(() => {
          setIsAnimating(true);
          animationTimerRef.current = null;
        }, 0);
      } else {
        setIsAnimating(false);
        animationTimerRef.current = setTimeout(() => {
          setIsVisible(false);
          previouslyFocusedElementRef.current?.focus();
          previouslyFocusedElementRef.current = null;
          animationTimerRef.current = null;
        }, 300);
      }

      return () => {
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
          animationTimerRef.current = null;
        }
      };
    }, [open]);

    // Restore focus on unmount while the dialog was still open
    useEffect(() => {
      return () => {
        previouslyFocusedElementRef.current?.focus();
        previouslyFocusedElementRef.current = null;
      };
    }, []);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === "Escape" && !base && !event.defaultPrevented) {
          onClose();
        }
        // `defaultPrevented`: a FocusTrap inside (a dropdown's panel) has
        // already moved focus for this Tab.
        if (event.key === "Tab" && dialogRef.current && !event.defaultPrevented) {
          // A base dialog under a stacked one leaves Tab to the one on top.
          if (base && !dialogRef.current.contains(document.activeElement)) return;
          const next = nextInTrap(dialogRef.current, document.activeElement, event.shiftKey);
          if (next) {
            event.preventDefault();
            next.focus();
          }
        }
      },
      [onClose, base],
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }
    }, [open, handleKeyDown]);

    useEffect(() => {
      // Find the portal container (direct child of body that contains the dialog)
      const getPortalContainer = (): HTMLElement | null => {
        let portalContainer: HTMLElement | null = dialogRef.current;
        while (portalContainer && portalContainer.parentElement !== document.body) {
          portalContainer = portalContainer.parentElement;
        }
        return portalContainer;
      };

      // Cleanup function to restore inert state
      const cleanup = () => {
        // Restore inert on all body children
        document.body.childNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.inert = false;
          }
        });

        // Also restore inert on any dialogs (for stacked dialog case)
        if (stack) {
          const dialogs = document.querySelectorAll('[role="dialog"]');
          dialogs.forEach((dialog) => {
            if (dialog instanceof HTMLElement) {
              dialog.inert = false;
            }
          });
        }
      };

      if (open) {
        const portalContainer = getPortalContainer();

        // Make everything outside the dialog inert, except the dialog's own portal container
        document.body.childNodes.forEach((node) => {
          if (node instanceof HTMLElement && node !== portalContainer) {
            node.inert = true;
          }
        });

        // If this is a stacked dialog, make the base dialog inert too
        if (stack) {
          const dialogs = document.querySelectorAll('[role="dialog"]');
          dialogs.forEach((dialog) => {
            if (dialog instanceof HTMLElement && !dialog.contains(dialogRef.current)) {
              dialog.inert = true;
            }
          });
        }

        // Return cleanup function for when component unmounts or open changes
        return cleanup;
      } else {
        // If this is a stacked dialog closing, restore interactivity to base dialog
        if (stack) {
          const dialogs = document.querySelectorAll('[role="dialog"]');
          dialogs.forEach((dialog) => {
            if (dialog instanceof HTMLElement) {
              dialog.inert = false;
            }
          });
        } else {
          // If base dialog is closing, restore everything
          document.body.childNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              node.inert = false;
            }
          });
        }
      }
    }, [open, stack]);

    // Focus moves in once the panel exists: on the first `open` render it is
    // not mounted yet (`isVisible` lags a render), which left focus on the
    // page behind. A dialog with nothing focusable takes focus itself.
    useEffect(() => {
      if (open && isVisible && dialogRef.current) {
        if (dialogRef.current.contains(document.activeElement)) return;
        const [firstElement] = getFocusableElements(dialogRef.current);
        (firstElement ?? dialogRef.current).focus();
      }
    }, [open, isVisible]);

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
    }, [isVisible, onClose, stack, base]);

    if (!isVisible) return null;

    return ReactDOM.createPortal(
      <>
        <ScrollLock enabled={open} allowScrollInElement={dialogRef} />
        <Flex
          ref={ref}
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
          aria-labelledby={title && !flush ? dialogTitleId : undefined}
          // Read after the title when the dialog opens.
          aria-describedby={description && !flush ? dialogDescriptionId : undefined}
        >
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
                minHeight: minHeight ? `${minHeight}px` : undefined,
              }}
              ref={dialogRef}
              fillWidth
              transition="macro-medium"
              shadow="xl"
              radius="xl"
              topRadius={flush ? "none" : undefined}
              border="neutral-medium"
              background="neutral-weak"
              tabIndex={-1}
              {...rest}
            >
              {!flush && (
                <Column as="header" paddingX="24" paddingTop="24" paddingBottom="s" gap="4">
                  <Flex fillWidth horizontal="between" gap="8">
                    {typeof title === "string" ? (
                      <Heading id={dialogTitleId} variant="heading-strong-l">
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
                  {description && (
                    <Text
                      id={dialogDescriptionId}
                      variant="body-default-s"
                      onBackground="neutral-weak"
                    >
                      {description}
                    </Text>
                  )}
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
              {footer && (
                <Flex borderTop="neutral-medium" as="footer" horizontal="end" padding="12" gap="8">
                  {footer}
                </Flex>
              )}
            </Column>
          </Flex>
        </Flex>
      </>,
      document.body,
    );
  },
);

Dialog.displayName = "Dialog";

export { Dialog };
