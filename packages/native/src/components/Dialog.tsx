import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import { IconButton } from "./IconButton";
import { Heading, Text } from "./Text";

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

  return (
    <Modal
      visible={open}
      transparent
      animationType={sheet ? "slide" : "fade"}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: sheet ? "flex-end" : "center",
          padding: sheet ? 0 : theme.space("16"),
        }}
      >
        <Pressable
          accessibilityLabel="Close"
          accessible={closeOnClickaway}
          onPress={closeOnClickaway ? onClose : undefined}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.color("backdrop"),
          }}
        />
        {backdrop}
        <View
          accessibilityViewIsModal
          aria-modal
          role="dialog"
          onLayout={onHeightChange ? (e) => onHeightChange(e.nativeEvent.layout.height) : undefined}
          style={[
            {
              maxHeight: "90%",
              minHeight,
              backgroundColor: theme.color("page-background"),
              borderColor: theme.color("neutral-border-medium"),
              borderWidth: 1,
              paddingTop: theme.space("8"),
            },
            sheet
              ? {
                  borderBottomWidth: 0,
                  borderTopLeftRadius: theme.radius("xl"),
                  borderTopRightRadius: theme.radius("xl"),
                }
              : { borderRadius: theme.radius("xl"), ...theme.shadow("xl") },
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
        </View>
      </View>
    </Modal>
  );
}
