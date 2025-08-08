"use client";

import React, { useState, forwardRef, useImperativeHandle, useEffect, useCallback } from "react";
import { Flex, Icon, Text, Column, Grid, Row } from ".";
import styles from "./Accordion.module.scss";
import classNames from "classnames";

export interface AccordionHandle extends HTMLDivElement {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface AccordionProps extends Omit<React.ComponentProps<typeof Flex>, "title"> {
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: string;
  iconRotation?: number;
  size?: "s" | "m" | "l";
  radius?: "xs" | "s" | "m" | "l" | "xl" | "full";
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Accordion = forwardRef<AccordionHandle, AccordionProps>(
  (
    {
      title,
      children,
      open = false,
      onToggle,
      iconRotation = 180,
      radius = "m",
      icon = "chevronDown",
      size = "m",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
      setIsOpen(open);
    }, [open]);

    // Use controlled state when onToggle is provided, otherwise use internal state
    const isAccordionOpen = onToggle ? open : isOpen;

    const toggleAccordion = useCallback(() => {
      if (onToggle) {
        // If onToggle is provided, let the parent control the state
        onToggle();
      } else {
        // Otherwise, manage state internally
        setIsOpen((prev) => !prev);
      }
    }, [onToggle]);

    useImperativeHandle(
      ref,
      () => {
        const methods = {
          toggle: toggleAccordion,
          open: () => setIsOpen(true),
          close: () => setIsOpen(false),
        };

        return Object.assign(document.createElement("div"), methods) as unknown as AccordionHandle;
      },
      [toggleAccordion],
    );

    return (
      <Column fillWidth>
        <Row
          tabIndex={0}
          className={classNames(styles.accordion, className)}
          style={style}
          cursor="interactive"
          transition="macro-medium"
          paddingY={size === "s" ? "8" : size === "m" ? "12" : "16"}
          paddingX={size === "s" ? "12" : size === "m" ? "16" : "20"}
          vertical="center"
          horizontal="between"
          onClick={toggleAccordion}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleAccordion();
            }
          }}
          aria-expanded={isAccordionOpen}
          aria-controls="accordion-content"
          radius={radius}
          role="button"
        >
          <Row fillWidth textVariant="heading-strong-s">{title}</Row>
          <Icon
            name={icon}
            size={size === "s" ? "xs" : "s"}
            onBackground={isAccordionOpen ? "neutral-strong" : "neutral-weak"}
            style={{
              display: "flex",
              transform: isAccordionOpen ? `rotate(${iconRotation}deg)` : "rotate(0deg)",
              transition: "var(--transition-micro-medium)",
            }}
          />
        </Row>
        <Grid
          id="accordion-content"
          fillWidth
          transition="macro-medium"
          style={{
            gridTemplateRows: isAccordionOpen ? "1fr" : "0fr",
          }}
          aria-hidden={!isAccordionOpen}
        >
          <Row fillWidth minHeight={0} overflow="hidden">
            <Column
              fillWidth
              paddingX={size === "s" ? "12" : size === "m" ? "16" : "20"}
              paddingTop="8"
              paddingBottom="16"
              {...rest}
            >
              {children}
            </Column>
          </Row>
        </Grid>
      </Column>
    );
  },
);

Accordion.displayName = "Accordion";
export { Accordion };
