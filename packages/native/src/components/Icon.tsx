import {
  type ComponentType,
  createContext,
  createElement,
  type ReactNode,
  useContext,
} from "react";
import { View, type ViewStyle } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { iconData } from "../icons/data";
import type { IconNode } from "../icons/types";
import { useTheme } from "../theme/ThemeProvider";
import type { ColorScheme, ColorWeight, TShirtSizes } from "../types";

/** The names Once UI ships, the same set as core's. */
export type BuiltInIconName = keyof typeof iconData;

/**
 * Names an app registers through `IconProvider`, declared as in core:
 * `declare module "@once-ui-system/native" { interface IconLibraryOverrides { rocket: true } }`.
 */
// biome-ignore lint/suspicious/noEmptyInterface: the point is for apps to augment it
export interface IconLibraryOverrides {}

export type IconName = BuiltInIconName | Extract<keyof IconLibraryOverrides, string>;

/**
 * An icon: core's SVG data (`{ tag, attr, child }`), or a component that draws
 * itself at `size` points in `color`, such as one from `@expo/vector-icons`.
 */
export type NativeIcon = IconNode | ComponentType<{ size: number; color: string }>;

const IconContext = createContext<Record<string, NativeIcon>>(iconData);

/** Core's `IconProvider`: adds to or replaces the built-in icons, by name. */
export function IconProvider({
  icons,
  children,
}: {
  icons?: Partial<Record<IconName, NativeIcon>> | Record<string, NativeIcon>;
  children: ReactNode;
}) {
  const merged: Record<string, NativeIcon> = { ...iconData };
  for (const [name, icon] of Object.entries(icons ?? {})) if (icon) merged[name] = icon;
  return <IconContext.Provider value={merged}>{children}</IconContext.Provider>;
}

export const useIcons = () => useContext(IconContext);

// The only shapes core's icon data uses.
const SHAPES: Record<string, ComponentType<Record<string, unknown>>> = {
  path: Path as ComponentType<Record<string, unknown>>,
  circle: Circle as ComponentType<Record<string, unknown>>,
  rect: Rect as ComponentType<Record<string, unknown>>,
};

function shapes(nodes: IconNode[]): ReactNode {
  return nodes.map((node, i) => {
    const Shape = SHAPES[node.tag];
    if (!Shape) return null;
    const { "aria-hidden": _hidden, ...attr } = node.attr;
    return createElement(Shape, { key: i, ...attr }, shapes(node.child));
  });
}

/** Draws core's icon data, as core's `createIcon` does: `currentColor` throughout, the icon's own attributes winning. */
function SvgIcon({ data, size, color }: { data: IconNode; size: number; color: string }) {
  const { "aria-hidden": _hidden, ...attr } = data.attr;
  return (
    <Svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      {...attr}
      width={size}
      height={size}
      color={color}
    >
      {shapes(data.child)}
    </Svg>
  );
}

// Icon.module.scss sizes, in static spacing steps.
const SIZES = { xs: "16", s: "20", m: "24", l: "32", xl: "40" } as const;

export interface IconProps {
  name: IconName;
  size?: TShirtSizes;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  /** A colour, for an icon inside another component's label. Wins over `onBackground`. */
  color?: string;
  /** Hidden from screen readers unless `false`, as in core. */
  decorative?: boolean;
  ariaLabel?: string;
  style?: ViewStyle;
}

/** Core's `Icon`: one of the built-in icons, or one registered with `IconProvider`. */
export function Icon({
  name,
  size = "m",
  onBackground,
  onSolid,
  color,
  decorative = true,
  ariaLabel,
  style,
}: IconProps) {
  const theme = useTheme();
  const icons = useIcons();
  const icon = icons[name];
  if (!icon) {
    console.warn(`Icon "${name}" does not exist in the library.`);
    return null;
  }
  const px = theme.space(SIZES[size]);
  const fill =
    color ??
    (onSolid
      ? theme.onSolid(onSolid)
      : onBackground
        ? theme.onBackground(onBackground)
        : theme.onBackground("neutral-strong"));
  const Custom = typeof icon === "function" ? icon : null;

  return (
    <View
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : "image"}
      accessibilityLabel={decorative ? undefined : (ariaLabel ?? name)}
      aria-hidden={decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : "auto"}
      style={[{ width: px, height: px, alignItems: "center", justifyContent: "center" }, style]}
    >
      {Custom ? (
        <Custom size={px} color={fill} />
      ) : (
        <SvgIcon data={icon as IconNode} size={px} color={fill} />
      )}
    </View>
  );
}

/** A `prefixIcon`-style prop: an icon name as in core, or any element. */
export type IconSlot = IconName | ReactNode;

/** Renders an `IconSlot` at a component's icon size and colour. */
export function renderIcon(slot: IconSlot, size: TShirtSizes, color: string): ReactNode {
  if (typeof slot === "string") return <Icon name={slot as IconName} size={size} color={color} />;
  return slot;
}
