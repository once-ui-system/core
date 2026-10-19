import { forwardRef, type ReactNode } from "react";
import { Linking, Pressable } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Avatar } from "./Avatar";
import { Column, type FlexProps, Row } from "./Flex";
import { Line } from "./Line";
import type { RefComponent, ViewRef } from "./refs";
import { Text } from "./Text";

export interface BlockQuoteProps extends FlexProps {
  children: ReactNode;
  preline?: ReactNode;
  subline?: ReactNode;
  separator?: "top" | "bottom" | "both" | "none";
  author?: {
    name?: ReactNode;
    avatar?: string;
  };
  /** The source, opened in the browser when pressed. A bare domain gets `https://`. */
  link?: { href: string; label: string };
  align?: "center" | "left" | "right";
}

const HORIZONTAL = { left: "start", center: "center", right: "end" } as const;

/** Core's `BlockQuote`: a large quote between short rules, with who said it and where. */
export const BlockQuote: RefComponent<BlockQuoteProps, ViewRef> = forwardRef<
  ViewRef,
  BlockQuoteProps
>(function BlockQuote(
  { children, preline, subline, author, link, align = "center", separator = "both", ...flex },
  ref,
) {
  const theme = useTheme();
  const rule = (
    <Row fillWidth horizontal="center">
      <Line style={{ width: theme.space("40"), alignSelf: "center" }} />
    </Row>
  );
  const href = link?.href && (/^https?:\/\//.test(link.href) ? link.href : `https://${link.href}`);

  return (
    <Column fillWidth horizontal="center" gap="24">
      {(separator === "top" || separator === "both") && rule}
      <Column ref={ref} fillWidth marginY="32" horizontal={HORIZONTAL[align]} {...flex}>
        {preline && (
          <Text onBackground="neutral-weak" marginBottom="32" align={align}>
            {preline}
          </Text>
        )}
        {typeof children === "string" || typeof children === "number" ? (
          <Text variant="heading-strong-xl" align={align}>
            {children}
          </Text>
        ) : (
          children
        )}
        {subline && (
          <Text onBackground="neutral-weak" marginTop="24" align={align}>
            {subline}
          </Text>
        )}
        {(author || link) && (
          <Row gap="12" center marginTop="32" wrap>
            <Text>—</Text>
            {author?.avatar && <Avatar size="s" src={author.avatar} />}
            {author?.name && <Text variant="label-default-s">{author.name}</Text>}
            {href && (
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL(href)}
                hitSlop={theme.space("12")}
              >
                <Text variant="label-default-s">{link?.label || link?.href}</Text>
              </Pressable>
            )}
          </Row>
        )}
      </Column>
      {(separator === "bottom" || separator === "both") && rule}
    </Column>
  );
});
