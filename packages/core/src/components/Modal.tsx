"use client";

import React, { useEffect, useState, useRef, forwardRef } from "react";
import ReactDOM from "react-dom";
import { Column, Heading, IconButton, Row, ScrollLock } from ".";

export interface ModalProps {
  children: React.ReactNode;
  backdrop?: React.ReactNode;
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(({ children, backdrop, title, open, onClose }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
      <Row
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
            <Row position="absolute" right="0" top="0" paddingTop="l" paddingRight="l" zIndex={2}>
              <IconButton icon="close" onClick={onClose} tooltip="Close" tooltipPosition="left" variant="secondary" />
            </Row>
            <Heading as="h2" variant="display-default-xs">
              {title}
            </Heading>
            {children}
          </Column>
        </Column>
      </Row>
    </>,
    document.body,
  );
})

Modal.displayName = "Modal";
export { Modal };
