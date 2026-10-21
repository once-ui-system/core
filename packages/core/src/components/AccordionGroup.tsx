"use client";

import React, { useCallback, useState } from "react";
import type { CondensedTShirtSizes, TextVariant } from "../types.js";
import { Accordion } from "./Accordion.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Line } from "./Line.js";

export type AccordionItem = {
  title: React.ReactNode;
  content: React.ReactNode;
  /** Starts open. With `autoCollapse`, only the first such item does. */
  defaultOpen?: boolean;
};

export interface AccordionGroupProps extends React.ComponentProps<typeof Flex> {
  items: AccordionItem[];
  size?: CondensedTShirtSizes;
  autoCollapse?: boolean;
  /** Text style of every item's title, as on Accordion. Defaults to `heading-strong-s`. */
  titleVariant?: TextVariant;
  className?: string;
  style?: React.CSSProperties;
}

const AccordionGroup = ({
  ref,
  items,
  size = "m",
  style,
  className,
  autoCollapse = true,
  titleVariant,
  ...rest
}: AccordionGroupProps) => {
  // With autoCollapse the group owns which one item is open; without it,
  // each accordion keeps its own state from its item's `defaultOpen`.
  const [openAccordion, setOpenAccordion] = useState<number | null>(() => {
    const first = items?.findIndex((item) => item.defaultOpen) ?? -1;
    return first === -1 ? null : first;
  });

  const handleOpenChange = useCallback((index: number, open: boolean) => {
    setOpenAccordion((current) => (open ? index : current === index ? null : current));
  }, []);

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
              titleVariant={titleVariant}
              {...(autoCollapse
                ? {
                    open: openAccordion === index,
                    onOpenChange: (open: boolean) => handleOpenChange(index, open),
                  }
                : { defaultOpen: item.defaultOpen })}
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
