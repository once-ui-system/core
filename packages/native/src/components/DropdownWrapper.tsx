import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type GestureResponderEvent,
  type LayoutRectangle,
  Modal,
  Pressable,
  ScrollView,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";
import { Option, type OptionProps } from "./Select";

/** Core's `Placement`: a side of the trigger, and which edge of it the menu lines up with. */
export type Placement =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | `${"top" | "right" | "bottom" | "left"}-${"start" | "end"}`;

type Rect = Pick<LayoutRectangle, "x" | "y" | "width" | "height">;

/**
 * Where the menu's top-left corner goes, and how tall it may be, for a menu
 * of `size` next to `anchor` inside `bounds`. A point (core ContextMenu's
 * pointer) is an anchor of no size.
 *
 * As floating-ui does on the web: the menu opens on `placement`'s side,
 * `gap` away, unless it only fits on the other one; with room on neither it
 * takes the larger and scrolls. Along the side it lines up with the start,
 * end or middle of the anchor, mirrored when that runs off screen, then held
 * inside `bounds`.
 */
export function placeMenu(
  placement: Placement,
  anchor: Rect,
  size: { width: number; height: number },
  bounds: { top: number; right: number; bottom: number; left: number },
  gap: number,
): { left: number; top: number; maxHeight: number } {
  const [side, align] = placement.split("-");
  const vertical = side === "top" || side === "bottom";
  const after = side === "bottom" || side === "right";

  const main = (start: number, length: number, s: number, lo: number, hi: number) => {
    const roomAfter = hi - (start + length + gap);
    const roomBefore = start - gap - lo;
    const preferred = after ? roomAfter : roomBefore;
    const other = after ? roomBefore : roomAfter;
    const useAfter =
      preferred >= s ? after : other >= s ? !after : preferred >= other ? after : !after;
    const room = Math.max(0, useAfter ? roomAfter : roomBefore);
    return {
      pos: useAfter ? start + length + gap : start - gap - Math.min(s, room),
      room,
    };
  };
  const cross = (start: number, length: number, s: number, lo: number, hi: number) => {
    const at = (a: string | undefined) =>
      a === "start" ? start : a === "end" ? start + length - s : start + length / 2 - s / 2;
    let pos = at(align);
    if (align && (pos < lo || pos + s > hi)) pos = at(align === "start" ? "end" : "start");
    return Math.max(lo, Math.min(pos, hi - s));
  };

  if (vertical) {
    const y = main(anchor.y, anchor.height, size.height, bounds.top, bounds.bottom);
    const left = cross(anchor.x, anchor.width, size.width, bounds.left, bounds.right);
    return { left, top: y.pos, maxHeight: y.room };
  }
  const x = main(anchor.x, anchor.width, size.width, bounds.left, bounds.right);
  const top = cross(anchor.y, anchor.height, size.height, bounds.top, bounds.bottom);
  return { left: x.pos, top, maxHeight: bounds.bottom - bounds.top };
}

/**
 * Every `Option` in `children`, through fragments and the elements around
 * them, passed through `map`. React Native has no click delegation for
 * core's `data-value` lookup, so this is how a menu reaches its options.
 * Options rendered by a component of your own are not reached.
 */
function mapOptions(
  children: ReactNode,
  map: (option: ReactElement<OptionProps>) => ReactElement,
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    if (child.type === Option) return map(child as ReactElement<OptionProps>);
    if (child.props.children === undefined) return child;
    return cloneElement(child, undefined, mapOptions(child.props.children, map));
  });
}

export interface DropdownProps extends Omit<FlexProps, "children"> {
  /** Marks the `Option` with this value as selected, unless it sets `selected` itself. */
  selectedOption?: string;
  /** Called with an `Option`'s value when it is pressed, after its own `onPress`. */
  onSelect?: (value: string) => void;
  /** Dims the menu and ignores presses on its options. */
  disabled?: boolean;
  children?: ReactNode;
}

/** Core's `Dropdown`: the bordered surface a menu's options sit on, scrolling when it is held short. */
export const Dropdown: RefComponent<DropdownProps, ViewRef> = forwardRef<ViewRef, DropdownProps>(
  function Dropdown({ selectedOption, onSelect, disabled = false, children, ...flex }, ref) {
    const theme = useTheme();
    const { style, rest, userStyle, hidden } = flexStyle(theme, {
      // A column, where core has a row around one: the scroll view is the only child.
      direction: "column",
      border: "neutral-medium",
      background: "surface",
      ...flex,
    });
    if (hidden) return null;
    const options = mapOptions(children, (option) =>
      cloneElement(option, {
        selected:
          option.props.selected ??
          (selectedOption !== undefined && option.props.value === selectedOption),
        disabled: option.props.disabled || disabled,
        onPress: (value: string) => {
          (option.props.onPress ?? option.props.onClick)?.(value);
          onSelect?.(value);
        },
      }),
    );
    return (
      <View
        ref={ref}
        role="menu"
        aria-disabled={disabled || undefined}
        {...rest}
        style={[style, disabled && { opacity: 0.6 }, userStyle]}
      >
        <ScrollView
          style={{ flexGrow: 0, flexShrink: 1 }}
          contentContainerStyle={{ gap: theme.space("2") }}
        >
          {options}
        </ScrollView>
      </View>
    );
  },
);

export interface MenuLayerProps {
  open: boolean;
  onClose: () => void;
  /** The trigger in window coordinates, or the press point as a rect of no size. */
  anchor: Rect | null;
  placement: Placement;
  /** Points between the anchor and the menu. */
  gap: number;
  /** In rem, as core's. */
  minWidth?: number;
  maxWidth?: number;
  /** In points, as core's. */
  minHeight?: number;
  /** Exactly the anchor's width, as core's `fillWidth`. */
  matchWidth?: boolean;
  selectedOption?: string;
  onSelect: (value: string) => void;
  children: ReactNode;
}

/**
 * The open menu, shared by `DropdownWrapper` and `ContextMenu`: a `Dropdown`
 * in a transparent `Modal`, placed against `anchor` once it has been laid
 * out once. A press outside it or the back button closes it.
 */
export function MenuLayer({
  open,
  onClose,
  anchor,
  placement,
  gap,
  minWidth,
  maxWidth,
  minHeight,
  matchWidth,
  selectedOption,
  onSelect,
  children,
}: MenuLayerProps) {
  const theme = useTheme();
  const screen = useWindowDimensions();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    if (!open) setSize(null);
  }, [open]);

  const margin = theme.space("8");
  const bounds = {
    top: theme.insets.top + margin,
    right: screen.width - theme.insets.right - margin,
    bottom: screen.height - theme.insets.bottom - margin,
    left: theme.insets.left + margin,
  };
  const place = anchor && size ? placeMenu(placement, anchor, size, bounds, gap) : null;
  const panel: StyleProp<ViewStyle> = {
    position: "absolute",
    left: place?.left ?? bounds.left,
    top: place?.top ?? bounds.top,
    // Hidden until it is measured and placed, so it never shows at the corner first.
    opacity: place ? 1 : 0,
    minWidth: matchWidth && anchor ? anchor.width : minWidth ? theme.space(minWidth) : undefined,
    width: matchWidth && anchor ? anchor.width : undefined,
    maxWidth: Math.min(
      maxWidth ? theme.space(maxWidth) : Number.POSITIVE_INFINITY,
      bounds.right - bounds.left,
    ),
    minHeight,
    maxHeight: place?.maxHeight ?? bounds.bottom - bounds.top,
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Close"
        onPress={onClose}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View
        style={panel}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== size?.width || height !== size?.height) setSize({ width, height });
        }}
      >
        <Dropdown
          radius="l"
          style={{ flexShrink: 1 }}
          selectedOption={selectedOption}
          onSelect={onSelect}
          accessibilityViewIsModal
        >
          {children}
        </Dropdown>
      </View>
    </Modal>
  );
}

/** The trigger element with `handler` run after its own `prop`, so a pressable trigger still opens. */
export function chainPress(
  node: ReactNode,
  prop: "onPress" | "onLongPress",
  handler: (e: GestureResponderEvent) => void,
): ReactNode {
  if (!isValidElement<Record<string, unknown>>(node)) return node;
  const own = node.props[prop] as ((e: GestureResponderEvent) => void) | undefined;
  return cloneElement(node, {
    [prop]: (e: GestureResponderEvent) => {
      own?.(e);
      handler(e);
    },
  });
}

export interface DropdownWrapperProps {
  /** What opens the menu. A pressable element (a `Button`) keeps its own `onPress`. */
  trigger: ReactNode;
  /** The menu's content, usually `Option`s. */
  dropdown: ReactNode;
  /** Open state, controlled. Leave it out for the wrapper to keep its own. */
  open?: boolean;
  /** Another name for `open`; `open` wins when both are set. */
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Defaults to `"bottom-start"`, as in core. */
  placement?: Placement;
  /** Closes the menu when an `Option` is pressed. Defaults to true, as in core. */
  closeAfterClick?: boolean;
  /** Called with a pressed `Option`'s value. */
  onSelect?: (value: string) => void;
  selectedOption?: string;
  /** The trigger fills its container's width and the menu matches it. */
  fillWidth?: boolean;
  /** In rem, as core's. */
  minWidth?: number;
  maxWidth?: number;
  /** In points, as core's. */
  minHeight?: number;
  /** Makes the trigger ignore presses, as core's `disableTriggerClick`; `open` still works. */
  disableTriggerClick?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Core's `DropdownWrapper`: a trigger that opens a menu under it (or above,
 * when there is no room), measured with `measureInWindow` and drawn in a
 * transparent `Modal` over the screen.
 */
export function DropdownWrapper({
  trigger,
  dropdown,
  open: openProp,
  isOpen,
  onOpenChange,
  placement = "bottom-start",
  closeAfterClick = true,
  onSelect,
  selectedOption,
  fillWidth = false,
  minWidth,
  maxWidth,
  minHeight,
  disableTriggerClick = false,
  style,
}: DropdownWrapperProps) {
  const theme = useTheme();
  const ref = useRef<ViewRef>(null);
  const [local, setLocal] = useState(false);
  const controlled = openProp ?? isOpen;
  const open = controlled ?? local;
  const [anchor, setAnchor] = useState<Rect | null>(null);

  const setOpen = (next: boolean) => {
    if (controlled === undefined) setLocal(next);
    onOpenChange?.(next);
  };
  const toggle = () => {
    if (!disableTriggerClick) setOpen(!open);
  };

  // Measured each time it opens, so a scrolled or rotated screen still lines up.
  useEffect(() => {
    if (!open) return;
    ref.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
  }, [open]);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[{ alignSelf: fillWidth ? "stretch" : "flex-start" }, style]}
    >
      <Pressable
        accessibilityRole="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disableTriggerClick}
        onPress={toggle}
      >
        {chainPress(trigger, "onPress", toggle)}
      </Pressable>
      <MenuLayer
        open={open}
        onClose={() => setOpen(false)}
        anchor={anchor}
        placement={placement}
        gap={theme.space("4")}
        minWidth={minWidth}
        maxWidth={maxWidth}
        minHeight={minHeight}
        matchWidth={fillWidth}
        selectedOption={selectedOption}
        onSelect={(value) => {
          onSelect?.(value);
          if (closeAfterClick) setOpen(false);
        }}
      >
        {dropdown}
      </MenuLayer>
    </View>
  );
}
