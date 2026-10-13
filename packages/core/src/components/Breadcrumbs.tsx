"use client";

import type React from "react";
import { forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import type { IconName } from "../icons";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Row } from "./Row";
import { SmartLink } from "./SmartLink";

interface BreadcrumbItem {
  /** The crumb's text. */
  label: ReactNode;
  /**
   * Where the crumb links. Internal paths go through the app's Link adapter, so
   * they are client-side navigations in Next. A crumb without one is plain text,
   * such as a section that has no page of its own.
   */
  href?: string;
  /** A leading icon, such as `home` on the first crumb. */
  prefixIcon?: IconName;
}

interface BreadcrumbsProps extends Omit<React.ComponentProps<typeof Row>, "children"> {
  /** The trail, from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /** What sits between crumbs. Hidden from screen readers, which announce the list instead. */
  separator?: ReactNode;
  /**
   * Collapse a longer trail to the first crumb, a "more" button and the last
   * `maxItems - 1` crumbs. The button expands the trail in place. At least 2.
   */
  maxItems?: number;
  /** The landmark's name. Change it only to translate it. */
  "aria-label"?: string;
}

/**
 * Where the current page sits in the site: a `nav` landmark holding an ordered
 * list of links, the last one marked `aria-current="page"`.
 *
 * Separators are drawn but hidden from assistive technology. Links render
 * through SmartLink, so an internal `href` uses the app's Link adapter.
 */
const Breadcrumbs = forwardRef<HTMLDivElement, BreadcrumbsProps>(
  (
    {
      items,
      separator = <Icon name="chevronRight" size="xs" />,
      maxItems,
      "aria-label": ariaLabel = "Breadcrumb",
      ...flex
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(false);
    const listRef = useRef<HTMLDivElement | null>(null);
    const focusAfterExpand = useRef(false);

    const limit = maxItems === undefined ? undefined : Math.max(2, Math.floor(maxItems));
    const collapse = !expanded && limit !== undefined && items.length > limit;
    const hidden = collapse ? items.length - limit : 0;

    const entries = items.map((item, position) => ({ item, position }));
    const visible = collapse ? [entries[0], ...entries.slice(1 + hidden)] : entries;

    // The "more" button disappears when it expands the trail, so focus moves to
    // the first crumb it revealed instead of falling back to the page.
    useEffect(() => {
      if (!expanded || !focusAfterExpand.current) return;
      focusAfterExpand.current = false;
      const revealed = listRef.current?.children[1];
      revealed?.querySelector<HTMLElement>("a, button")?.focus();
    }, [expanded]);

    const separatorNode = (
      <Flex as="span" aria-hidden="true" onBackground="neutral-weak" vertical="center">
        {separator}
      </Flex>
    );

    return (
      <Row ref={ref} as="nav" aria-label={ariaLabel} textVariant="label-default-s" {...flex}>
        <Row as="ol" ref={listRef} margin="0" padding="0" gap="8" wrap vertical="center">
          {visible.flatMap(({ item, position }, index) => {
            const current = position === items.length - 1;
            const crumb = (
              <Row
                as="li"
                key={position}
                gap="8"
                vertical="center"
                onBackground={current ? "neutral-strong" : "neutral-weak"}
              >
                {index > 0 && separatorNode}
                {item.href ? (
                  <SmartLink
                    href={item.href}
                    prefixIcon={item.prefixIcon}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </SmartLink>
                ) : (
                  <Row
                    as="span"
                    gap="4"
                    vertical="center"
                    aria-current={current ? "page" : undefined}
                  >
                    {item.prefixIcon && <Icon name={item.prefixIcon} size="xs" />}
                    {item.label}
                  </Row>
                )}
              </Row>
            );
            if (!(collapse && index === 1)) return [crumb];
            return [
              <Row as="li" key="collapsed" gap="8" vertical="center" onBackground="neutral-weak">
                {separatorNode}
                <IconButton
                  icon="moreHorizontal"
                  size="s"
                  variant="tertiary"
                  tooltip={`Show ${hidden} more`}
                  aria-label={`Show ${hidden} more`}
                  onClick={() => {
                    focusAfterExpand.current = true;
                    setExpanded(true);
                  }}
                />
              </Row>,
              crumb,
            ];
          })}
        </Row>
      </Row>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";

export type { BreadcrumbItem, BreadcrumbsProps };
export { Breadcrumbs };
