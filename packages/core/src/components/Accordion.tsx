"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Flex, Icon, Column, Grid, Row } from ".";
import styles from "./Accordion.module.scss";
import classNames from "classnames";

export interface AccordionHandle {
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
  headerProps?: React.ComponentProps<typeof Row>;
  contentProps?: React.ComponentProps<typeof Column>;
  toggleOnHeaderClick?: boolean;
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
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
      headerProps,
      contentProps,
      toggleOnHeaderClick = true,
      ...rest
    },
    ref,
  ) => {
    const headerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
      setIsOpen(open);
    }, [open]);

    const isAccordionOpen = onToggle ? open : isOpen;

    const toggleAccordion = useCallback(() => {
      if (onToggle) {
        onToggle();
      } else {
        setIsOpen((prev) => !prev);
      }
    }, [onToggle]);

    useImperativeHandle(
      ref,
      () => {
        const node = headerRef.current ?? document.createElement("div");
        return Object.assign(node, {
          toggle: toggleAccordion,
          open: () => setIsOpen(true),
          close: () => setIsOpen(false),
        }) as HTMLDivElement & AccordionHandle;
      },
      [toggleAccordion],
    );

    const {
      className: headerClassName,
      style: headerStyle,
      onClick: headerOnClick,
      onKeyDown: headerOnKeyDown,
      ref: headerPropsRef,
      ...headerRest
    } = headerProps ?? {};

    const {
      className: contentClassName,
      ...contentRest
    } = contentProps ?? {};

    const setHeaderRef = useCallback(
      (node: HTMLDivElement | null) => {
        headerRef.current = node;
        if (typeof headerPropsRef === "function") {
          headerPropsRef(node);
        } else if (headerPropsRef && "current" in headerPropsRef) {
          (headerPropsRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && "current" in ref) {
          ref.current = node;
        }
      },
      [headerPropsRef, ref],
    );

    const handleHeaderClick = (e: React.MouseEvent<HTMLDivElement>) => {
      headerOnClick?.(e);
      if (e.defaultPrevented || !toggleOnHeaderClick) return;
      toggleAccordion();
    };

    const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      headerOnKeyDown?.(e);
      if (e.defaultPrevented || !toggleOnHeaderClick) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion();
      }
    };

    const headerPaddingY = size === "s" ? "8" : size === "m" ? "12" : "16";
    const headerPaddingX = size === "s" ? "12" : size === "m" ? "16" : "20";
    const contentPaddingX = size === "s" ? "12" : size === "m" ? "16" : "20";

    return (
      <Column fillWidth>
        <Row
          ref={setHeaderRef}
          tabIndex={headerRest.tabIndex ?? 0}
          className={classNames(styles.accordion, className, headerClassName)}
          style={{ ...style, ...headerStyle }}
          cursor="interactive"
          transition="macro-medium"
          paddingY={headerPaddingY}
          paddingX={headerPaddingX}
          vertical="center"
          horizontal="between"
          onClick={handleHeaderClick}
          onKeyDown={handleHeaderKeyDown}
          aria-expanded={isAccordionOpen}
          aria-controls="accordion-content"
          radius={radius}
          role="button"
          {...headerRest}
        >
          <Row fillWidth textVariant="heading-strong-s">
            {title}
          </Row>
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
              className={contentClassName}
              paddingX={contentPaddingX}
              paddingTop="8"
              paddingBottom="16"
              {...contentRest}
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