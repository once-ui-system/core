"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { DisplayProps } from "../interfaces";
import { Background } from "./Background";
import { DropdownTriggerContext, type DropdownTriggerState } from "./DropdownTriggerContext";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import styles from "./StyleOverlay.module.scss";
import { StylePanel } from "./StylePanel";

interface StyleOverlayProps extends React.ComponentProps<typeof Flex> {
  iconButtonProps?: Partial<React.ComponentProps<typeof IconButton>>;
  children: React.ReactNode;
  zIndex?: DisplayProps["zIndex"];
}

// The trigger only shows while the panel is closed. As a trigger, a Button or
// IconButton without onClick renders a real button instead of a div, so the
// panel can be opened from the keyboard; the click bubbles to the wrapper.
const closedTrigger: DropdownTriggerState = {
  expanded: false,
  haspopup: "dialog",
  register: () => () => {},
  setActiveIndex: () => {},
};

const StyleOverlay = forwardRef<HTMLDivElement, StyleOverlayProps>(
  ({ iconButtonProps, children, zIndex = 2, ...rest }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    // Focus follows the panel: into it on open, back to the trigger on close,
    // but only once someone has opened it, never on mount.
    const opened = useRef(false);

    const togglePanel = () => {
      setIsOpen(!isOpen);
    };

    useEffect(() => {
      if (isOpen) {
        opened.current = true;
        panelRef.current
          ?.querySelector<HTMLElement>('button[aria-label="Close style panel"]')
          ?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key !== "Escape" || event.defaultPrevented) return;
          event.preventDefault();
          setIsOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
      }
      if (opened.current) {
        triggerRef.current?.querySelector<HTMLElement>("button, a[href], [tabindex]")?.focus();
      }
    }, [isOpen]);

    return (
      <Flex ref={ref} position="static" zIndex={zIndex}>
        {!isOpen && (
          <DropdownTriggerContext.Provider value={closedTrigger}>
            <Flex ref={triggerRef} onClick={togglePanel}>
              {children}
            </Flex>
          </DropdownTriggerContext.Provider>
        )}
        <Flex
          ref={panelRef}
          role="dialog"
          aria-label="Style panel"
          aria-hidden={!isOpen || undefined}
          zIndex={3}
          className={`${styles.panel} ${isOpen && styles.open}`}
          maxWidth={28}
          style={{
            maxHeight: "calc(100% - var(--static-space-4))",
          }}
          fillHeight
          position="absolute"
          shadow="xl"
          top="2"
          right="2"
          transition="macro-medium"
          background="page"
          overflow="hidden"
          radius="xl"
          border="neutral-medium"
          {...rest}
        >
          <StylePanel fill overflowY="scroll" padding="8" />
          <Flex position="absolute" paddingTop="8" paddingRight="12" top="0" right="0">
            <Background
              position="absolute"
              top="0"
              right="8"
              left={undefined}
              width={8}
              height={4}
              mask={{ x: 100, y: 0, radius: 7 }}
              dots={{ display: true, size: "2", color: "page-background" }}
            />
            <IconButton
              variant="secondary"
              onClick={togglePanel}
              icon="close"
              aria-label="Close style panel"
              {...iconButtonProps}
            />
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

StyleOverlay.displayName = "StyleOverlay";

export { StyleOverlay };
