"use client";

import { Background, type DisplayProps, Flex, IconButton } from "@once-ui-system/core";
import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import styles from "./StyleOverlay.module.scss";
import { StylePanel } from "./StylePanel.js";

interface StyleOverlayProps extends React.ComponentProps<typeof Flex> {
  iconButtonProps?: Partial<React.ComponentProps<typeof IconButton>>;
  children: React.ReactNode;
  zIndex?: DisplayProps["zIndex"];
}

const StyleOverlay = ({
  ref,
  iconButtonProps,
  children,
  zIndex = 2,
  ...rest
}: StyleOverlayProps) => {
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

  // The trigger only shows while the panel is closed. A Button or IconButton
  // without an onClick renders as a div, which no keyboard can reach, so it
  // is given the toggle as its own onClick and renders as a real button.
  const ownsClick =
    isValidElement<{ onClick?: unknown }>(children) && children.props.onClick === undefined;
  const trigger = ownsClick
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        onClick: togglePanel,
        "aria-haspopup": "dialog",
        "aria-expanded": false,
      })
    : children;

  return (
    <Flex ref={ref} position="static" zIndex={zIndex}>
      {!isOpen && (
        <Flex ref={triggerRef} onClick={ownsClick ? undefined : togglePanel}>
          {trigger}
        </Flex>
      )}
      <Flex
        ref={panelRef}
        role="dialog"
        aria-label="Style panel"
        aria-hidden={!isOpen || undefined}
        zIndex={3}
        className={`${styles.panel} ${isOpen && styles.open}`}
        maxWidth="28rem"
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
            width="8rem"
            height="4rem"
            mask={{ x: "100%", y: 0, radius: "7vh" }}
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
};

StyleOverlay.displayName = "StyleOverlay";

export { StyleOverlay };
