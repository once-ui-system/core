"use client";

import { type CSSProperties, forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { Heading } from "./Heading";
import { IconButton } from "./IconButton";
import { Row } from "./Row";
import { ScrollLock } from "./ScrollLock";

export interface ModalProps {
  children: ReactNode;
  backdrop?: ReactNode;
  title: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ children, backdrop, title, isOpen, onClose, className, style }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        setMounted(true);
        const timer = setTimeout(() => {
          setVisible(true);
        }, 0);
        return () => clearTimeout(timer);
      }

      setVisible(false);
      const timeout = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timeout);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: globalThis.MouseEvent) => {
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
    }, [isOpen, onClose]);

    useEffect(() => {
      if (isOpen && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
      <>
        <ScrollLock enabled={isOpen} allowScrollInElement={contentRef} />
        <Row
          ref={ref}
          fill
          horizontal="center"
          paddingX="l"
          paddingTop="xl"
          position="fixed"
          background="overlay"
          zIndex={10}
          className={cn(
            "inset-0 backdrop-blur-[0.5rem] transition-all duration-300",
            visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none",
            className,
          )}
          style={style}
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
            className={cn(
              "transition-transform duration-500 ease-out",
              visible ? "translate-y-0" : "translate-y-16",
            )}
          >
            <Column ref={contentRef} fill overflowY="auto" padding="l" tabIndex={-1}>
              <Row position="absolute" right="0" top="0" paddingTop="l" paddingRight="l" zIndex={2}>
                <IconButton
                  icon="close"
                  onClick={onClose}
                  tooltip="Close"
                  tooltipPosition="left"
                  variant="secondary"
                />
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
  },
);

Modal.displayName = "Modal";

export { Modal };
