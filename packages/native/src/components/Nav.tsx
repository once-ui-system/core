import { createContext, type ReactNode, useContext, useState } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { SpacingToken } from "../types";
import { Accordion } from "./Accordion";
import { Column, type FlexProps, Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import { Line } from "./Line";
import { Text } from "./Text";
import { touchSlop } from "./touch";

export type NavDensity = "compact" | "normal" | "spacious";
export type NavVariant = "solid" | "subtle" | "minimal";

/** Core's sizes behind each density: row height, gaps and text size. */
const DENSITY = {
  compact: { height: "32", x: "8", gap: "2", iconGap: "8", text: "s", section: "xs", inset: "12" },
  normal: { height: "40", x: "16", gap: "4", iconGap: "12", text: "m", section: "s", inset: "24" },
  spacious: {
    height: "48",
    x: "16",
    gap: "4",
    iconGap: "12",
    text: "m",
    section: "s",
    inset: "24",
  },
} as const satisfies Record<
  NavDensity,
  {
    height: SpacingToken;
    x: SpacingToken;
    gap: SpacingToken;
    iconGap: SpacingToken;
    text: "s" | "m";
    section: "xs" | "s";
    inset: SpacingToken;
  }
>;

interface NavStyle {
  density: NavDensity;
  variant: NavVariant;
  rail: boolean;
  tabs: boolean;
}

const OUTSIDE: NavStyle = { density: "normal", variant: "solid", rail: true, tabs: false };
const NavContext = createContext<NavStyle>(OUTSIDE);

/** The look the nearest Nav set, or the defaults outside one. */
export function useNavStyle() {
  const style = useContext(NavContext);
  return { ...style, inNav: style !== OUTSIDE, sizes: DENSITY[style.density] };
}

export interface NavProps extends FlexProps {
  /** How tight the rows sit: 32, 40 or 48 tall. Compact also drops the text to the small label. */
  density?: NavDensity;
  /**
   * How the current item stands out. `solid` fills it, `subtle` fills it and
   * dims the others, `minimal` marks it by weight and contrast alone.
   */
  variant?: NavVariant;
  /** The vertical line down an open NavGroup. */
  rail?: boolean;
}

/**
 * Core's `Nav`. As a column (the default) it is a sidebar or a drawer's
 * list. With `direction="row"` it is the phone's bottom tab bar: the items
 * share the width, each an icon over its label, with a line along the top
 * and the home indicator's inset below. Same props as core.
 */
export function Nav({
  density = "normal",
  variant = "solid",
  rail = true,
  direction = "column",
  children,
  ...flex
}: NavProps) {
  const tabs = direction === "row" || direction === "row-reverse";
  const sizes = DENSITY[density];
  return (
    <NavContext.Provider value={{ density, variant, rail, tabs }}>
      {tabs ? (
        <Row
          role="tablist"
          fillWidth
          direction={direction}
          vertical="stretch"
          paddingX="8"
          paddingTop="4"
          paddingBottom="4"
          gap="4"
          background="page"
          borderTop="neutral-alpha-weak"
          safeArea={["bottom"]}
          {...flex}
        >
          {children}
        </Row>
      ) : (
        <Column role="navigation" fillWidth direction={direction} gap={sizes.gap} {...flex}>
          {children}
        </Column>
      )}
    </NavContext.Provider>
  );
}

export interface NavSectionProps extends FlexProps {
  /** The heading over the rows. */
  label?: ReactNode;
  /** A control at the end of the heading, such as an add button. */
  action?: ReactNode;
}

/** Core's `NavSection`: a titled block of rows, its heading small and dim. */
export function NavSection({ label, action, children, ...column }: NavSectionProps) {
  const { sizes } = useNavStyle();
  return (
    <Column fillWidth gap={sizes.gap} {...column}>
      {(label || action) && (
        <Row
          fillWidth
          vertical="center"
          horizontal="between"
          gap="8"
          minHeight="24"
          paddingLeft={sizes.x === "8" ? "12" : "16"}
          paddingRight="4"
          paddingTop="8"
        >
          {typeof label === "string" ? (
            <Text variant={`label-default-${sizes.section}`} onBackground="neutral-weak">
              {label}
            </Text>
          ) : (
            label
          )}
          {action}
        </Row>
      )}
      {children}
    </Column>
  );
}

export interface NavItemProps extends Omit<PressableProps, "children" | "style"> {
  label: ReactNode;
  icon?: IconName;
  /** The current page (or tab). */
  selected?: boolean;
  /** A pill at the end of the row, or on a tab's icon. A number is a count: 0 hides it, above 9 prints 9+. */
  badge?: number | ReactNode;
  /** A dot, for unread with no number worth showing. */
  indicator?: boolean;
  disabled?: boolean;
  /** Core's name for `onPress`; both work. */
  onClick?: () => void;
  style?: ViewStyle;
}

function Badge({ badge, indicator }: Pick<NavItemProps, "badge" | "indicator">) {
  const theme = useTheme();
  // Core's `solid="brand-strong"`: Flex has no `solid`, so the fill is set directly.
  const fill = { backgroundColor: theme.color("brand-solid-strong") };
  const count = typeof badge === "number" ? badge : undefined;
  const show =
    count !== undefined
      ? count > 0
      : badge !== undefined && badge !== null && badge !== false && badge !== "";
  if (show) {
    return (
      <Row
        minWidth="16"
        height="16"
        paddingX="4"
        radius="full"
        horizontal="center"
        vertical="center"
        aria-label={count !== undefined ? `${count} unread` : undefined}
        style={fill}
      >
        <Text variant="label-default-xs" onSolid="brand-strong">
          {count !== undefined ? (count > 9 ? "9+" : String(count)) : badge}
        </Text>
      </Row>
    );
  }
  if (indicator && badge === undefined) {
    return <Row width="8" height="8" radius="full" aria-hidden style={fill} />;
  }
  return null;
}

/**
 * Core's `NavItem`: one row of navigation that knows whether it is the
 * current page. Inside a row `Nav` it is a tab: icon over label, the current
 * one in the brand colour.
 */
export function NavItem({
  label,
  icon,
  selected = false,
  badge,
  indicator,
  disabled = false,
  onPress,
  onClick,
  style,
  ...rest
}: NavItemProps) {
  const theme = useTheme();
  const { variant, sizes, tabs } = useNavStyle();
  const emphasis = variant !== "solid";
  const press = onPress ?? (onClick ? () => onClick() : undefined);

  if (tabs) {
    const tone = selected ? "brand-medium" : "neutral-weak";
    return (
      <Pressable
        role="tab"
        aria-selected={selected}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={press}
        {...rest}
        style={({ pressed }) => [
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: theme.space("2"),
            minHeight: theme.space("48"),
            paddingVertical: theme.space("4"),
            borderRadius: theme.radius("m"),
            opacity: disabled ? 0.5 : 1,
            backgroundColor: pressed ? theme.color("neutral-alpha-weak") : "transparent",
          } satisfies ViewStyle,
          style,
        ]}
      >
        {icon && (
          <Row>
            <Icon name={icon} size="m" onBackground={tone} />
            <Row position="absolute" style={{ top: -4, left: "60%" }}>
              <Badge badge={badge} indicator={indicator} />
            </Row>
          </Row>
        )}
        {typeof label === "string" ? (
          <Text
            variant={`label-${selected ? "strong" : "default"}-xs`}
            onBackground={tone}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : (
          label
        )}
      </Pressable>
    );
  }

  const height = theme.space(sizes.height);
  const textTone = emphasis ? (selected ? "neutral-strong" : "neutral-weak") : "neutral-strong";
  return (
    <Pressable
      accessibilityRole="link"
      aria-current={selected ? "page" : undefined}
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
      onPress={press}
      {...rest}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.space(sizes.iconGap),
          minHeight: height,
          paddingHorizontal: theme.space(sizes.x),
          borderRadius: theme.radius("m"),
          opacity: disabled ? 0.5 : 1,
          backgroundColor:
            selected && variant !== "minimal"
              ? theme.color("neutral-alpha-medium")
              : pressed
                ? theme.color("neutral-alpha-weak")
                : "transparent",
        } satisfies ViewStyle,
        style,
      ]}
    >
      <Row gap={sizes.iconGap} vertical="center" flex={1}>
        {icon && (
          <Icon
            name={icon}
            size="xs"
            onBackground={emphasis && selected ? "neutral-strong" : "neutral-weak"}
          />
        )}
        {typeof label === "string" ? (
          <Text
            variant={`label-${emphasis && selected ? "strong" : "default"}-${sizes.text}`}
            onBackground={textTone}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {label}
          </Text>
        ) : (
          label
        )}
      </Row>
      <Badge badge={badge} indicator={indicator} />
    </Pressable>
  );
}

export interface NavGroupProps extends Omit<FlexProps, "children"> {
  label: ReactNode;
  icon?: IconName;
  children: ReactNode;
  /** Open state, when the host owns it. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Called on the header. */
  onToggle?: () => void;
  /** Core 3.0's change handler: called with the next state. */
  onOpenChange?: (open: boolean) => void;
  /** Marks the header itself as the current page. */
  selected?: boolean;
}

/** Core's `NavGroup`: a collapsible set of NavItems, indented behind a rail. */
export function NavGroup({
  label,
  icon,
  children,
  open,
  defaultOpen = false,
  onToggle,
  onOpenChange,
  selected = false,
  ...row
}: NavGroupProps) {
  const { variant, rail, sizes } = useNavStyle();
  const emphasis = variant !== "solid";
  const [own, setOwn] = useState(defaultOpen);
  const isOpen = open ?? own;
  const toggle = () => {
    if (open === undefined) setOwn(!isOpen);
    onToggle?.();
    onOpenChange?.(!isOpen);
  };
  return (
    <Row
      fillWidth
      radius="m"
      background={(isOpen || selected) && variant !== "minimal" ? "neutral-alpha-weak" : undefined}
      {...row}
    >
      <Accordion
        open={isOpen}
        onToggle={toggle}
        size={sizes.text === "s" ? "s" : "m"}
        headerProps={{ paddingLeft: sizes.x, minHeight: sizes.height }}
        contentProps={{ paddingTop: "4", paddingBottom: "8" }}
        title={
          <Row fillWidth gap={sizes.iconGap} vertical="center">
            {icon && <Icon name={icon} onBackground="neutral-weak" size="xs" />}
            {typeof label === "string" ? (
              <Text
                variant={`label-${emphasis && selected ? "strong" : "default"}-${sizes.text}`}
                onBackground={emphasis && !selected ? "neutral-weak" : "neutral-strong"}
              >
                {label}
              </Text>
            ) : (
              label
            )}
          </Row>
        }
      >
        <Row fillWidth gap="8" paddingX="12">
          {rail ? <Line vert background="neutral-alpha-medium" /> : <Row minWidth={0.0625} />}
          <Column flex={1} gap={sizes.gap}>
            {children}
          </Column>
        </Row>
      </Accordion>
    </Row>
  );
}
