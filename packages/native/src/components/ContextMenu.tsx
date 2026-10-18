import { type ReactNode, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { chainPress, MenuLayer, type Placement } from "./DropdownWrapper";
import type { ViewRef } from "./refs";

export interface ContextMenuProps {
  /** What a long press opens the menu on. A pressable child keeps its own `onPress` and `onLongPress`. */
  children: ReactNode;
  /** The menu's content, usually `Option`s. */
  dropdown: ReactNode;
  /**
   * Where the menu opens against the press point, as in core: `"bottom-start"`,
   * the default, puts its top-left corner there. A menu that would run off
   * screen opens on the other side of the point.
   */
  placement?: Placement;
  /** The region around `children` fills its container's width. The menu keeps its own. */
  fillWidth?: boolean;
  /** In rem, as core's. Defaults to 12. */
  minWidth?: number;
  maxWidth?: number;
  /** In points, as core's. */
  minHeight?: number;
  onSelect?: (value: string) => void;
  /** Closes the menu when an `Option` is pressed. Defaults to true, as in core. */
  closeAfterClick?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedOption?: string;
  /** Long presses do nothing. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Core's `ContextMenu`: a long press on `children` opens a menu at the press
 * point, the phone's right-click. Same menu, `Modal` and placement rules as
 * `DropdownWrapper`.
 */
export function ContextMenu({
  children,
  dropdown,
  placement = "bottom-start",
  fillWidth = false,
  minWidth = 12,
  maxWidth,
  minHeight,
  onSelect,
  closeAfterClick = true,
  open: openProp,
  onOpenChange,
  selectedOption,
  disabled = false,
  style,
}: ContextMenuProps) {
  const ref = useRef<ViewRef>(null);
  const [local, setLocal] = useState(false);
  const open = openProp ?? local;
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setLocal(next);
    onOpenChange?.(next);
  };

  const openAt = (e: GestureResponderEvent) => {
    if (disabled) return;
    const { pageX, pageY } = e?.nativeEvent ?? {};
    if (typeof pageX === "number" && typeof pageY === "number") {
      setPoint({ x: pageX, y: pageY });
    } else {
      // A screen reader's long press has no point: open under the region, as
      // core does for a context menu opened from the keyboard.
      ref.current?.measureInWindow((x, y, _width, height) => setPoint({ x, y: y + height }));
    }
    setOpen(true);
  };

  return (
    <>
      <Pressable
        ref={ref}
        collapsable={false}
        // The children stay the screen reader's elements; the long press reaches them below.
        accessible={false}
        disabled={disabled}
        onLongPress={openAt}
        style={[
          { alignSelf: fillWidth ? "stretch" : "flex-start" },
          disabled && { opacity: 0.6 },
          style,
        ]}
      >
        {chainPress(children, "onLongPress", openAt)}
      </Pressable>
      <MenuLayer
        open={open}
        onClose={() => setOpen(false)}
        anchor={point && { ...point, width: 0, height: 0 }}
        placement={placement}
        gap={0}
        minWidth={minWidth}
        maxWidth={maxWidth}
        minHeight={minHeight}
        selectedOption={selectedOption}
        onSelect={(value) => {
          onSelect?.(value);
          if (closeAfterClick) setOpen(false);
        }}
      >
        {dropdown}
      </MenuLayer>
    </>
  );
}
