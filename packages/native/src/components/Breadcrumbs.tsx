import { type ReactNode, useState } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

export interface BreadcrumbItem {
  /** The crumb's text. */
  label: ReactNode;
  /**
   * Where the crumb leads, handed to `onNavigate` when it is pressed, so the
   * app's router can go there. A crumb with neither `href` nor `onPress` is plain text.
   */
  href?: string;
  /** Called when the crumb is pressed, instead of `onNavigate`. */
  onPress?: () => void;
  /** A leading icon, such as `home` on the first crumb. */
  prefixIcon?: IconName;
}

export interface BreadcrumbsProps extends Omit<FlexProps, "children"> {
  /** The trail, from the root to the current screen. The last item is the current screen. */
  items: BreadcrumbItem[];
  /** What sits between crumbs. Hidden from screen readers. */
  separator?: ReactNode;
  /**
   * Collapse a longer trail to the first crumb, a "more" button and the last
   * `maxItems - 1` crumbs. The button expands the trail in place. At least 2.
   */
  maxItems?: number;
  /** Called with a pressed crumb's `href`, for crumbs without their own `onPress`. */
  onNavigate?: (href: string, item: BreadcrumbItem) => void;
}

/**
 * Core's `Breadcrumbs`: where the current screen sits, as a trail of links
 * that wraps onto more lines when it is longer than the screen is wide.
 */
export function Breadcrumbs({ items, separator, maxItems, onNavigate, ...flex }: BreadcrumbsProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const limit = maxItems === undefined ? undefined : Math.max(2, Math.floor(maxItems));
  const collapse = !expanded && limit !== undefined && items.length > limit;
  const hidden = collapse ? items.length - limit : 0;

  const entries = items.map((item, position) => ({ item, position }));
  const visible = collapse ? [entries[0], ...entries.slice(1 + hidden)] : entries;

  const separatorNode = (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {separator ?? <Icon name="chevronRight" size="xs" onBackground="neutral-weak" />}
    </View>
  );

  const crumbContent = (item: BreadcrumbItem, color: string) => (
    <Row gap="4" vertical="center">
      {item.prefixIcon && <Icon name={item.prefixIcon} size="xs" color={color} />}
      {typeof item.label === "string" || typeof item.label === "number" ? (
        <Text variant="label-default-s" style={{ color }}>
          {item.label}
        </Text>
      ) : (
        item.label
      )}
    </Row>
  );

  return (
    <Row gap="8" wrap vertical="center" {...flex}>
      {visible.flatMap(({ item, position }, index) => {
        const current = position === items.length - 1;
        const color = theme.onBackground(current ? "neutral-strong" : "neutral-weak");
        const press =
          item.onPress ??
          (item.href && onNavigate ? () => onNavigate(item.href as string, item) : undefined);
        const crumb = (
          <Row key={position} gap="8" vertical="center">
            {index > 0 && separatorNode}
            {press ? (
              <Pressable
                accessibilityRole="link"
                // The current crumb is announced as selected, as core's `aria-current="page"`.
                accessibilityState={{ selected: current }}
                onPress={press}
                hitSlop={theme.space("12")}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                {crumbContent(item, color)}
              </Pressable>
            ) : (
              <View accessibilityState={{ selected: current }}>{crumbContent(item, color)}</View>
            )}
          </Row>
        );
        if (!(collapse && index === 1)) return [crumb];
        return [
          <Row key="collapsed" gap="8" vertical="center">
            {separatorNode}
            <IconButton
              icon="moreHorizontal"
              size="s"
              variant="tertiary"
              ariaLabel={`Show ${hidden} more`}
              onPress={() => setExpanded(true)}
            />
          </Row>,
          crumb,
        ];
      })}
    </Row>
  );
}
