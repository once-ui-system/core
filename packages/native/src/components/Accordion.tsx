import {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Animated, LayoutAnimation, Pressable, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { CondensedTShirtSizes } from "../types";
import { Column, type FlexProps, Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import type { RefComponent } from "./refs";
import { Text } from "./Text";

export interface AccordionHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export interface AccordionProps extends Omit<FlexProps, "radius"> {
  title: ReactNode;
  children: ReactNode;
  icon?: IconName;
  /** Degrees the icon turns while open. */
  iconRotation?: number;
  size?: CondensedTShirtSizes;
  radius?: "xs" | "s" | "m" | "l" | "xl" | "full";
  /** With `onOpenChange` the caller owns the state; without it, only the first state. */
  open?: boolean;
  /** Core 3.0's name for the first state when the accordion owns it. */
  defaultOpen?: boolean;
  /** Core 3.0's change handler: called with the next state. */
  onOpenChange?: (open: boolean) => void;
  headerProps?: FlexProps;
  contentProps?: FlexProps;
  toggleOnHeaderClick?: boolean;
  style?: ViewStyle;
}

/** Core's `Accordion`: a header that shows and hides the content under it. */
export const Accordion: RefComponent<AccordionProps, AccordionHandle> = forwardRef<
  AccordionHandle,
  AccordionProps
>(function Accordion(
  {
    title,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    iconRotation = 180,
    radius = "m",
    icon = "chevronDown",
    size = "m",
    style,
    headerProps,
    contentProps,
    toggleOnHeaderClick = true,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [local, setLocal] = useState(open ?? defaultOpen);
  useEffect(() => {
    if (open !== undefined) setLocal(open);
  }, [open]);
  const controlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = controlled ? open : local;

  // LayoutAnimation eases the content's height on the next layout pass.
  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const set = (next: boolean) => {
    if (next === isOpen) return;
    animate();
    onOpenChange?.(next);
    if (!controlled) setLocal(next);
  };
  const toggle = () => set(!isOpen);
  useImperativeHandle(ref, () => ({
    toggle,
    open: () => set(true),
    close: () => set(false),
  }));

  const turn = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(turn, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, turn]);

  const paddingY = size === "s" ? "8" : size === "m" ? "12" : "16";
  const paddingX = size === "s" ? "12" : size === "m" ? "16" : "20";
  const { style: headerStyle, ...header } = headerProps ?? {};

  return (
    <Column fillWidth>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        aria-expanded={isOpen}
        disabled={!toggleOnHeaderClick}
        onPress={toggle}
        style={({ pressed }) => ({
          borderRadius: theme.radius(radius),
          backgroundColor: pressed ? theme.color("neutral-alpha-weak") : "transparent",
        })}
      >
        <Row
          paddingY={paddingY}
          paddingX={paddingX}
          vertical="center"
          horizontal="between"
          gap="8"
          {...header}
          style={[...(Array.isArray(headerStyle) ? headerStyle : [headerStyle ?? {}]), style ?? {}]}
        >
          <Row flex={1}>
            {typeof title === "string" || typeof title === "number" ? (
              <Text textVariant="heading-strong-s">{title}</Text>
            ) : (
              title
            )}
          </Row>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: turn.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", `${iconRotation}deg`],
                  }),
                },
              ],
            }}
          >
            <Icon
              name={icon}
              size={size === "s" ? "xs" : "s"}
              onBackground={isOpen ? "neutral-strong" : "neutral-weak"}
            />
          </Animated.View>
        </Row>
      </Pressable>
      {/* Kept mounted while closed, as in core, so the content keeps its state. */}
      <Column
        fillWidth
        aria-hidden={!isOpen}
        importantForAccessibility={isOpen ? "auto" : "no-hide-descendants"}
        style={isOpen ? {} : { height: 0, overflow: "hidden" }}
      >
        <Column
          fillWidth
          paddingX={paddingX}
          paddingTop="8"
          paddingBottom="16"
          {...contentProps}
          {...rest}
        >
          {children}
        </Column>
      </Column>
    </Column>
  );
});
