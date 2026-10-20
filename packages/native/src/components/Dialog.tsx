import { type ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import { IconButton } from "./IconButton";
import { Scrim } from "./Scrim";
import { Heading, Text } from "./Text";
import { useReduceMotion } from "./useReduceMotion";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * Shows the close button. On by default, as in core 3.0 (2.x's
   * `hideClose` is `showClose={false}`); the back gesture and a tap on the
   * backdrop still close it.
   */
  showClose?: boolean;
  /**
   * The dialog's shape. `"sheet"` (the default on a phone) rises from the
   * bottom edge; `"center"` is a card in the middle of the screen, core's
   * default on the web.
   */
  variant?: "center" | "sheet";
  /** Drawn inside the overlay, behind the panel: an image or a tint. Position it yourself. */
  backdrop?: ReactNode;
  /** The panel's minimum height, in points (px, as in core). */
  minHeight?: number;
  /** Called with the panel's height whenever it changes. */
  onHeightChange?: (height: number) => void;
  /** A tap on the backdrop closes the dialog. Defaults to true, as in core. */
  closeOnClickaway?: boolean;
  /** Edge to edge, without the sheet's padding, as core's `flush`. */
  flush?: boolean;
  style?: ViewStyle;
}

/**
 * Core's `Dialog`, shown as a bottom sheet by default: the shape phones use
 * for a modal task (`variant="center"` for a card in the middle). Same props
 * (`open`, `onClose`, `title`, `description`, `footer`, `showClose`); the
 * Android back button closes it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  showClose = true,
  variant = "sheet",
  backdrop,
  minHeight,
  onHeightChange,
  closeOnClickaway = true,
  flush = false,
  style,
}: DialogProps) {
  const theme = useTheme();
  const pad = flush ? 0 : theme.space("24");
  const sheet = variant === "sheet";

  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  // Stays mounted through the slide down, then unmounts.
  const [mounted, setMounted] = useState(open);
  const [height, setHeight] = useState(0);

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

  // The scrim fades while the sheet slides up from below its own height (a centred card fades in).
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height || 1000, 0],
  });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: sheet ? "flex-end" : "center",
          padding: sheet ? 0 : theme.space("16"),
        }}
      >
        <Scrim theme={theme} progress={progress} onPress={closeOnClickaway ? onClose : undefined} />
        {backdrop}
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => {
            setHeight(event.nativeEvent.layout.height);
            onHeightChange?.(event.nativeEvent.layout.height);
          }}
          aria-modal
          role="dialog"
          style={[
            {
              maxHeight: "90%",
              minHeight,
              backgroundColor: theme.color("page-background"),
              borderColor: theme.color("neutral-border-medium"),
              borderWidth: 1,
              paddingTop: theme.space("8"),
              // Clear the home indicator: the sheet sits on the screen's bottom edge.
              paddingBottom: theme.insets.bottom,
            },
            sheet
              ? {
                  borderBottomWidth: 0,
                  borderTopLeftRadius: theme.radius("xl"),
                  borderTopRightRadius: theme.radius("xl"),
                  transform: [{ translateY }],
                }
              : { borderRadius: theme.radius("xl"), ...theme.shadow("xl"), opacity: progress },
            style,
          ]}
        >
          {/* The grabber, so the sheet reads as one on both platforms. */}
          {sheet && (
            <View
              style={{
                alignSelf: "center",
                width: theme.space("40"),
                height: theme.space("4"),
                borderRadius: 9999,
                backgroundColor: theme.color("neutral-alpha-medium"),
              }}
            />
          )}
          {(title || description || showClose) && (
            <Row paddingX="24" paddingTop="16" gap="12" vertical="start">
              <Column flex={1} gap="4">
                {title && <Heading textVariant="heading-strong-l">{title}</Heading>}
                {description && (
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {description}
                  </Text>
                )}
              </Column>
              {showClose && (
                <IconButton
                  icon="close"
                  size="m"
                  variant="tertiary"
                  tooltip="Close"
                  onPress={onClose}
                />
              )}
            </Row>
          )}
          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ padding: pad, paddingTop: flush ? 0 : theme.space("16") }}
          >
            {children}
          </ScrollView>
          {footer && (
            <Row
              paddingX="24"
              paddingTop="16"
              paddingBottom={sheet ? "32" : "24"}
              gap="8"
              horizontal="end"
              style={{ borderTopWidth: 1, borderColor: theme.color("neutral-border-weak") }}
            >
              {footer}
            </Row>
          )}
          {!footer && <View style={{ height: theme.space("16") }} />}
        </Animated.View>
      </View>
    </Modal>
  );
}
