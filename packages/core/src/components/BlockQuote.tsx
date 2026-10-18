import { forwardRef } from "react";
import type { FlexPropsOf } from "../interfaces.js";
import { Avatar } from "./Avatar.js";
import { Column } from "./Column.js";
import { Line } from "./Line.js";
import { Row } from "./Row.js";
import { SmartLink } from "./SmartLink.js";
import { Text } from "./Text.js";

interface BlockQuoteProps extends FlexPropsOf<"blockquote"> {
  children: React.ReactNode;
  preline?: React.ReactNode;
  subline?: React.ReactNode;
  separator?: "top" | "bottom" | "both" | "none";
  author?: {
    name?: React.ReactNode;
    avatar?: string;
  };
  link?: { href: string; label: string };
  style?: React.CSSProperties;
  className?: string;
  align?: "center" | "left" | "right";
}

const BlockQuote = forwardRef<HTMLQuoteElement, BlockQuoteProps>(
  (
    {
      children,
      className,
      style,
      preline,
      subline,
      author,
      link,
      align = "center",
      separator = "both",
      ...flex
    },
    ref,
  ) => {
    return (
      <Column fillWidth horizontal="center" gap="24">
        {(separator === "top" || separator === "both") && (
          <Row fillWidth horizontal="center">
            <Line width="40" />
          </Row>
        )}
        <Column
          ref={ref}
          as="blockquote"
          fillWidth
          marginY="32"
          marginX="0"
          horizontal={align === "left" ? "start" : align === "right" ? "end" : "center"}
          align={align}
          style={style}
          className={className}
          {...flex}
        >
          {preline && (
            <Text onBackground="neutral-weak" marginBottom="32">
              {preline}
            </Text>
          )}
          {/* A div, not Text's default span, so the quote can hold
              paragraphs: `<p>` inside a span is invalid HTML. As a flex item
              the span was laid out as a block already. */}
          <Text as="div" textVariant="heading-strong-xl" wrap="balance">
            {children}
          </Text>
          {subline && (
            <Text onBackground="neutral-weak" marginTop="24">
              {subline}
            </Text>
          )}
          {(author || link) && (
            <Row gap="12" center marginTop="32">
              —{author?.avatar && <Avatar size="s" src={author?.avatar} />}
              {author?.name && <Text textVariant="label-default-s">{author?.name}</Text>}
              {link?.href && (
                <Row as="cite">
                  <SmartLink
                    unstyled
                    href={
                      link?.href &&
                      (/^https?:\/\//.test(link.href) ? link.href : `https://${link.href}`)
                    }
                  >
                    <Text textVariant="label-default-s">{link?.label || link?.href}</Text>
                  </SmartLink>
                </Row>
              )}
            </Row>
          )}
        </Column>
        {(separator === "bottom" || separator === "both") && (
          <Row fillWidth horizontal="center">
            <Line width="40" />
          </Row>
        )}
      </Column>
    );
  },
);

BlockQuote.displayName = "BlockQuote";

export { BlockQuote };
