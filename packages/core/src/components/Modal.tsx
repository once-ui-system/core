"use client";

import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Column } from "./Column";
import { FocusTrap } from "./FocusTrap";
import { Heading } from "./Heading";
import { IconButton } from "./IconButton";
import { Row } from "./Row";
import { ScrollLock } from "./ScrollLock";

export interface ModalProps {
  children: React.ReactNode;
  backdrop?: React.ReactNode;
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

/**
 * A full-height sheet that rises from the bottom of the viewport, with a slot
 * for a custom `backdrop` behind it.
 *
 * Prefer `Dialog` for dialogs, confirmations and forms: it adds a
 * description, a footer for actions, stacking over a base dialog, and
 * `closeOnClickaway`. For a panel from an edge, use `Drawer`. Modal is not
 * deprecated, because neither covers its `backdrop` slot yet; 3.0 plans to
 * fold it into `Dialog`.
 */
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ children, backdrop, title, open, onClose }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const openerRef = useRef<HTMLElement | null>(null);
    const titleId = useId();

    useEffect(() => {
      if (open) {
        setMounted(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
          });
        });
      } else {
        setVisible(false);
        const timeout = setTimeout(() => setMounted(false), 300);
        return () => clearTimeout(timeout);
      }
    }, [open]);

    // FocusTrap hands focus back to the opener when `open` turns false. A
    // Modal unmounted while still open never gets that far, so it remembers
    // the opener itself and hands focus back on unmount, as Dialog does.
    useEffect(() => {
      openerRef.current =
        open && document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }, [open]);

    useEffect(() => {
      return () => {
        openerRef.current?.focus();
      };
    }, []);

    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, { capture: true });
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      };
    }, [open, onClose]);

    useEffect(() => {
      if (open && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, [open, children]);

    if (!mounted) return null;

    return ReactDOM.createPortal(
      <>
        <ScrollLock enabled={open} allowScrollInElement={contentRef} />
        {/* The focus machinery DropdownWrapper uses: focus moves to the first
            focusable element on open, Tab and Shift+Tab cycle inside, and
            focus returns to the opener on close. Its wrapper holds only the
            fixed overlay, so it adds no box to the layout. */}
        <FocusTrap active={open}>
          <Row
            ref={ref}
            fill
            horizontal="center"
            paddingX="l"
            paddingTop="xl"
            position="fixed"
            background="overlay"
            zIndex={10}
            style={{
              backdropFilter: "blur(0.5rem)",
              opacity: visible ? 1 : 0,
              transition: "opacity 300ms ease",
              inset: 0,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {backdrop}
            <Column
              ref={dialogRef}
              maxWidth={52}
              fillHeight
              background="page"
              topRadius="xl"
              paddingX="8"
              borderX
              borderTop
              style={{
                transform: visible ? "translateY(0)" : "translateY(4rem)",
                transition: "transform 600ms ease",
              }}
            >
              <Column ref={contentRef} fill overflowY="auto" padding="l" tabIndex={-1}>
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
                <Heading id={titleId} as="h2" variant="display-default-xs">
                  {title}
                </Heading>
                {children}
              </Column>
            </Column>
          </Row>
        </FocusTrap>
      </>,
      document.body,
    );
  },
);

Modal.displayName = "Modal";

export { Modal };
