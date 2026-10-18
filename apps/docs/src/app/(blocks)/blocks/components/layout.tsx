import { type CSSUnit, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { ReactNode } from "react";
import { Pagination } from "./Pagination";

interface DocsLayoutProps {
  title?: string;
  description?: ReactNode;
  maxWidth?: number | CSSUnit | "xs" | "s" | "m" | "l" | "xl";
  children: ReactNode;
  pagination?: boolean;
  align?: "center";
}

const DocsLayout: React.FC<DocsLayoutProps> = ({
  title,
  description,
  maxWidth = "96rem",
  children,
  pagination = true,
  align,
}) => {
  return (
    <Row fillWidth horizontal="center">
      <Column as="main" gap="48" maxWidth={maxWidth} padding="l">
        {(title || description) && (
          <Column fillWidth gap="8" paddingX="s">
            <Heading align={align} textVariant="display-strong-xs">
              {title}
            </Heading>
            <Text
              align={align}
              textVariant="body-default-m"
              onBackground="neutral-medium"
              wrap="balance"
            >
              {description}
            </Text>
          </Column>
        )}
        {children}
        <Pagination pagination={pagination} />
      </Column>
    </Row>
  );
};

export default DocsLayout;
