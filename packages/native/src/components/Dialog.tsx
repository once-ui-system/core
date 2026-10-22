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
  /** Hides the close button. The back gesture and a tap on the backdrop still close it. */
  hideClose?: boolean;
  /** A tap on the backdrop closes the dialog. Defaults to true, as in core. */
  closeOnClickaway?: boolean;
  /** Edge to edge, without the sheet's padding, as core's `flush`. */
  flush?: boolean;
  style?: ViewStyle;
}

/**
 * Core's `Dialog`, shown as a bottom sheet: the shape phones use for a modal
 * task. Same props (`open`, `onClose`, `title`, `description`, `footer`); the
 * Android back button closes it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  hideClose = false,
  closeOnClickaway = true,
  flush = false,
  style,
}: DialogProps) {
  const theme = useTheme();
  const pad = flush ? 0 : theme.space("24");

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

  // The scrim fades while the sheet slides up from below its own height.
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height || 1000, 0],
  });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Scrim theme={theme} progress={progress} onPress={closeOnClickaway ? onClose : undefined} />
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          aria-modal
          role="dialog"
          style={[
            {
              maxHeight: "90%",
              backgroundColor: theme.color("page-background"),
              borderColor: theme.color("neutral-border-medium"),
              borderWidth: 1,
              borderBottomWidth: 0,
              borderTopLeftRadius: theme.radius("xl"),
              borderTopRightRadius: theme.radius("xl"),
              paddingTop: theme.space("8"),
              // Clear the home indicator: the sheet sits on the screen's bottom edge.
              paddingBottom: theme.insets.bottom,
            },
            { transform: [{ translateY }] },
            style,
          ]}
        >
          {/* The grabber, so the sheet reads as one on both platforms. */}
          <View
            style={{
              alignSelf: "center",
              width: theme.space("40"),
              height: theme.space("4"),
              borderRadius: 9999,
              backgroundColor: theme.color("neutral-alpha-medium"),
            }}
          />
          {(title || description || !hideClose) && (
            <Row paddingX="24" paddingTop="16" gap="12" vertical="start">
              <Column flex={1} gap="4">
                {title && <Heading variant="heading-strong-l">{title}</Heading>}
                {description && (
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {description}
                  </Text>
                )}
              </Column>
              {!hideClose && (
                <IconButton icon="close" variant="tertiary" ariaLabel="Close" onPress={onClose} />
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
              paddingBottom="32"
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
