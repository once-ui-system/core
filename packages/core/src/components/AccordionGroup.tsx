"use client";

import type { CSSProperties, ReactNode } from "react";
import { Fragment, forwardRef, useCallback, useState } from "react";
import type { CondensedTShirtSizes } from "../types";
import { Accordion } from "./Accordion";
import { Column } from "./Column";
import type { Flex } from "./Flex";
import { Line } from "./Line";
import type { Row } from "./Row";

export type AccordionItem = {
  title: ReactNode;
  content: ReactNode;
  headerProps?: React.ComponentProps<typeof Row>;
};

export interface AccordionGroupProps extends React.ComponentProps<typeof Flex> {
  items: AccordionItem[];
  size?: CondensedTShirtSizes;
  autoCollapse?: boolean;
  className?: string;
  style?: CSSProperties;
}

const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  (
    {
      items,
      size = "m",
      style,
      className,
      autoCollapse = true,
      radius = "m",
      border = "neutral-alpha-medium",
      overflow = "hidden",
      fillWidth = true,
      ...rest
    },
    ref,
  ) => {
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);

    const handleAccordionToggle = useCallback(
      (index: number) => {
        if (autoCollapse) {
          // If clicking the same accordion, close it
          if (openAccordion === index) {
            setOpenAccordion(null);
          } else {
            // Otherwise, open the clicked accordion and close others
            setOpenAccordion(index);
          }
        }
        // If autoCollapse is false, let each accordion handle its own state
      },
      [autoCollapse, openAccordion],
    );

    if (!items || items.length === 0) {
      return null;
    }

    const dividerBackground =
      typeof border === "string" && border !== "surface" && border !== "transparent"
        ? border
        : "neutral-alpha-medium";

    return (
      <Column
        ref={ref}
        fillWidth={fillWidth}
        radius={radius}
        border={border}
        overflow={overflow}
        style={style}
        className={className}
        {...rest}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Accordion items do not have required unique IDs
            <Fragment key={index}>
              <Accordion
                title={item.title}
                size={size}
                radius="none"
                open={autoCollapse ? openAccordion === index : undefined}
                onToggle={autoCollapse ? () => handleAccordionToggle(index) : undefined}
                headerProps={item.headerProps}
              >
                {item.content}
              </Accordion>
              {!isLast && <Line background={dividerBackground} />}
            </Fragment>
          );
        })}
      </Column>
    );
  },
);

AccordionGroup.displayName = "AccordionGroup";

export { AccordionGroup };
