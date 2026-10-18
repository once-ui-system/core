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
  /** With `onToggle` the caller owns the state; without it, only the first state. */
  open?: boolean;
  onToggle?: () => void;
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
    open = false,
    onToggle,
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
  const [local, setLocal] = useState(open);
  useEffect(() => setLocal(open), [open]);
  const isOpen = onToggle ? open : local;

  // LayoutAnimation eases the content's height on the next layout pass.
  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const toggle = () => {
    animate();
    if (onToggle) onToggle();
    else setLocal((prev) => !prev);
  };
  useImperativeHandle(ref, () => ({
    toggle,
    open: () => {
      animate();
      setLocal(true);
    },
    close: () => {
      animate();
      setLocal(false);
    },
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
              <Text variant="heading-strong-s">{title}</Text>
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
