"use client";

import React, { useState, useCallback } from "react";
import { Column, Accordion, Line, Flex } from ".";
import { CondensedTShirtSizes } from "../types";

export type AccordionItem = {
  title: React.ReactNode;
  content: React.ReactNode;
};

export interface AccordionGroupProps extends React.ComponentProps<typeof Flex> {
  items: AccordionItem[];
  size?: CondensedTShirtSizes;
  autoCollapse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const AccordionGroup: React.FC<AccordionGroupProps> = ({
  items,
  size = "m",
  style,
  className,
  autoCollapse = true,
  ...rest
}) => {
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

  return (
    <Column
      fillWidth
      radius="m"
      border="neutral-alpha-medium"
      overflow="hidden"
      style={style}
      className={className || ""}
      {...rest}
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        let radiusStyle: React.CSSProperties | undefined;
        if (items.length > 1) {
          if (isFirst) {
            radiusStyle = { borderRadius: "var(--radius-m) var(--radius-m) 0 0" };
          } else if (isLast) {
            radiusStyle = { borderRadius: "0 0 var(--radius-m) var(--radius-m)" };
          } else {
            radiusStyle = { borderRadius: 0 };
          }
        }

        return (
          <React.Fragment key={index}>
            <Accordion
              title={item.title}
              size={size}
              open={autoCollapse ? openAccordion === index : undefined}
              onToggle={() => handleAccordionToggle(index)}
              headerProps={radiusStyle ? { style: radiusStyle } : undefined}
            >
              {item.content}
            </Accordion>
            {!isLast && <Line background="neutral-alpha-medium" />}
          </React.Fragment>
        );
      })}
    </Column>
  );
};

AccordionGroup.displayName = "AccordionGroup";
export { AccordionGroup };
