import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  type ReactNode,
  useContext,
} from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, type FlexProps } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";
import { Text, type TextProps } from "./Text";

export interface ListProps extends FlexProps {
  as?: "ul" | "ol";
  /** The first item's number, for a numbered list that does not count from 1. Ignored on `ul`. */
  start?: number;
  children?: ReactNode;
}

// Which list an item is in, and its place in it: React Native has no list markers to count.
const ListContext = createContext<{ ordered: boolean; number: number } | null>(null);

/**
 * Core's `List`: a column of `ListItem`s with bullets, or numbers when `as="ol"`.
 * The markers sit in the same 20-step indent the web's do.
 */
export const List: RefComponent<ListProps, ViewRef> = forwardRef<ViewRef, ListProps>(function List(
  { as = "ul", start = 1, children, ...props },
  ref,
) {
  let number = start;
  return (
    <Column ref={ref} role="list" fillWidth {...props}>
      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <ListContext.Provider value={{ ordered: as === "ol", number: number++ }}>
            {child}
          </ListContext.Provider>
        ) : (
          child
        ),
      )}
    </Column>
  );
});

export interface ListItemProps extends TextProps {
  children?: ReactNode;
}

/** Text, or inline `Text`, can stay in one `Text`; anything else needs a `View`. */
function isInline(children: ReactNode) {
  return Children.toArray(children).every(
    (c) => typeof c === "string" || typeof c === "number" || (isValidElement(c) && c.type === Text),
  );
}

/** Core's `ListItem`: one line of a `List`, its marker in `neutral-on-background-weak`. */
export const ListItem: RefComponent<ListItemProps, ViewRef> = forwardRef<ViewRef, ListItemProps>(
  function ListItem({ children, variant = "body-default-m", ...props }, ref) {
    const theme = useTheme();
    const list = useContext(ListContext);
    const marker = list?.ordered ? `${list.number}.` : "•";
    const { style, ...text } = props;
    const styles = Array.isArray(style) ? style : style ? [style] : [];

    return (
      <View ref={ref} role="listitem" style={{ flexDirection: "row", alignSelf: "stretch" }}>
        {/* Right-aligned in the list's indent, as a browser draws an outside marker. */}
        <Text
          variant={variant}
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            minWidth: theme.space("20"),
            textAlign: "right",
            color: theme.color("neutral-on-background-weak"),
          }}
        >
          {marker}
        </Text>
        {isInline(children) ? (
          <Text variant={variant} paddingLeft="8" {...text} style={[{ flex: 1 }, ...styles]}>
            {children}
          </Text>
        ) : (
          <Column flex={1} paddingLeft="8">
            {children}
          </Column>
        )}
      </View>
    );
  },
);
