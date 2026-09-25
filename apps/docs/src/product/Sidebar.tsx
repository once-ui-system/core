"use client";

import React, { useEffect, useState } from "react";
import {
  Schemes,
  Accordion,
  Column,
  Flex,
  Icon,
  Line,
  Row,
  ToggleButton,
  Skeleton,
  Pulse,
  Tag,
  Text,
  ColorScheme,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { layout } from "@/resources";
import { AVAILABILITY, type Availability } from "./availability";

import styles from "./Sidebar.module.scss";

// Global navigation cache to prevent refetching
let globalNavigationCache: any = null;

export interface NavigationItem extends Omit<
  React.ComponentProps<typeof Flex>,
  "title" | "label" | "children"
> {
  slug: string;
  title: string;
  label?: string;
  order?: number;
  children?: NavigationItem[];
  updatedAt: string;
  schemes?: Schemes;
  keywords?: string;
  pro?: boolean;
  navIcon?: string;
  navTag?: string;
  navLabel?: string;
  navTagVariant?: ColorScheme;
  status?: Availability;
}

/**
 * The sidebar's spacing, in one place because it is the part most likely to
 * want tuning. `rail*` control the indent that carries nesting: a vertical
 * rule plus its gap, which reads as hierarchy at a glance but costs
 * horizontal space, and this sidebar has a lot of items to fit.
 */
const NAV_RHYTHM = {
  /** Inset of the hierarchy rule from the group's left edge. */
  railInset: "12",
  /** Space between the rule and the child items. */
  railGap: "8",
  /** Space between sibling items. */
  itemGap: "4",
  /** Height of a leaf item. `m` is the component default and reads roomier. */
  itemSize: "m",
} as const;

interface SidebarProps extends Omit<
  React.ComponentProps<typeof Flex>,
  "children"
> {
  initialNavigation?: NavigationItem[];
}

// Memoized navigation item component to prevent re-renders
const NavigationItemComponent: React.FC<{
  item: NavigationItem;
  depth: number;
  pathname: string;
  renderNavigation: (items: NavigationItem[], depth: number) => React.ReactNode;
}> = ({ item, depth, pathname, renderNavigation }) => {
  const correctedSlug = item.slug;

  // Extract the path segments for better matching
  const pathSegments = pathname.split("/").filter(Boolean);

  // For top-level directories, check if their name is in the pathname segments
  // This will match routes like "/quick-start" for the "once-ui" parent
  const isTopLevelMatch =
    depth === 0 &&
    pathSegments.length >= 2 &&
    pathSegments[0] === "docs" &&
    correctedSlug.split("/")[0] === pathSegments[1];

  // For deeper items, check for exact match or if it's a parent path
  const isExactMatch = pathname === `/${correctedSlug}`;
  const isParentPath = pathname.startsWith(`/${correctedSlug}/`);

  // Only consider exact matches for selection, not parent paths
  const isSelected = isExactMatch;

  // Use this for accordion open state - if it's a parent or exact match
  const isActive = isExactMatch || isParentPath || isTopLevelMatch;

  // Check if the current path is within this section by comparing path segments
  // This is more reliable for deeper nested routes
  const isPathWithinSection = (() => {
    // Skip this check for empty paths
    if (!correctedSlug) return false;

    const sectionSegments = correctedSlug.split("/").filter(Boolean);

    // If there aren't enough segments in the path, it can't be within this section
    if (pathSegments.length < sectionSegments.length) return false;

    // Check if all section segments match the corresponding path segments
    for (let i = 0; i < sectionSegments.length; i++) {
      if (pathSegments[i] !== sectionSegments[i]) {
        return false;
      }
    }

    return true;
  })();

  // For accordion sections, check if any child's path is in the current URL
  const hasActiveChild = item.children?.some((child) => {
    const childSlug = child.slug;
    const childSegments = childSlug.split("/").filter(Boolean);

    // Check if the pathname segments match this child's segments
    if (pathSegments.length >= childSegments.length) {
      for (let i = 0; i < childSegments.length; i++) {
        if (pathSegments[i] !== childSegments[i]) {
          return false;
        }
      }
      return true;
    }

    return false;
  });

  // Check if current section should be open based on path matching
  // This ensures the section is open when arriving at a page within this section
  const shouldBeOpen =
    isSelected || hasActiveChild || isParentPath || isPathWithinSection;

  if (item.children) {
    return (
      <Row
        fillWidth
        radius="m"
        transition="micro-medium"
        background={shouldBeOpen ? "neutral-alpha-weak" : undefined}
      >
        <Column fillWidth>
          {layout.sidebar.collapsible ? (
            <Accordion
              gap="4"
              icon="chevronRight"
              iconRotation={90}
              style={{ height: "var(--static-space-40)" }}
              paddingX={undefined}
              paddingLeft="8"
              paddingRight="16"
              size="s"
              radius="s"
              open={shouldBeOpen}
              title={
                <Row
                  fillWidth
                  vertical="center"
                  textVariant="label-default-m"
                  paddingLeft="4"
                >
                  {item.title}
                </Row>
              }
            >
              <Row fillWidth gap={NAV_RHYTHM.railGap} paddingX={NAV_RHYTHM.railInset}>
                <Line vert background="neutral-alpha-medium" />
                <Column fillWidth gap={NAV_RHYTHM.itemGap}>
                  {renderNavigation(item.children, depth + 1)}
                </Column>
              </Row>
            </Accordion>
          ) : (
            <Column gap={NAV_RHYTHM.itemGap} paddingLeft="4" paddingTop="12">
              <Row
                paddingY="12"
                paddingLeft="8"
                textVariant="label-strong-s"
                onBackground="neutral-weak"
              >
                {item.title}
              </Row>
              <Row fillWidth gap={NAV_RHYTHM.railGap} paddingX={NAV_RHYTHM.railInset}>
                <Line vert background="neutral-alpha-medium" />
                <Column fillWidth gap={NAV_RHYTHM.itemGap}>
                  {renderNavigation(item.children, depth + 1)}
                </Column>
              </Row>
            </Column>
          )}
        </Column>
      </Row>
    );
  }

  return (
    <ToggleButton
      fillWidth
      size={NAV_RHYTHM.itemSize}
      horizontal="between"
      selected={isSelected}
      className={depth === 0 ? styles.navigation : undefined}
      href={`/${correctedSlug}`}
    >
      <Row fillWidth horizontal="between" vertical="center">
        <Row
          overflow="hidden"
          gap="8"
          onBackground="neutral-strong"
          textVariant={isSelected ? "label-strong-s" : "label-default-s"}
          style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {item.label || item.title}
        </Row>
        {(() => {
          /* Availability outranks recency. Something can be both new and
             unreleased, and in a column this narrow only one of the two fits —
             "you cannot install this yet" is the one worth the space. Unlike
             the recency tag below it never expires, because it stops being
             true only when a release makes it false. */
          if (item.status) {
            const { tag, scheme } = AVAILABILITY[item.status];
            return (
              <Tag scheme={scheme} size="s">
                {tag}
              </Tag>
            );
          }

          if (!item.navTag) return null;

          /* The label was authored all along and thrown away here: every page
             writes `navTag: "New"` or `"Update"` and the sidebar rendered a
             bare dot, so the two were told apart only by hue — cyan against
             green, which is both unreadable and the whole meaning resting on
             colour. The dot stays as the thing that catches the eye; the word
             says which it is. */
          const recency = (variant: ColorScheme | undefined) => (
            <Row gap="4" vertical="center" flex={0}>
              <Pulse scheme={variant} size="s" />
              <Text variant="label-default-xs" onBackground="neutral-weak">
                {item.navTag}
              </Text>
            </Row>
          );

          if (!item.updatedAt) return recency(item.navTagVariant);
          const age = Date.now() - new Date(item.updatedAt).getTime();
          if (age > 60 * 24 * 60 * 60 * 1000) return null;
          return recency(
            age > 30 * 24 * 60 * 60 * 1000
              ? "neutral"
              : age > 20 * 24 * 60 * 60 * 1000
                ? "warning"
                : item.navTagVariant,
          );
        })()}
      </Row>
    </ToggleButton>
  );
};

// Add display name and memoize with a less aggressive comparison function
const NavigationItem = React.memo(
  NavigationItemComponent,
  (prevProps, nextProps) => {
    // Always re-render if the pathname changes - this is critical for active state updates
    if (prevProps.pathname !== nextProps.pathname) {
      return false; // Different pathname means we should re-render
    }

    // Otherwise, only re-render if the item itself changes
    return prevProps.item === nextProps.item;
  },
);

NavigationItem.displayName = "NavigationItem";

// Memoized resource link component
const ResourceLinkComponent: React.FC<{
  href: string;
  icon: string;
  label: string;
  pathname: string;
  /** A recency label, drawn like a page's `navTag`: a brand dot and the word. */
  tag?: string;
}> = ({ href, icon, label, pathname, tag }) => {
  const isSelected = pathname === href;

  return (
    <ToggleButton
      fillWidth
      size="m"
      horizontal="between"
      selected={isSelected}
      className={styles.navigation}
      href={href}
    >
      <Row
        gap="12"
        vertical="center"
        onBackground={isSelected ? "neutral-strong" : "neutral-weak"}
        textVariant={isSelected ? "label-strong-m" : "label-default-m"}
      >
        <Icon size="xs" name={icon} />
        {label}
      </Row>
      {tag && (
        <Row gap="4" vertical="center" flex={0}>
          <Pulse scheme="brand" size="s" />
          <Text variant="label-default-xs" onBackground="neutral-weak">
            {tag}
          </Text>
        </Row>
      )}
    </ToggleButton>
  );
};

// Add display name and memoize with a less aggressive comparison function
const ResourceLink = React.memo(
  ResourceLinkComponent,
  (prevProps, nextProps) => {
    // Always re-render if the pathname changes - this is critical for active state updates
    if (prevProps.pathname !== nextProps.pathname) {
      return false; // Different pathname means we should re-render
    }

    // Otherwise, only re-render if the href, icon or tag changes
    return (
      prevProps.href === nextProps.href &&
      prevProps.icon === nextProps.icon &&
      prevProps.tag === nextProps.tag
    );
  },
);

ResourceLink.displayName = "ResourceLink";

// Create a stable version of the sidebar that doesn't re-render
const SidebarContent: React.FC<{
  navigation: NavigationItem[];
  pathname: string;
}> = React.memo(
  ({ navigation, pathname }) => {
    // Create a render function that captures the current pathname
    const renderNavigation = (items: NavigationItem[], depth = 0) => {
      return (
        <>
          {items.map((item) => (
            <NavigationItem
              key={item.slug}
              item={item}
              depth={depth}
              pathname={pathname}
              renderNavigation={renderNavigation}
            />
          ))}
        </>
      );
    };

    // Release history lives on GitHub, generated from CHANGELOG.md.
    const resourcesSection = (
      <Column gap="4" marginTop="32" paddingLeft="4">
        <Row
          textVariant="label-strong-s"
          onBackground="brand-strong"
          paddingLeft="8"
          paddingY="12"
        >
          Resources
        </Row>
        {/* The blocks surface has its own catalogue and hides this sidebar,
            so this is the way into it from the reference. Free with 2.0. */}
        <ResourceLink
          href="/blocks/quickStart"
          icon="apps"
          label="Blocks"
          tag="New"
          pathname={pathname}
        />
        <ResourceLink
          href="https://github.com/once-ui-system/core/releases"
          icon="github"
          label="Changelog"
          pathname={pathname}
        />
      </Column>
    );

    return (
      <>
        {renderNavigation(navigation, 0)}
        {resourcesSection}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Always re-render if pathname changes
    if (prevProps.pathname !== nextProps.pathname) {
      return false; // Different pathname means we should re-render
    }

    // Otherwise, only re-render if navigation changes
    return prevProps.navigation === nextProps.navigation;
  },
);

SidebarContent.displayName = "SidebarContent";

const Sidebar: React.FC<SidebarProps> = ({ initialNavigation, ...rest }) => {
  const [navigation, setNavigation] = useState<NavigationItem[]>(
    initialNavigation || [],
  );
  const [hasLoaded, setHasLoaded] = useState(false);
  const pathname = usePathname();

  /**
   * The blocks surface brings its own catalogue.
   *
   * It lives under the same root layout as the documentation, so without this
   * a reader browsing blocks would get a nav for the component reference
   * beside a nav for the thing they are actually looking at. Standing down
   * here keeps the decision in one place rather than making the root layout
   * aware of which section it is rendering, which a server layout cannot ask.
   */
  const isBlocks = pathname?.startsWith("/blocks");

  // Load navigation data only once, using global cache
  useEffect(() => {
    // Use initialNavigation if provided
    if (initialNavigation && initialNavigation.length > 0) {
      setNavigation(initialNavigation);
      globalNavigationCache = initialNavigation;
      setHasLoaded(true);
      return;
    }

    // Use global cache if available
    if (globalNavigationCache) {
      setNavigation(globalNavigationCache);
      setHasLoaded(true);
      return;
    }

    // Fetch only if not loaded and no global cache
    if (!hasLoaded) {
      fetch("/api/navigation")
        .then((res) => res.json())
        .then((data) => {
          setNavigation(data);
          globalNavigationCache = data; // Cache globally
          setHasLoaded(true);
        })
        .catch((err) => {
          console.error("Navigation fetch failed", err);
          setHasLoaded(true);
        });
    }
  }, [initialNavigation, hasLoaded]);

  if (isBlocks) return null;

  return (
    <Column
      fillHeight
      width={layout.sidebar.width}
      minWidth={layout.sidebar.width}
      paddingY="4"
      {...rest}
    >
      <Column
        position="sticky"
        fillHeight
        gap="4"
        as="nav"
        overflowY="auto"
        padding="12"
        style={{ maxHeight: "calc(100vh - 4rem)", top: "3.875rem" }}
      >
        {hasLoaded ? (
          <SidebarContent
            key={pathname}
            navigation={navigation}
            pathname={pathname}
          />
        ) : (
          <Column fillWidth gap="4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Row key={i} height="40" paddingX="4" vertical="center">
                <Row fill radius="l" overflow="hidden" opacity={50}>
                  <Skeleton shape="block" delay={i.toString() as any} />
                </Row>
              </Row>
            ))}
          </Column>
        )}
      </Column>
    </Column>
  );
};

// Use a custom comparison function for the entire Sidebar component
const MemoizedSidebar = React.memo(Sidebar, (prevProps, nextProps) => {
  // Only re-render if the initialNavigation changes
  // The component will re-render when pathname changes via usePathname hook internally
  return prevProps.initialNavigation === nextProps.initialNavigation;
});

MemoizedSidebar.displayName = "MemoizedSidebar";

export { MemoizedSidebar as Sidebar };
