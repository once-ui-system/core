import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Row } from "./Flex";
import { type IconSlot, renderIcon } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { touchSlop } from "./touch";

export interface ChipProps {
  label: string;
  selected?: boolean;
  /** An icon name as in core, or any element. */
  prefixIcon?: IconSlot;
  /** Shows a remove button. */
  onRemove?: () => void;
  onPress?: () => void;
  /** Core's name for `onPress`; both work. */
  onClick?: () => void;
  style?: ViewStyle;
  /** Finds the chip in end-to-end tests; on the pressable when it has a handler. */
  testID?: string;
}

/** Core's `Chip`: a rounded, selectable label, optionally removable. */
export function Chip({
  label,
  selected = true,
  prefixIcon,
  onRemove,
  onPress,
  onClick,
  style,
  testID,
}: ChipProps) {
  const theme = useTheme();
  const handler = onPress ?? onClick;
  const color = theme.onBackground(selected ? "brand-strong" : "neutral-strong");
  const height = theme.space("32");
  const chip = (pressed: boolean) => (
    <Row
      gap="4"
      vertical="center"
      radius="full"
      paddingX="8"
      paddingY="4"
      background={
        selected ? "brand-alpha-weak" : pressed ? "neutral-alpha-medium" : "neutral-alpha-weak"
      }
      border={selected ? "brand-alpha-medium" : "neutral-alpha-medium"}
      style={{ minHeight: height }}
    >
      {renderIcon(prefixIcon, "xs", color)}
      <Text variant="body-default-s" paddingX="4" style={{ color }} numberOfLines={1}>
        {label}
      </Text>
      {onRemove && (
        <IconButton
          icon="close"
          variant="ghost"
          size="s"
          ariaLabel={`Remove ${label}`}
          onPress={onRemove}
        />
      )}
    </Row>
  );
  // Only a chip with a handler is a button; a removable one holds its own.
  if (!handler)
    return (
      <View style={[{ alignSelf: "flex-start" }, style]} testID={testID}>
        {chip(false)}
      </View>
    );
  return (
    <Pressable
      accessibilityRole="button"
      aria-selected={selected}
      testID={testID}
      onPress={handler}
      hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
      style={[{ alignSelf: "flex-start" }, style]}
    >
      {({ pressed }) => chip(pressed)}
    </Pressable>
  );
}
