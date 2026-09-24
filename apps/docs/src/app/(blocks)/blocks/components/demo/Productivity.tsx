"use client";

import { Row } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import { Productivity1, Productivity2, Productivity3, Roadmap1, Sidebar2 } from "@/blocks/modules";

const examples: BlockExampleDef[] = [
  {
    id: "Productivity3",
    files: ["Productivity3.tsx"],
    render: () => (
      <Row fillWidth minHeight="100%" fitHeight background="page" paddingX="8" paddingY="12">
        <Productivity3 />
      </Row>
    ),
  },
  {
    id: "Productivity2",
    files: ["Productivity2.tsx"],
    render: () => (
      <Row fillWidth minHeight="100%" fitHeight background="page" paddingX="8" paddingY="12">
        <Productivity2 />
      </Row>
    ),
  },
  {
    id: "Roadmap1",
    files: ["Roadmap1.tsx", "Sidebar2.tsx", { file: "roadmap1content.ts", label: "Data" }],
    render: () => (
      <Row fillWidth minHeight="100%" fitHeight background="page" gap="32" paddingX="8">
        <Sidebar2 position="sticky" m={{ hide: true }} />
        <Row paddingY="12" fillWidth>
          <Roadmap1 />
        </Row>
      </Row>
    ),
  },
  {
    id: "Productivity1",
    files: ["Productivity1.tsx", "Sidebar2.tsx"],
    render: () => (
      <Row fillWidth minHeight="100%" fitHeight background="page">
        <Productivity1 />
      </Row>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="productivity" examples={examples} />;

export default Docs;
