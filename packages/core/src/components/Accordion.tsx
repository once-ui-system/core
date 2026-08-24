"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent, MutableRefObject, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../classes/utils";
import type { CondensedTShirtSizes, RadiusSize } from "../types";
import { Column } from "./Column";
import type { Flex } from "./Flex";
import { Grid } from "./Grid";
import { Icon } from "./Icon";
import { Row } from "./Row";

export interface AccordionHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export interface AccordionProps extends Omit<React.ComponentProps<typeof Flex>, "title"> {
  title: ReactNode;
  children: ReactNode;
  icon?: string;
  iconRotation?: number;
  size?: CondensedTShirtSizes;
  radius?: RadiusSize;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  style?: CSSProperties;
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

    useImperativeHandle(ref, () => {
      const node = headerRef.current ?? document.createElement("div");
      return Object.assign(node, {
        toggle: toggleAccordion,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }) as HTMLDivElement & AccordionHandle;
    }, [toggleAccordion]);

    const {
      className: headerClassName,
      style: headerStyle,
      onClick: headerOnClick,
      onKeyDown: headerOnKeyDown,
      ref: headerPropsRef,
      ...headerRest
    } = headerProps ?? {};

    const { className: contentClassName, ...contentRest } = contentProps ?? {};

    const setHeaderRef = useCallback(
      (node: HTMLDivElement | null) => {
        headerRef.current = node;
        if (typeof headerPropsRef === "function") {
          headerPropsRef(node);
        } else if (headerPropsRef && "current" in headerPropsRef) {
          (headerPropsRef as MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [headerPropsRef],
    );

    const handleHeaderClick = (e: MouseEvent<HTMLDivElement>) => {
      headerOnClick?.(e);
      if (e.defaultPrevented || !toggleOnHeaderClick) return;
      toggleAccordion();
    };

    const handleHeaderKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
          className={cn("cursor-pointer hover:bg-neutral-alpha-weak", className, headerClassName)}
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
