import { type ReactNode, useRef, useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Column, type FlexProps } from "./Flex";
import { Icon } from "./Icon";
import type { ViewRef } from "./refs";
import { Text } from "./Text";
import { touchSlop } from "./touch";

export interface InfoTipProps extends Omit<FlexProps, "children"> {
  /** The explanation. A sentence or two — anything longer wants a doc link. */
  children?: ReactNode;
  /** Icon size, matched to whatever text it sits beside. */
  size?: TShirtSizes;
  /** Names the icon for screen readers. */
  "aria-label"?: string;
}

// Icon.module.scss sizes, in static spacing steps.
const ICON = { xs: "16", s: "20", m: "24", l: "32", xl: "40" } as const;

type Box = { x: number; y: number; width: number; height: number };

/**
 * Core's `InfoTip`: a small info icon that shows a sentence of context. There
 * is no hover on a phone, so a tap opens the tip beside the icon and a tap
 * anywhere closes it. Screen readers hear the explanation as the icon's hint.
 */
export function InfoTip({
  children,
  size = "xs",
  "aria-label": ariaLabel = "More information",
  ...flex
}: InfoTipProps) {
  const theme = useTheme();
  const screen = useWindowDimensions();
  const iconRef = useRef<ViewRef>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Box | null>(null);
  const [tipWidth, setTipWidth] = useState(0);
  const px = theme.space(ICON[size]);
  const edge = theme.space("16");
  const gap = theme.space("8");
  const maxWidth = Math.min(theme.space(18), screen.width - edge * 2);

  const show = () => {
    setOpen(true);
    iconRef.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
  };

  // Centred on the icon, kept on screen; below it unless the icon is low down.
  const left = anchor
    ? Math.min(
        Math.max(edge, anchor.x + anchor.width / 2 - tipWidth / 2),
        screen.width - edge - tipWidth,
      )
    : edge;
  const below = !anchor || anchor.y + anchor.height < screen.height * 0.6;
  const place = anchor
    ? below
      ? { top: anchor.y + anchor.height + gap }
      : { bottom: screen.height - anchor.y + gap }
    : { top: screen.height / 3 };

  return (
    <>
      <Pressable
        ref={iconRef}
        accessibilityRole="button"
        accessibilityLabel={ariaLabel}
        accessibilityHint={typeof children === "string" ? children : undefined}
        aria-expanded={open}
        hitSlop={touchSlop(theme, px)}
        onPress={show}
        style={{ alignSelf: "flex-start", borderRadius: 9999 }}
      >
        <Icon name="info" size={size} onBackground="neutral-weak" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityLabel="Close"
          onPress={() => setOpen(false)}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View
          pointerEvents="box-none"
          onLayout={(event) => setTipWidth(event.nativeEvent.layout.width)}
          style={{ position: "absolute", left, maxWidth, ...place }}
        >
          <Column
            paddingY="8"
            paddingX="12"
            background="page"
            radius="m"
            border="neutral-medium"
            {...flex}
          >
            {typeof children === "string" || typeof children === "number" ? (
              <Text textVariant="label-default-s" onBackground="neutral-medium">
                {children}
              </Text>
            ) : (
              children
            )}
          </Column>
        </View>
      </Modal>
    </>
  );
}
