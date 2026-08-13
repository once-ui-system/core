import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { Avatar } from "./Avatar";
import { Column } from "./Column";
import type { FlexComponentProps } from "./Flex";
import { Line } from "./Line";
import { Row } from "./Row";
import { SmartLink } from "./SmartLink";
import { Text } from "./Text";

export interface BlockQuoteAuthor {
  name?: ReactNode;
  avatar?: string;
}

export interface BlockQuoteLink {
  href: string;
  label?: string;
}

export interface BlockQuoteProps extends Omit<FlexComponentProps, "align"> {
  children: ReactNode;
  preline?: ReactNode;
  subline?: ReactNode;
  separator?: "top" | "bottom" | "both" | "none";
  author?: BlockQuoteAuthor;
  link?: BlockQuoteLink;
  style?: CSSProperties;
  className?: string;
  align?: "center" | "left" | "right";
}

const BlockQuote = forwardRef<HTMLDivElement, BlockQuoteProps>(
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
    const showTopSeparator = separator === "top" || separator === "both";
    const showBottomSeparator = separator === "bottom" || separator === "both";
    const horizontalAlign = align === "left" ? "start" : align === "right" ? "end" : "center";

    return (
      <Column fillWidth horizontal="center" gap="24">
        {showTopSeparator && (
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
          horizontal={horizontalAlign}
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
          <Text variant="heading-strong-xl" wrap="balance">
            {children}
          </Text>
          {subline && (
            <Text onBackground="neutral-weak" marginTop="24">
              {subline}
            </Text>
          )}
          {(author || link) && (
            <Row gap="12" center marginTop="32">
              —{author?.avatar && <Avatar size="s" src={author.avatar} />}
              {author?.name && <Text variant="label-default-s">{author.name}</Text>}
              {link?.href && (
                <Row as="cite">
                  <SmartLink
                    unstyled
                    href={/^https?:\/\//.test(link.href) ? link.href : `https://${link.href}`}
                  >
                    <Text variant="label-default-s">{link.label || link.href}</Text>
                  </SmartLink>
                </Row>
              )}
            </Row>
          )}
        </Column>
        {showBottomSeparator && (
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
