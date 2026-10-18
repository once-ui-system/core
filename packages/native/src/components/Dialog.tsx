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

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
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
        <View
          accessibilityViewIsModal
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
            },
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
        </View>
      </View>
    </Modal>
  );
}
