"use client";

import classNames from "clsx";
import React, { forwardRef, useCallback, useId, useImperativeHandle, useRef } from "react";
import type { IconName } from "../icons.js";
import { useControllableState } from "../internal/useControllableState.js";
import { TShirtSizes } from "../types.js";
import styles from "./Accordion.module.scss";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Grid } from "./Grid.js";
import { Icon } from "./Icon.js";
import { Row } from "./Row.js";

export interface AccordionHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface AccordionProps extends Omit<React.ComponentProps<typeof Flex>, "title"> {
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: IconName;
  iconRotation?: number;
  size?: TShirtSizes;
  radius?: "xs" | "s" | "m" | "l" | "xl" | "full";
  /** Open or not, controlled. Leave it out to let the accordion keep its own
   *  state, starting from `defaultOpen`. */
  open?: boolean;
  /** The starting state of an uncontrolled accordion (no `open`). */
  defaultOpen?: boolean;
  /** Called with the state the accordion moves to: `true` when it opens. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  headerProps?: React.ComponentProps<typeof Row>;
  contentProps?: React.ComponentProps<typeof Column>;
  toggleOnHeaderClick?: boolean;
}

// Paddings per size; s, m and l are 2.x's.
const HEADER_PADDING_Y = { xs: "4", s: "8", m: "12", l: "16", xl: "20" } as const;
const PADDING_X = { xs: "8", s: "12", m: "16", l: "20", xl: "24" } as const;

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      title,
      children,
      open,
      defaultOpen = false,
      onOpenChange,
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
    const contentId = useId();
    // Controlled when `open` is set, whether or not a handler is passed.
    const [isAccordionOpen, setOpen] = useControllableState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });

    const toggleAccordion = useCallback(() => setOpen((prev) => !prev), [setOpen]);

    useImperativeHandle(ref, () => {
      const node = headerRef.current ?? document.createElement("div");
      return Object.assign(node, {
        toggle: toggleAccordion,
        open: () => setOpen(true),
        close: () => setOpen(false),
      }) as HTMLDivElement & AccordionHandle;
    }, [toggleAccordion, setOpen]);

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

    const headerPaddingY = HEADER_PADDING_Y[size];
    const headerPaddingX = PADDING_X[size];
    const contentPaddingX = PADDING_X[size];

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
          aria-controls={contentId}
          radius={radius}
          role="button"
          {...headerRest}
        >
          <Row fillWidth textVariant="heading-strong-s">
            {title}
          </Row>
          <Icon
            name={icon}
            size={size === "s" || size === "xs" ? "xs" : "s"}
            onBackground={isAccordionOpen ? "neutral-strong" : "neutral-weak"}
            style={{
              display: "flex",
              transform: isAccordionOpen ? `rotate(${iconRotation}deg)` : "rotate(0deg)",
              transition: "var(--transition-micro-medium)",
            }}
          />
        </Row>
        <Grid
          id={contentId}
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
