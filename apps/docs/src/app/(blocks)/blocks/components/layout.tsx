import { Breadcrumbs, type CSSUnit, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { ComponentProps, ReactNode } from "react";
import { Pagination } from "./Pagination";

interface DocsLayoutProps {
  title?: string;
  description?: ReactNode;
  /** Trail above the title, e.g. Blocks › Sections › Hero. */
  breadcrumbs?: ComponentProps<typeof Breadcrumbs>["items"];
  /** Small detail aligned to the end of the title row, e.g. the variant count. */
  aside?: ReactNode;
  maxWidth?: number | CSSUnit | "xs" | "s" | "m" | "l" | "xl";
  children: ReactNode;
  pagination?: boolean;
  align?: "center";
}

const DocsLayout: React.FC<DocsLayoutProps> = ({
  title,
  description,
  breadcrumbs,
  aside,
  maxWidth = "96rem",
  children,
  pagination = true,
  align,
}) => {
  return (
    <Row fillWidth horizontal="center">
      <Column as="main" id="main-content" gap="48" maxWidth={maxWidth} padding="l">
        {(title || description) && (
          <Column fillWidth gap="16" paddingX="s">
            {breadcrumbs && breadcrumbs.length > 1 && (
              <Breadcrumbs items={breadcrumbs} aria-label="Breadcrumb" />
            )}
            <Row fillWidth wrap gap="16" horizontal="between" style={{ alignItems: "flex-end" }}>
              <Column gap="8" flex={1} minWidth="20rem">
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
              {aside}
            </Row>
          </Column>
        )}
        {children}
        <Pagination pagination={pagination} />
      </Column>
    </Row>
  );
};

export default DocsLayout;
