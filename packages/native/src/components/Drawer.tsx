import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import { IconButton } from "./IconButton";
import { Scrim } from "./Scrim";
import { Heading, Text } from "./Text";
import { useReduceMotion } from "./useReduceMotion";

export interface DrawerProps {
  /** Whether the drawer is open. The drawer never closes itself: `onClose` asks. */
  open: boolean;
  /** Called on the back button, a tap on the backdrop and the close button. */
  onClose: () => void;
  /** The edge the drawer slides in from. */
  side?: "left" | "right" | "top" | "bottom";
  /**
   * The width of a `left` or `right` drawer, the maximum height of a `top` or
   * `bottom` one: 20, 28 or 40 rem as in core, never wider than the screen
   * less the inset. `full` covers the screen, less the inset.
   */
  size?: "s" | "m" | "l" | "full";
  title?: ReactNode;
  description?: ReactNode;
  /** Actions pinned to the bottom of the drawer, below the scrolling content. */
  footer?: ReactNode;
  /** Show the close button in the corner. Defaults to true, as in core. */
  showClose?: boolean;
  /** A tap on the backdrop closes the drawer. Defaults to true, as in core. */
  closeOnClickaway?: boolean;
  /** No header and no padding: the children reach the edges. For a navigation list or media. */
  flush?: boolean;
  "aria-label"?: string;
  children?: ReactNode;
  style?: ViewStyle;
}

const SIZES = { s: 20, m: 28, l: 40 } as const;

/**
 * Core's `Drawer`: a panel that slides in from one edge and floats a step in
 * from it, clear of the notch and the home indicator. Same props as core.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  size = "m",
  title,
  description,
  footer,
  showClose = true,
  closeOnClickaway = true,
  flush = false,
  "aria-label": ariaLabel,
  children,
  style,
}: DrawerProps) {
  const theme = useTheme();
  const window = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  // Stays mounted through the slide out, then unmounts.
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
    const animation = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: reduceMotion ? 0 : 240,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
    return () => animation.stop();
  }, [open, progress, reduceMotion]);

  const inset = theme.space("8");
  const edges = {
    top: Math.max(inset, theme.insets.top),
    right: Math.max(inset, theme.insets.right),
    bottom: Math.max(inset, theme.insets.bottom),
    left: Math.max(inset, theme.insets.left),
  };
  const horizontal = side === "left" || side === "right";
  const room = horizontal
    ? window.width - edges.left - edges.right
    : window.height - edges.top - edges.bottom;
  const extent = size === "full" ? room : Math.min(theme.space(SIZES[size]), room);

  // Slides from beyond its edge, as core's `translateX(calc(-100% - inset))`.
  const distance = extent + edges[side];
  const offscreen = side === "left" || side === "top" ? -distance : distance;
  const translate = progress.interpolate({ inputRange: [0, 1], outputRange: [offscreen, 0] });

  const panel: ViewStyle = {
    position: "absolute",
    backgroundColor: theme.background("neutral-weak"),
    borderColor: theme.border("neutral-medium"),
    borderWidth: 1,
    borderRadius: theme.radius("xl"),
    overflow: "hidden",
    ...theme.shadow("xl"),
    ...(horizontal
      ? { top: edges.top, bottom: edges.bottom, width: extent, [side]: edges[side] }
      : {
          left: edges.left,
          right: edges.right,
          [side]: edges[side],
          ...(size === "full" ? { height: extent } : { maxHeight: extent }),
        }),
  };
  const showHeader = !flush && !!(title || description || showClose);

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <Scrim theme={theme} progress={progress} onPress={closeOnClickaway ? onClose : undefined} />
      <Animated.View
        accessibilityViewIsModal
        aria-modal
        aria-label={ariaLabel}
        role="dialog"
        style={[
          panel,
          { transform: [horizontal ? { translateX: translate } : { translateY: translate }] },
          style,
        ]}
      >
        {showHeader && (
          <Row paddingX="24" paddingTop="20" paddingBottom="12" gap="12" vertical="start">
            <Column flex={1} gap="4">
              {title && <Heading textVariant="heading-strong-l">{title}</Heading>}
              {description && (
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {description}
                </Text>
              )}
            </Column>
            {showClose && (
              <IconButton icon="close" variant="tertiary" aria-label="Close" onPress={onClose} />
            )}
          </Row>
        )}
        <ScrollView
          style={{ flexGrow: horizontal || size === "full" ? 1 : 0 }}
          contentContainerStyle={
            flush
              ? undefined
              : {
                  paddingHorizontal: theme.space("24"),
                  paddingTop: showHeader ? 0 : theme.space("24"),
                  paddingBottom: theme.space("24"),
                }
          }
        >
          {children}
        </ScrollView>
        {flush && showClose && (
          <View style={{ position: "absolute", top: theme.space("12"), right: theme.space("12") }}>
            <IconButton icon="close" variant="secondary" aria-label="Close" onPress={onClose} />
          </View>
        )}
        {footer && (
          <Row paddingX="24" paddingY="16" gap="8" horizontal="end" borderTop="neutral-alpha-weak">
            {footer}
          </Row>
        )}
      </Animated.View>
    </Modal>
  );
}
