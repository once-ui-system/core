import { Row } from "@once-ui-system/core";
import { Sidebar } from "@/product";
import React, { memo } from "react";

const DocsLayout = memo(({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Row fillWidth gap="24">
      <Sidebar m={{hide: true}} />
      {children}
    </Row>
  );
});

DocsLayout.displayName = 'RoadmapLayout';

export default DocsLayout;