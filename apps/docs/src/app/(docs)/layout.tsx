import { Row } from "@once-ui-system/core";
import { Sidebar } from "@/product";
import React from "react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Row fillWidth gap="24">
      <Sidebar m={{hide: true}} />
      {children}
    </Row>
  );
}