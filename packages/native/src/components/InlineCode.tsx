import { forwardRef, type ReactNode } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { codeTextStyle } from "./codeTokens";
import type { RefComponent, TextRef } from "./refs";
import { Text, type TextProps } from "./Text";

export interface InlineCodeProps
  extends Omit<TextProps, "variant" | "family" | "size" | "weight" | "children"> {
  children: ReactNode;
}

/**
 * Core's `InlineCode`: code in a sentence, in the code font on a weak tint
 * with a hairline border. A `Text`, so it nests in a paragraph's `Text`.
 */
export const InlineCode: RefComponent<InlineCodeProps, TextRef> = forwardRef<
  TextRef,
  InlineCodeProps
>(function InlineCode({ children, style, ...rest }, ref) {
  const theme = useTheme();
  return (
    <Text
      ref={ref}
      {...rest}
      style={[
        // Core sets 80% of the text around it; a nested `Text` cannot read
        // its parent's size, so this is the label-s size core's `code-s` uses.
        codeTextStyle(theme, "label-default-s"),
        {
          backgroundColor: theme.color("neutral-alpha-weak"),
          // Border, radius and padding show on a standalone InlineCode; React
          // Native ignores them on a `Text` nested in another, as in a sentence.
          borderColor: theme.color("neutral-alpha-medium"),
          borderWidth: 1,
          borderRadius: theme.radius("s"),
          paddingHorizontal: theme.space("4"),
          paddingVertical: theme.space("1"),
          alignSelf: "flex-start",
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      {children}
    </Text>
  );
});
