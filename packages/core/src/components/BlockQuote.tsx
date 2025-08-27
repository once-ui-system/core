import { forwardRef } from "react";
import { Avatar, Column, Line, Row, SmartLink, Text } from ".";

interface BlockQuoteProps extends React.ComponentProps<typeof Column> {
  children: React.ReactNode;
  preline?: React.ReactNode;
  subline?: React.ReactNode;
  separator?: "top" | "bottom" | "both" | "none";
  author?: {
    name?: React.ReactNode,
    avatar?: string,
  };
  link?: { href: string, label: string };
  style?: React.CSSProperties;
  className?: string;
  align?: "center" | "left" | "right";
}

const BlockQuote = forwardRef<HTMLDivElement, BlockQuoteProps>(
  ({ children, className, style, preline, subline, author, link, align = "center", separator = "both", ...flex }, ref) => {
    return (
      <Column fillWidth horizontal="center" gap="24">
        {(separator === "top" || separator === "both") && (
          <Row fillWidth horizontal="center">
            <Line width="40"/>
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
              —
              {author?.avatar && (
                <Avatar size="s" src={author?.avatar} />
              )}
              {author?.name && (
                <Text variant="label-default-s">{author?.name}</Text>
              )}
              {link?.href && (
                <Row as="cite">
                  <SmartLink
                    unstyled
                    href={link?.href && (/^https?:\/\//.test(link.href) ? link.href : `https://${link.href}`)}
                  >
                    <Text variant="label-default-s">{link?.label || link?.href}</Text>
                  </SmartLink>
                </Row>
              )}
            </Row>
          )}
        </Column>
        {(separator === "bottom" || separator === "both") && (
          <Row fillWidth horizontal="center">
            <Line width="40"/>
          </Row>
        )}
      </Column>
    );
  },
);

BlockQuote.displayName = "BlockQuote";
export { BlockQuote };
